-- Databricks DDL for the Virgin × ElevenLabs demo lakehouse.
-- Run in a Databricks SQL editor after uploading the four CSVs (see README.md).
-- Catalog/schema names are suggestions — adjust to your Free Edition workspace.

CREATE CATALOG IF NOT EXISTS virgin_demo;
CREATE SCHEMA  IF NOT EXISTS virgin_demo.harmonised;
USE virgin_demo.harmonised;

-- Velocity loyalty (the customer) -------------------------------------------------
CREATE TABLE IF NOT EXISTS velocity_members (
  member_id        STRING,
  first_name       STRING,
  last_name        STRING,
  tier             STRING,   -- Red | Silver | Gold | Platinum
  points_balance   BIGINT,
  status_credits   INT,
  email            STRING,
  phone            STRING,
  home_airport     STRING,
  member_since     DATE,
  lifetime_flights INT
);

-- Sabre / SabreSonic PSS (the booking / order) -----------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  pnr            STRING,    -- Sabre record locator
  order_id       STRING,    -- SabreMosaic order id
  ticket_number  STRING,
  member_id      STRING,
  passenger      STRING,
  flight_number  STRING,
  origin         STRING,
  destination    STRING,
  departure_utc  TIMESTAMP,
  arrival_utc    TIMESTAMP,
  cabin          STRING,
  fare_class     STRING,
  pnr_status     STRING,
  ancillaries    STRING,
  channel        STRING,    -- direct / Amadeus GDS / Sabre GDS / NDC
  pss_source     STRING
);

-- Amadeus distribution + SabreMosaic offers (the fares) --------------------------
CREATE TABLE IF NOT EXISTS fare_offers (
  offer_id        STRING,
  origin          STRING,
  destination     STRING,
  cabin           STRING,
  fare_basis      STRING,
  base_fare_aud   DOUBLE,
  taxes_aud       DOUBLE,
  total_aud       DOUBLE,
  seats_available INT,
  source          STRING,   -- Amadeus EDIFACT/NDC | SabreMosaic | Sabre GDS
  valid_until     DATE
);

-- Operational disruptions (the trigger) ------------------------------------------
CREATE TABLE IF NOT EXISTS ops_events (
  event_id                 STRING,
  flight_number            STRING,
  origin                   STRING,
  destination              STRING,
  scheduled_departure_utc  TIMESTAMP,
  event_type               STRING,  -- DELAY | CANCELLED | DIVERSION
  delay_minutes            INT,
  new_departure_utc        TIMESTAMP,
  reason                   STRING,
  affected_pnrs            STRING,
  raised_utc               TIMESTAMP
);

-- The single query the ElevenLabs `lookup_velocity_member` tool will run:
--   harmonises loyalty + booking in one call (the "Databricks does the join" story).
-- SELECT m.first_name, m.last_name, m.tier, m.points_balance,
--        b.pnr, b.flight_number, b.origin, b.destination, b.departure_utc, b.cabin
-- FROM velocity_members m
-- JOIN bookings b ON b.member_id = m.member_id
-- WHERE m.member_id = :member_id
-- ORDER BY b.departure_utc LIMIT 1;
