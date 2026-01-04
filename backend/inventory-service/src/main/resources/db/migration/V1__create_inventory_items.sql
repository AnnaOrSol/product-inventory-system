CREATE TABLE inventory_items (
    id BIGSERIAL PRIMARY KEY,

    installation_id UUID NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(1000),
    quantity BIGINT NOT NULL CHECK (quantity >= 0),

    best_before DATE,

    location VARCHAR(1000),
    notes VARCHAR(1000),

    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- One row per product when best_before is NULL
CREATE UNIQUE INDEX uq_inventory_no_expiry
    ON inventory_items (installation_id, product_id)
    WHERE best_before IS NULL;

-- One row per expiry date when best_before is NOT NULL
CREATE UNIQUE INDEX uq_inventory_with_expiry
    ON inventory_items (installation_id, product_id, best_before)
    WHERE best_before IS NOT NULL;
