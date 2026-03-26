CREATE TABLE inventory_event (
    id BIGSERIAL PRIMARY KEY,
    event_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    reason VARCHAR(100),
    installation_id UUID NOT NULL,
    product_id BIGINT,
    product_name VARCHAR(255),
    quantity INTEGER,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source_service VARCHAR(100) NOT NULL,
    details TEXT
);

ALTER TABLE inventory_event
    ADD CONSTRAINT uk_inventory_event_event_id UNIQUE (event_id);

CREATE INDEX idx_inventory_event_installation_id ON inventory_event(installation_id);
CREATE INDEX idx_inventory_event_event_type ON inventory_event(event_type);
CREATE INDEX idx_inventory_event_occurred_at ON inventory_event(occurred_at);