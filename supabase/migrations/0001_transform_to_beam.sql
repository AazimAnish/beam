-- Migration: Transform to Beam
-- Changes phone-based system to email-based system with multi-channel sharing

-- Add new columns for Beam functionality
ALTER TABLE transfers 
ADD COLUMN recipient_email TEXT,
ADD COLUMN sharing_method TEXT DEFAULT 'email' CHECK (sharing_method IN ('email', 'whatsapp', 'twitter', 'copy'));

-- Migrate existing phone data to email format (for development/testing)
-- Note: In production, you'd need to handle this migration differently
UPDATE transfers 
SET recipient_email = CASE 
    WHEN recipient_phone_number LIKE '+%' 
    THEN CONCAT('user', SUBSTRING(recipient_phone_number FROM 2), '@example.com')
    ELSE CONCAT('user', recipient_phone_number, '@example.com')
END
WHERE recipient_email IS NULL;

-- Make recipient_email NOT NULL after migration
ALTER TABLE transfers 
ALTER COLUMN recipient_email SET NOT NULL;

-- Remove phone and OTP columns (after data migration)
ALTER TABLE transfers 
DROP COLUMN IF EXISTS recipient_phone_number,
DROP COLUMN IF EXISTS otp_hash,
DROP COLUMN IF EXISTS otp_expires_at;

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_transfers_recipient_email ON transfers (recipient_email);

-- Add index for sharing method analytics
CREATE INDEX IF NOT EXISTS idx_transfers_sharing_method ON transfers (sharing_method);

-- Update comments
COMMENT ON TABLE transfers IS 'Beam transfers - email-based crypto transfers with multi-channel sharing';
COMMENT ON COLUMN transfers.recipient_email IS 'Email address of the recipient who can claim funds';
COMMENT ON COLUMN transfers.sharing_method IS 'Method used to share the claim link: email, whatsapp, twitter, or copy';