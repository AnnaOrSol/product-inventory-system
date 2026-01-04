CREATE TABLE inventory_requirements (
    id BIGSERIAL PRIMARY KEY,

    installation_id UUID NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(1000),
    minimum_quantity INTEGER NOT NULL,

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,

    CONSTRAINT uq_inventory_requirements_installation_product
        UNIQUE (installation_id, product_id)
);

CREATE INDEX idx_inventory_requirements_installation_id
    ON inventory_requirements (installation_id);

CREATE INDEX idx_inventory_requirements_product_id
    ON inventory_requirements (product_id);
