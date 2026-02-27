ALTER TABLE inventory_items ALTER COLUMN quantity TYPE INTEGER;
ALTER TABLE inventory_items ALTER COLUMN product_name SET NOT NULL;

ALTER TABLE inventory_requirements ALTER COLUMN product_name SET NOT NULL;
ALTER TABLE inventory_requirements ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;
ALTER TABLE inventory_requirements ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_inv_req_installation_id ON inventory_requirements (installation_id);
CREATE INDEX IF NOT EXISTS idx_inv_req_product_id ON inventory_requirements (product_id);