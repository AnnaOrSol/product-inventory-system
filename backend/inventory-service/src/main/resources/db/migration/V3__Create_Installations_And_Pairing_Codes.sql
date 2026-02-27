CREATE TABLE IF NOT EXISTS installations (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS pairing_codes (
    installation_id UUID PRIMARY KEY REFERENCES installations(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_pairing_codes_expires_at ON pairing_codes (expires_at);