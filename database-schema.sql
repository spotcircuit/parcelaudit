-- Complete database schema for Shipping Audit Platform

-- ==========================================
-- USERS & AUTHENTICATION
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  password_hash TEXT,
  name TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted'))
);

CREATE INDEX users_email_idx ON users(email);

-- ==========================================
-- CARRIER CONNECTIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS carrier_connections (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  carrier TEXT NOT NULL CHECK (carrier IN ('ups', 'fedex', 'dhl', 'usps')),
  account_number TEXT,
  api_key TEXT ENCRYPTED,
  api_secret TEXT ENCRYPTED,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, carrier, account_number)
);

CREATE INDEX carrier_connections_user_id_idx ON carrier_connections(user_id);

-- ==========================================
-- INVOICES
-- ==========================================

CREATE TABLE IF NOT EXISTS invoices (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  carrier TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  account_number TEXT,
  total_amount DECIMAL(10,2),
  audited_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'audited', 'disputed', 'resolved')),
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, carrier, invoice_number)
);

CREATE INDEX invoices_user_date_idx ON invoices(user_id, invoice_date DESC);
CREATE INDEX invoices_status_idx ON invoices(status);

-- ==========================================
-- SHIPMENTS
-- ==========================================

CREATE TABLE IF NOT EXISTS shipments (
  id BIGSERIAL PRIMARY KEY,
  invoice_id BIGINT REFERENCES invoices(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  tracking_number TEXT NOT NULL,
  carrier TEXT NOT NULL,
  
  -- Dates
  ship_date DATE,
  delivery_date DATE,
  promised_delivery_date DATE,
  
  -- Addresses
  origin_zip TEXT,
  destination_zip TEXT,
  origin_country TEXT DEFAULT 'US',
  destination_country TEXT DEFAULT 'US',
  
  -- Package details
  package_type TEXT,
  service_level TEXT,
  actual_weight DECIMAL(10,2),
  billed_weight DECIMAL(10,2),
  dimensional_weight DECIMAL(10,2),
  length DECIMAL(10,2),
  width DECIMAL(10,2),
  height DECIMAL(10,2),
  
  -- Costs
  base_charge DECIMAL(10,2),
  fuel_surcharge DECIMAL(10,2),
  total_surcharges DECIMAL(10,2),
  billed_amount DECIMAL(10,2),
  audited_amount DECIMAL(10,2),
  
  -- Audit flags
  has_errors BOOLEAN DEFAULT false,
  error_count INT DEFAULT 0,
  total_recovery DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX shipments_invoice_id_idx ON shipments(invoice_id);
CREATE INDEX shipments_tracking_idx ON shipments(tracking_number);
CREATE INDEX shipments_user_date_idx ON shipments(user_id, ship_date DESC);
CREATE INDEX shipments_has_errors_idx ON shipments(has_errors) WHERE has_errors = true;

-- ==========================================
-- AUDIT ERRORS
-- ==========================================

CREATE TABLE IF NOT EXISTS audit_errors (
  id BIGSERIAL PRIMARY KEY,
  shipment_id BIGINT REFERENCES shipments(id) ON DELETE CASCADE,
  invoice_id BIGINT REFERENCES invoices(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  
  error_type TEXT NOT NULL CHECK (error_type IN (
    'dim_weight', 'duplicate_charge', 'wrong_rate', 'invalid_surcharge',
    'late_delivery', 'wrong_zone', 'residential_incorrect', 
    'fuel_overcharge', 'accessorial_invalid', 'weight_mismatch'
  )),
  
  error_description TEXT,
  field_name TEXT,
  billed_value TEXT,
  correct_value TEXT,
  recovery_amount DECIMAL(10,2),
  
  status TEXT DEFAULT 'identified' CHECK (status IN (
    'identified', 'verified', 'disputed', 'accepted', 'rejected', 'credited'
  )),
  
  dispute_notes TEXT,
  resolution_notes TEXT,
  credited_date DATE,
  credit_amount DECIMAL(10,2),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX audit_errors_shipment_idx ON audit_errors(shipment_id);
CREATE INDEX audit_errors_type_idx ON audit_errors(error_type);
CREATE INDEX audit_errors_status_idx ON audit_errors(status);
CREATE INDEX audit_errors_user_date_idx ON audit_errors(user_id, created_at DESC);

-- ==========================================
-- SURCHARGES
-- ==========================================

CREATE TABLE IF NOT EXISTS surcharges (
  id BIGSERIAL PRIMARY KEY,
  shipment_id BIGINT REFERENCES shipments(id) ON DELETE CASCADE,
  surcharge_type TEXT NOT NULL,
  surcharge_code TEXT,
  description TEXT,
  billed_amount DECIMAL(10,2),
  audited_amount DECIMAL(10,2),
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX surcharges_shipment_idx ON surcharges(shipment_id);
CREATE INDEX surcharges_type_idx ON surcharges(surcharge_type);

-- ==========================================
-- DISPUTE PACKETS
-- ==========================================

CREATE TABLE IF NOT EXISTS dispute_packets (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  carrier TEXT NOT NULL,
  
  packet_number TEXT UNIQUE,
  total_errors INT,
  total_recovery_amount DECIMAL(10,2),
  
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'submitted', 'acknowledged', 'in_review', 'partially_approved', 'approved', 'rejected'
  )),
  
  submitted_date TIMESTAMPTZ,
  response_date TIMESTAMPTZ,
  approved_amount DECIMAL(10,2),
  
  file_url TEXT,
  response_file_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX dispute_packets_user_idx ON dispute_packets(user_id);
CREATE INDEX dispute_packets_status_idx ON dispute_packets(status);

-- ==========================================
-- DISPUTE PACKET ITEMS
-- ==========================================

CREATE TABLE IF NOT EXISTS dispute_packet_items (
  id BIGSERIAL PRIMARY KEY,
  packet_id BIGINT REFERENCES dispute_packets(id) ON DELETE CASCADE,
  error_id BIGINT REFERENCES audit_errors(id) ON DELETE CASCADE,
  shipment_id BIGINT REFERENCES shipments(id) ON DELETE CASCADE,
  
  included BOOLEAN DEFAULT true,
  approved BOOLEAN,
  approved_amount DECIMAL(10,2),
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX dispute_packet_items_packet_idx ON dispute_packet_items(packet_id);

-- ==========================================
-- AUDIT RULES
-- ==========================================

CREATE TABLE IF NOT EXISTS audit_rules (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  
  priority INT DEFAULT 100,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX audit_rules_user_idx ON audit_rules(user_id);
CREATE INDEX audit_rules_active_idx ON audit_rules(is_active);

-- ==========================================
-- AUDIT LOGS
-- ==========================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id BIGINT,
  
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX audit_logs_user_idx ON audit_logs(user_id);
CREATE INDEX audit_logs_entity_idx ON audit_logs(entity_type, entity_id);
CREATE INDEX audit_logs_created_idx ON audit_logs(created_at DESC);

-- ==========================================
-- ANALYTICS SUMMARY
-- ==========================================

CREATE TABLE IF NOT EXISTS analytics_summary (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  total_shipments INT DEFAULT 0,
  total_audited INT DEFAULT 0,
  total_errors INT DEFAULT 0,
  
  total_spend DECIMAL(12,2) DEFAULT 0,
  total_recovery DECIMAL(12,2) DEFAULT 0,
  recovery_rate DECIMAL(5,2) DEFAULT 0,
  
  errors_by_type JSONB DEFAULT '{}',
  errors_by_carrier JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, period_start, period_end)
);

CREATE INDEX analytics_summary_user_period_idx ON analytics_summary(user_id, period_start DESC);

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Function to calculate DIM weight
CREATE OR REPLACE FUNCTION calculate_dim_weight(
  length DECIMAL,
  width DECIMAL,
  height DECIMAL,
  divisor INT DEFAULT 139
) RETURNS DECIMAL AS $$
BEGIN
  RETURN CEIL((length * width * height) / divisor::DECIMAL);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_audit_errors_updated_at BEFORE UPDATE ON audit_errors FOR EACH ROW EXECUTE FUNCTION update_updated_at();