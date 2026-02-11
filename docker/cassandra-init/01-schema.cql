-- Cassandra schema for TelecomNexus telemetry
-- Keyspace and tables per PRD §6.2

CREATE KEYSPACE IF NOT EXISTS telecom_telemetry
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};

USE telecom_telemetry;

-- Device telemetry: time-series readings per device
CREATE TABLE IF NOT EXISTS device_telemetry (
  device_id text,
  date date,
  timestamp timestamp,
  cpu_percent double,
  memory_percent double,
  bandwidth_mbps double,
  packet_loss_percent double,
  temperature_c double,
  PRIMARY KEY ((device_id, date), timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC)
  AND default_time_to_live = 7776000;  -- 90 days

-- CDR (Call Detail Records) by customer
CREATE TABLE IF NOT EXISTS cdr_by_customer (
  customer_id text,
  month text,
  timestamp timestamp,
  call_id uuid,
  call_type text,
  duration_seconds int,
  status text,
  from_number text,
  to_number text,
  PRIMARY KEY ((customer_id, month), timestamp, call_id)
) WITH CLUSTERING ORDER BY (timestamp DESC, call_id ASC);

-- Daily usage aggregation by customer
CREATE TABLE IF NOT EXISTS usage_by_day (
  customer_id text,
  month text,
  date date,
  data_mb double,
  voice_minutes double,
  sms_count int,
  PRIMARY KEY ((customer_id, month), date)
) WITH CLUSTERING ORDER BY (date ASC);

-- Alerts by device
CREATE TABLE IF NOT EXISTS alerts_by_device (
  device_id text,
  month text,
  timestamp timestamp,
  alert_id uuid,
  severity text,
  status text,
  title text,
  description text,
  PRIMARY KEY ((device_id, month), timestamp, alert_id)
) WITH CLUSTERING ORDER BY (timestamp DESC, alert_id ASC);
