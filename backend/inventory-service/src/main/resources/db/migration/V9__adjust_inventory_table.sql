UPDATE inventory_items
SET generic_product_id = product_id,
    generic_product_name = product_name
WHERE generic_product_id IS NULL;

ALTER TABLE inventory_items ALTER COLUMN generic_product_id SET NOT NULL;
ALTER TABLE inventory_items ALTER COLUMN generic_product_name SET NOT NULL;

ALTER TABLE inventory_items DROP COLUMN product_id;
ALTER TABLE inventory_items DROP COLUMN product_name;

DROP INDEX IF EXISTS uq_inventory_no_expiry;
DROP INDEX IF EXISTS uq_inventory_with_expiry;

CREATE UNIQUE INDEX uq_inventory_no_expiry
    ON inventory_items (installation_id, generic_product_id)
    WHERE best_before IS NULL;

CREATE UNIQUE INDEX uq_inventory_with_expiry
    ON inventory_items (installation_id, generic_product_id, best_before)
    WHERE best_before IS NOT NULL;

ALTER TABLE inventory_requirements ALTER COLUMN minimum_quantity TYPE INTEGER;