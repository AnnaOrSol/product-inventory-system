CREATE TABLE notes (
    id BIGSERIAL PRIMARY KEY,
    installation_id UUID NOT NULL,
    text TEXT NOT NULL,
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notes_installation_id
    ON notes (installation_id);