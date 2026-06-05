#!/usr/bin/env python3
"""
Synthetic data generator for the Virgin × ElevenLabs pitch demo.

Produces realistic-but-fake data shaped to mirror Virgin Australia's real stack,
so an ElevenLabs voice agent can call into a Databricks lakehouse that *looks like*
a harmonised view of their vendor systems:

  velocity_members  -> Velocity loyalty (the customer + tier + points)
  bookings          -> Sabre / SabreSonic PSS  (PNR, ticket, order, flight)
  fare_offers       -> Amadeus distribution + SabreMosaic offers (fares, ancillaries)
  ops_events        -> operational disruptions (delay / cancel / diversion)

Deterministic: fixed seed -> identical output every run (safe for a repeatable demo).
Pure stdlib. Run:  python3 generate.py
"""
import csv, random, os
from datetime import datetime, timedelta

SEED = 42
random.seed(SEED)
OUT = os.path.dirname(os.path.abspath(__file__))

# Anchor "now" to a fixed date so the demo is reproducible (not wall-clock dependent).
NOW = datetime(2026, 6, 15, 6, 0, 0)

FIRST = ["George","Amelia","Liam","Sophie","Noah","Isla","Jack","Chloe","Oliver","Mia",
         "William","Ava","James","Grace","Henry","Ruby","Charlie","Zoe","Thomas","Lily",
         "Lachlan","Harper","Ethan","Matilda","Hugo","Evie","Archie","Audrey","Leo","Florence"]
LAST  = ["Sinclair","Nguyen","O'Brien","Patel","Wright","Kovac","Tanaka","Okafor","Rossi","Singh",
         "Fraser","Murphy","Chen","Walsh","Khan","Ferraro","Lim","Brooks","Costa","Haddad"]

# tier : (status credit floor, points multiplier-ish, lounge?)
TIERS = ["Red","Silver","Gold","Platinum"]
TIER_W = [0.55, 0.25, 0.15, 0.05]  # most members are Red

# Domestic + key international routes Virgin Australia actually flies / codeshares.
DOM = ["SYD","MEL","BNE","PER","ADL","OOL","CNS","HBA","CBR","DRW","TSV","MCY"]
INTL = ["DPS","NAN","AKL","SIN","HKG","DOH","LAX","APW","VLI","HND"]
AIRPORTS = DOM + INTL

CABINS = [("Economy","Y",0.78),("Economy","Y",0.78),("Economy","Y",0.78),
          ("Premium","W",0.14),("Business","J",0.08)]

ANCILLARIES = ["Extra legroom","Checked bag 23kg","Lounge pass","Priority boarding",
               "Seat selection","Wifi pass","Carbon offset", None, None]

DISRUPT = [("DELAY",0.55),("CANCELLED",0.30),("DIVERSION",0.15)]
REASONS = {"DELAY":["Inbound aircraft late","Weather (origin)","Crew connection","ATC flow control","Engineering check"],
           "CANCELLED":["Weather (destination)","Engineering — aircraft swap unavailable","Crew shortage","ATC ground stop"],
           "DIVERSION":["Weather at destination","Medical diversion","Runway closure"]}


def rid(n=6):
    return "".join(random.choice("ABCDEFGHJKLMNPQRSTUVWXYZ0123456789") for _ in range(n))

def pick_route():
    o = random.choice(AIRPORTS)
    d = random.choice([a for a in AIRPORTS if a != o])
    intl = o in INTL or d in INTL
    return o, d, intl

# ----------------------------------------------------------------------------- members
members = []
for i in range(50):
    tier = random.choices(TIERS, TIER_W)[0]
    fn, ln = random.choice(FIRST), random.choice(LAST)
    base_pts = {"Red":(500,40000),"Silver":(20000,90000),"Gold":(60000,180000),"Platinum":(150000,600000)}[tier]
    sc_floor = {"Red":0,"Silver":250,"Gold":500,"Platinum":1000}[tier]
    members.append({
        "member_id": f"VA{7000000+i*137:07d}",
        "first_name": fn,
        "last_name": ln,
        "tier": tier,
        "points_balance": random.randint(*base_pts),
        "status_credits": sc_floor + random.randint(0, 400),
        "email": f"{fn.lower()}.{ln.lower().replace(chr(39),'')}@example.com",
        "phone": f"+614{random.randint(10000000,99999999)}",
        "home_airport": random.choice(DOM),
        "member_since": (NOW - timedelta(days=random.randint(120, 4500))).date().isoformat(),
        "lifetime_flights": {"Red":random.randint(1,40),"Silver":random.randint(20,120),
                              "Gold":random.randint(80,300),"Platinum":random.randint(200,900)}[tier],
    })

# ----------------------------------------------------------------------------- bookings (Sabre PSS)
bookings = []
flight_pool = []  # (flight_no, date) we can later disrupt
for i in range(80):
    m = random.choice(members)
    o, d, intl = pick_route()
    cabin_name, cabin_class, _ = random.choices(CABINS, [c[2] for c in CABINS])[0]
    dep = NOW + timedelta(days=random.randint(-3, 21), hours=random.randint(5, 21), minutes=random.choice([0,5,10,30,45]))
    dur_h = random.uniform(6.5, 14) if intl else random.uniform(0.9, 5.5)
    flight_no = f"VA{random.randint(1,1999)}"
    ancs = [a for a in random.sample(ANCILLARIES, k=2) if a]
    bookings.append({
        "pnr": rid(6),
        "order_id": "ORD-" + rid(8),                 # SabreMosaic order id
        "ticket_number": f"795-{random.randint(1000000000,9999999999)}",
        "member_id": m["member_id"],
        "passenger": f'{m["first_name"]} {m["last_name"]}',
        "flight_number": flight_no,
        "origin": o,
        "destination": d,
        "departure_utc": dep.replace(microsecond=0).isoformat()+"Z",
        "arrival_utc": (dep + timedelta(hours=dur_h)).replace(microsecond=0).isoformat()+"Z",
        "cabin": cabin_name,
        "fare_class": cabin_class,
        "pnr_status": random.choices(["HK","HK","HK","TK","RR"],[0.7,0.1,0.1,0.05,0.05])[0],
        "ancillaries": "; ".join(ancs) if ancs else "",
        "channel": random.choices(["virginaustralia.com","App","Amadeus GDS","Sabre GDS","Travel agent (NDC)"],
                                  [0.4,0.25,0.12,0.13,0.10])[0],
        "pss_source": "SabreSonic",
    })
    flight_pool.append((flight_no, o, d, dep))

# ----------------------------------------------------------------------------- fare offers (Amadeus / Mosaic)
fares = []
for i in range(40):
    o, d, intl = pick_route()
    cabin_name, cabin_class, _ = random.choices(CABINS, [c[2] for c in CABINS])[0]
    base = random.randint(220, 480) if not intl else random.randint(650, 2400)
    base *= {"Economy":1.0,"Premium":1.9,"Business":3.4}[cabin_name]
    taxes = round(base * random.uniform(0.10, 0.22), 2)
    fares.append({
        "offer_id": "OF-" + rid(8),
        "origin": o,
        "destination": d,
        "cabin": cabin_name,
        "fare_basis": f"{cabin_class}{random.choice(['OW','RT'])}{random.randint(7,30)}AU",
        "base_fare_aud": round(base, 2),
        "taxes_aud": taxes,
        "total_aud": round(base + taxes, 2),
        "seats_available": random.randint(1, 9),
        "source": random.choices(["Amadeus EDIFACT","Amadeus NDC","SabreMosaic Offer","Sabre GDS"],
                                 [0.30,0.25,0.30,0.15])[0],
        "valid_until": (NOW + timedelta(days=random.randint(1, 14))).date().isoformat(),
    })

# ----------------------------------------------------------------------------- ops events (disruptions)
ops = []
# Guarantee a couple of "hero" disruptions on flights that have real bookings, near-term.
chosen = random.sample(flight_pool, k=12)
for i, (flight_no, o, d, dep) in enumerate(chosen):
    dtype = random.choices([x[0] for x in DISRUPT], [x[1] for x in DISRUPT])[0]
    affected = [b["pnr"] for b in bookings if b["flight_number"] == flight_no]
    delay = random.choice([45, 75, 90, 120, 180]) if dtype == "DELAY" else 0
    ops.append({
        "event_id": "OPS-" + rid(6),
        "flight_number": flight_no,
        "origin": o,
        "destination": d,
        "scheduled_departure_utc": dep.replace(microsecond=0).isoformat()+"Z",
        "event_type": dtype,
        "delay_minutes": delay,
        "new_departure_utc": (dep + timedelta(minutes=delay)).replace(microsecond=0).isoformat()+"Z" if delay else "",
        "reason": random.choice(REASONS[dtype]),
        "affected_pnrs": "; ".join(affected),
        "raised_utc": (dep - timedelta(hours=random.uniform(1.5, 6))).replace(microsecond=0).isoformat()+"Z",
    })

# --------------------------------------------------------------- demo "hero" records
# George Sinclair on VA838 MEL->SYD tonight, one per tier; points match the on-screen
# demo card exactly. Mirrors hero.sql (which loads these straight into Databricks).
HERO = [("VA8380001", "Red", 2140, 180, "2019-07-04", 26, "Economy", "Y", "Seat selection"),
        ("VA8380002", "Silver", 24800, 360, "2016-02-19", 88, "Economy", "Y", "Seat selection, Checked bag 23kg"),
        ("VA8380003", "Gold", 82450, 720, "2013-11-30", 164, "Economy", "Y", "Lounge pass, Priority boarding"),
        ("VA8380004", "Platinum", 318900, 1480, "2009-05-12", 420, "Business", "J", "Lounge pass, Priority boarding")]
for i, (mid, tier, pts, sc, since, lf, cabin, fclass, ancs) in enumerate(HERO, 1):
    members.append({
        "member_id": mid, "first_name": "George", "last_name": "Sinclair", "tier": tier,
        "points_balance": pts, "status_credits": sc, "email": "george.sinclair@example.com",
        "phone": f"+6140083800{i}", "home_airport": "MEL", "member_since": since, "lifetime_flights": lf,
    })
    bookings.append({
        "pnr": "VA838" + tier[0], "order_id": f"ORD-838{tier[0]}0001", "ticket_number": f"795-838000000{i}",
        "member_id": mid, "passenger": "George Sinclair", "flight_number": "VA838", "origin": "MEL",
        "destination": "SYD", "departure_utc": "2026-06-15T09:45:00Z", "arrival_utc": "2026-06-15T11:10:00Z",
        "cabin": cabin, "fare_class": fclass, "pnr_status": "HK", "ancillaries": ancs,
        "channel": "virginaustralia.com", "pss_source": "SabreSonic",
    })

# ----------------------------------------------------------------------------- write
def write(name, rows):
    path = os.path.join(OUT, name)
    with open(path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"  {name:24s} {len(rows):4d} rows")

print("Generating synthetic Virgin demo data (seed=%d):" % SEED)
write("velocity_members.csv", members)
write("bookings.csv", bookings)
write("fare_offers.csv", fares)
write("ops_events.csv", ops)
print("Done -> %s" % OUT)
