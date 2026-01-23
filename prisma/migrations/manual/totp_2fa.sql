-- ============================================================
-- TOTP 2FA Migration
-- Adds Two-Factor Authentication fields to users table
-- ============================================================

-- Add TOTP fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS totp_secret TEXT,
ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS totp_enabled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS totp_backup_codes JSONB DEFAULT '[]'::jsonb;

-- Create index for efficient 2FA status queries
CREATE INDEX IF NOT EXISTS idx_users_totp_enabled 
ON users(totp_enabled) 
WHERE totp_enabled = true;

-- Add comment for documentation
COMMENT ON COLUMN users.totp_secret IS 'Encrypted TOTP secret (AES-256-GCM format: iv:authTag:encrypted)';
COMMENT ON COLUMN users.totp_enabled IS 'Whether 2FA is enabled for this user';
COMMENT ON COLUMN users.totp_enabled_at IS 'Timestamp when 2FA was enabled';
COMMENT ON COLUMN users.totp_backup_codes IS 'Array of hashed backup/recovery codes';

-- ============================================================
-- Verify migration
-- ============================================================
DO $$
BEGIN
  -- Check if columns were added
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'totp_secret'
  ) THEN
    RAISE NOTICE 'TOTP 2FA migration completed successfully';
  ELSE
    RAISE EXCEPTION 'TOTP 2FA migration failed - columns not created';
  END IF;
END $$;
