alter table inventory_items
add column generic_product_id bigint;

alter table inventory_items
add column generic_product_name varchar(255);