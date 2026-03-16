create table generic_product (
    id bigserial primary key,
    name varchar(255) not null,
    category_id bigint not null references product_category(id),
    image_url varchar(500),
    created_at timestamp not null default now()
);

alter table product
add column generic_product_id bigint references generic_product(id);