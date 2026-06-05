#!/usr/bin/env python3
"""
Unified local proxy for the Virgin demo. The browser's ElevenLabs client-tools call THIS;
it calls Databricks (read) and Salesforce (act). One thing to run on demo day.

  GET  /health                     -> {ok, warehouse, salesforce}
  GET  /member?id=VA...            -> Databricks: harmonised Velocity ⋈ Sabre record
  GET  /fulfil?action=rebook&...   -> Salesforce: create a real Service Cloud Case

Run:  cd integrations && python3 proxy.py     (serves on :8799)
Reads integrations/databricks/.env and integrations/salesforce/.env (both git-ignored).
"""
import json, os, time, threading, urllib.request, urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

HERE = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get("PROXY_PORT", "8799"))

def load_env(path):
    env = {}
    if not os.path.exists(path):
        return env
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env

DB = load_env(os.path.join(HERE, "databricks", ".env"))
SF = load_env(os.path.join(HERE, "salesforce", ".env"))

# ----------------------------------------------------------------- Databricks (read)
DB_BASE = f"https://{DB.get('DATABRICKS_HOST')}/api/2.0/sql/statements"
DB_HDRS = {"Authorization": f"Bearer {DB.get('DATABRICKS_TOKEN')}", "Content-Type": "application/json"}

def db(statement, params=None, wait="30s", poll_secs=45):
    body = {"warehouse_id": DB.get("DATABRICKS_WAREHOUSE_ID"), "wait_timeout": wait, "statement": statement}
    if params:
        body["parameters"] = params
    req = urllib.request.Request(DB_BASE, data=json.dumps(body).encode(), method="POST", headers=DB_HDRS)
    resp = json.load(urllib.request.urlopen(req, timeout=poll_secs + 5))
    sid, state = resp.get("statement_id"), resp.get("status", {}).get("state")
    deadline = time.time() + poll_secs
    while state in ("PENDING", "RUNNING") and time.time() < deadline:
        time.sleep(1.5)
        g = urllib.request.Request(f"{DB_BASE}/{sid}", headers={"Authorization": DB_HDRS["Authorization"]})
        resp = json.load(urllib.request.urlopen(g, timeout=poll_secs + 5))
        state = resp.get("status", {}).get("state")
    return resp

def lookup_member(member_id):
    sql = ("SELECT m.member_id, m.first_name, m.last_name, m.tier, m.points_balance, m.status_credits, "
           "b.pnr, b.flight_number, b.origin, b.destination, b.departure_utc, b.cabin "
           "FROM workspace.default.velocity_members m "
           "LEFT JOIN workspace.default.bookings b ON b.member_id = m.member_id "
           "WHERE m.member_id = :member_id ORDER BY b.departure_utc LIMIT 1")
    resp = db(sql, [{"name": "member_id", "value": member_id}])
    if resp.get("status", {}).get("state") != "SUCCEEDED":
        raise RuntimeError(resp.get("status", {}).get("error", {}).get("message", "query failed"))
    cols = [c["name"] for c in resp.get("manifest", {}).get("schema", {}).get("columns", [])]
    rows = resp.get("result", {}).get("data_array") or []
    if not rows:
        return None
    r = dict(zip(cols, rows[0]))
    pts = int(r.get("points_balance") or 0)
    fn = r.get("flight_number")
    return {"member_id": r.get("member_id"), "name": f"{r.get('first_name','')} {r.get('last_name','')}".strip(),
            "first_name": r.get("first_name"), "tier": r.get("tier"), "points": f"{pts:,}", "points_raw": pts,
            "status_credits": r.get("status_credits"), "pnr": r.get("pnr"), "flight_number": fn,
            "origin": r.get("origin"), "destination": r.get("destination"), "departure_utc": r.get("departure_utc"),
            "cabin": r.get("cabin"),
            "recent_booking": (f"{fn} {r.get('origin')}→{r.get('destination')}" if fn else None),
            "source": "Databricks (Velocity ⋈ Sabre)"}

# ----------------------------------------------------------------- Salesforce (act)
_sf = {"token": None, "instance": None, "exp": 0}

def sf_token():
    if _sf["token"] and time.time() < _sf["exp"]:
        return _sf["token"], _sf["instance"]
    data = urllib.parse.urlencode({"grant_type": "client_credentials",
                                   "client_id": SF.get("SF_CLIENT_ID"),
                                   "client_secret": SF.get("SF_CLIENT_SECRET")}).encode()
    req = urllib.request.Request(f"{SF['SF_LOGIN_URL']}/services/oauth2/token", data=data, method="POST",
                                 headers={"Content-Type": "application/x-www-form-urlencoded"})
    tok = json.load(urllib.request.urlopen(req, timeout=20))
    _sf.update(token=tok["access_token"], instance=tok["instance_url"], exp=time.time() + 6000)
    return _sf["token"], _sf["instance"]

# Map the demo's actions to Case fields.
ACTIONS = {
    "rebook":  ("Rebooking",        "rebook onto the next available service"),
    "refund":  ("Refund",           "process an automatic refund"),
    "case":    ("General enquiry",  "raise a service case"),
    "raise case": ("General enquiry", "raise a service case"),
}

def fulfil(action, member="George Sinclair", tier="Gold", flight="VA838", route="MEL→SYD"):
    label, desc = ACTIONS.get(action.lower(), ACTIONS["case"])
    token, instance = sf_token()
    payload = {
        "Subject": f"{flight} {route} — {label} (ElevenLabs voice)",
        "Description": f"Raised by Hannah (ElevenLabs voice agent) for {member}, Velocity {tier}. Action: {desc}.",
        "Origin": "Phone", "Status": "New", "Priority": "High",
    }
    req = urllib.request.Request(f"{instance}/services/data/{SF.get('SF_API_VERSION','v62.0')}/sobjects/Case",
                                 data=json.dumps(payload).encode(), method="POST",
                                 headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    res = json.load(urllib.request.urlopen(req, timeout=20))
    case_id = res.get("id")
    # read the human-friendly CaseNumber
    g = urllib.request.Request(f"{instance}/services/data/{SF.get('SF_API_VERSION','v62.0')}/sobjects/Case/{case_id}",
                               headers={"Authorization": f"Bearer {token}"})
    rec = json.load(urllib.request.urlopen(g, timeout=20))
    num = rec.get("CaseNumber", case_id)
    return {"status": "done", "action": action, "reference": num, "case_id": case_id,
            "message": f"{label} logged in Service Cloud as case {num}",
            "system": "Salesforce Service Cloud (live)"}

# ----------------------------------------------------------------- keep warehouse warm
_warm = {"state": "unknown"}
def keep_warm():
    while True:
        try:
            _warm["state"] = db("SELECT 1", wait="50s", poll_secs=55).get("status", {}).get("state", "unknown")
        except Exception as e:
            _warm["state"] = f"error: {e}"
        time.sleep(120)

# ----------------------------------------------------------------- HTTP
class Handler(BaseHTTPRequestHandler):
    def _send(self, code, payload):
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send(204, {})

    def do_GET(self):
        u = urlparse(self.path); q = parse_qs(u.query)
        try:
            if u.path == "/health":
                return self._send(200, {"ok": True, "warehouse": _warm["state"],
                                        "salesforce": bool(SF.get("SF_CLIENT_ID"))})
            if u.path == "/member":
                mid = (q.get("id") or [""])[0]
                if not mid:
                    return self._send(400, {"error": "missing ?id="})
                return self._send(200, lookup_member(mid) or {"error": "not found", "member_id": mid})
            if u.path == "/fulfil":
                return self._send(200, fulfil(
                    (q.get("action") or ["rebook"])[0], (q.get("member") or ["George Sinclair"])[0],
                    (q.get("tier") or ["Gold"])[0], (q.get("flight") or ["VA838"])[0],
                    (q.get("route") or ["MEL→SYD"])[0]))
            return self._send(404, {"error": "not found"})
        except Exception as e:
            return self._send(502, {"error": str(e)})

    def log_message(self, *a):
        pass

if __name__ == "__main__":
    threading.Thread(target=keep_warm, daemon=True).start()
    print(f"Virgin demo proxy on http://localhost:{PORT}")
    print(f"  /health · /member?id=VA8380003 · /fulfil?action=rebook")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
