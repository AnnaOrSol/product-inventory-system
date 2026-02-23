ALTER TABLE product
    DROP COLUMN is_official;

ALTER TABLE product
    ALTER COLUMN category SET NOT NULL;

ALTER TABLE product
    ALTER COLUMN category TYPE VARCHAR(50);

ALTER TABLE product
    ADD CONSTRAINT fk_product_category
    FOREIGN KEY (category)
    REFERENCES product_category(code);
