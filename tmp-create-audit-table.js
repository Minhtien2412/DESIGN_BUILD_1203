const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function createAuditTable() {
  try {
    await p.$executeRaw`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        category VARCHAR(50) NOT NULL,
        action VARCHAR(100) NOT NULL,
        severity VARCHAR(20) NOT NULL DEFAULT 'info',
        outcome VARCHAR(20) NOT NULL DEFAULT 'success',
        user_id INTEGER,
        user_email VARCHAR(255),
        target_user_id INTEGER,
        target_resource_type VARCHAR(100),
        target_resource_id VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        session_id VARCHAR(255),
        request_id VARCHAR(255),
        request_path VARCHAR(500),
        request_method VARCHAR(10),
        details JSONB,
        error_message TEXT
      )
    `;
    console.log("Created audit_logs table");

    // Create indices for common queries
    await p.$executeRaw`CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp DESC)`;
    await p.$executeRaw`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id)`;
    await p.$executeRaw`CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs (category)`;
    await p.$executeRaw`CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action)`;
    await p.$executeRaw`CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs (severity)`;
    console.log("Created indices");

    // Insert a seed audit log entry
    await p.$executeRaw`
      INSERT INTO audit_logs (timestamp, category, action, severity, outcome, user_email, details)
      VALUES (NOW(), 'system', 'table_created', 'info', 'success', 'system', '{"message": "audit_logs table created during Phase 4 observability setup"}'::jsonb)
    `;
    console.log("Inserted seed audit log entry");
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await p.$disconnect();
  }
}

createAuditTable();
