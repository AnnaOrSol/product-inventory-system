ALTER TABLE inventory_requirements
    RENAME COLUMN product_id TO generic_product_id;

ALTER TABLE inventory_requirements
    RENAME COLUMN product_name TO generic_product_name;

ALTER TABLE inventory_requirements
    DROP CONSTRAINT IF EXISTS inventory_requirements_installation_id_product_id_key;

ALTER TABLE inventory_requirements
    ADD CONSTRAINT inventory_requirements_installation_id_generic_product_id_key
        UNIQUE (installation_id, generic_product_id);