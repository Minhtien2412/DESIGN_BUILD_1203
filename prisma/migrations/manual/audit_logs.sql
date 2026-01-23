-- ============================================================
-- Audit Logs Migration
-- Creates audit_logs table for comprehensive security logging
-- ============================================================

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Event classification
    category VARCHAR(50) NOT NULL, -- auth, admin, file, resource, security, system
    action VARCHAR(100) NOT NULL, -- login_success, login_failed, file_uploaded, etc.
    severity VARCHAR(20) NOT NULL DEFAULT 'info', -- info, warning, error, critical
    outcome VARCHAR(20) NOT NULL, -- success, failure
    
    -- Actor information
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    session_id VARCHAR(255),
    
    -- Target information
    target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    target_resource_type VARCHAR(100),
    target_resource_id VARCHAR(255),
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    request_path VARCHAR(500),
    request_method VARCHAR(10),
    
    -- Additional data
    details JSONB,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp 
ON audit_logs(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_category_action 
ON audit_logs(category, action);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
ON audit_logs(user_id) 
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_severity 
ON audit_logs(severity) 
WHERE severity IN ('warning', 'error', 'critical');

CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address 
ON audit_logs(ip_address) 
WHERE ip_address IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_category_timestamp 
ON audit_logs(category, timestamp DESC);

-- Partial index for security events (frequently queried)
CREATE INDEX IF NOT EXISTS idx_audit_logs_security_events 
ON audit_logs(timestamp DESC) 
WHERE category = 'security';

-- Add comments
COMMENT ON TABLE audit_logs IS 'Comprehensive audit log for security-critical operations';
COMMENT ON COLUMN audit_logs.category IS 'Event category: auth, admin, file, resource, security, system';
COMMENT ON COLUMN audit_logs.action IS 'Specific action: login_success, login_failed, file_uploaded, etc.';
COMMENT ON COLUMN audit_logs.severity IS 'Event severity: info, warning, error, critical';
COMMENT ON COLUMN audit_logs.details IS 'Additional context as JSON';

-- ============================================================
-- Set up automatic partition by month (for high-volume deployments)
-- Uncomment if needed
-- ============================================================
-- CREATE TABLE audit_logs_partitioned (
--     LIKE audit_logs INCLUDING ALL
-- ) PARTITION BY RANGE (timestamp);

-- ============================================================
-- Verify migration
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'audit_logs'
  ) THEN
    RAISE NOTICE 'Audit logs migration completed successfully';
  ELSE
    RAISE EXCEPTION 'Audit logs migration failed - table not created';
  END IF;
END $$;
