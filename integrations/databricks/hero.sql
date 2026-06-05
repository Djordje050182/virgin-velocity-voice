-- Demo "hero" records: George Sinclair on VA838 MEL->SYD tonight, one row per Velocity tier,
-- with points that match the on-screen demo card exactly. Idempotent: delete-then-insert.
-- Loaded into Databricks via load_hero.sh (SQL Statement Execution API).

DELETE FROM workspace.default.bookings        WHERE member_id IN ('VA8380001','VA8380002','VA8380003','VA8380004');
DELETE FROM workspace.default.velocity_members WHERE member_id IN ('VA8380001','VA8380002','VA8380003','VA8380004');

INSERT INTO workspace.default.velocity_members
  (member_id, first_name, last_name, tier, points_balance, status_credits, email, phone, home_airport, member_since, lifetime_flights)
VALUES
  ('VA8380001','George','Sinclair','Red',      2140, 180,'george.sinclair@example.com','+61400838001','MEL', DATE'2019-07-04', 26),
  ('VA8380002','George','Sinclair','Silver',  24800, 360,'george.sinclair@example.com','+61400838002','MEL', DATE'2016-02-19', 88),
  ('VA8380003','George','Sinclair','Gold',    82450, 720,'george.sinclair@example.com','+61400838003','MEL', DATE'2013-11-30',164),
  ('VA8380004','George','Sinclair','Platinum',318900,1480,'george.sinclair@example.com','+61400838004','MEL', DATE'2009-05-12',420);

INSERT INTO workspace.default.bookings
  (pnr, order_id, ticket_number, member_id, passenger, flight_number, origin, destination, departure_utc, arrival_utc, cabin, fare_class, pnr_status, ancillaries, channel, pss_source)
VALUES
  ('VA838R','ORD-838R0001','795-8380000001','VA8380001','George Sinclair','VA838','MEL','SYD',TIMESTAMP'2026-06-15 09:45:00',TIMESTAMP'2026-06-15 11:10:00','Economy', 'Y','HK','Seat selection',                 'virginaustralia.com','SabreSonic'),
  ('VA838S','ORD-838S0001','795-8380000002','VA8380002','George Sinclair','VA838','MEL','SYD',TIMESTAMP'2026-06-15 09:45:00',TIMESTAMP'2026-06-15 11:10:00','Economy', 'Y','HK','Seat selection, Checked bag 23kg', 'App','SabreSonic'),
  ('VA838G','ORD-838G0001','795-8380000003','VA8380003','George Sinclair','VA838','MEL','SYD',TIMESTAMP'2026-06-15 09:45:00',TIMESTAMP'2026-06-15 11:10:00','Economy', 'Y','HK','Lounge pass, Priority boarding',   'App','SabreSonic'),
  ('VA838P','ORD-838P0001','795-8380000004','VA8380004','George Sinclair','VA838','MEL','SYD',TIMESTAMP'2026-06-15 09:45:00',TIMESTAMP'2026-06-15 11:10:00','Business','J','HK','Lounge pass, Priority boarding',   'virginaustralia.com','SabreSonic');
