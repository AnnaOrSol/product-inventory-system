insert into generic_product (name, category_id, image_url)
select 'Milk', id, null from product_category where code = 'DAIRY';

insert into generic_product (name, category_id, image_url)
select 'Ketchup', id, null from product_category where code = 'PANTRY';

insert into generic_product (name, category_id, image_url)
select 'Tahini', id, null from product_category where code = 'PANTRY';

insert into generic_product (name, category_id, image_url)
select 'Salt', id, null from product_category where code = 'PANTRY';

insert into generic_product (name, category_id, image_url)
select 'Sugar', id, null from product_category where code = 'PANTRY';

insert into generic_product (name, category_id, image_url)
select 'Flour', id, null from product_category where code = 'PANTRY';

insert into generic_product (name, category_id, image_url)
select 'Mayonnaise', id, null from product_category where code = 'PANTRY';

insert into generic_product (name, category_id, image_url)
select 'Tomato', id, null from product_category where code = 'VEGETABLES';

insert into generic_product (name, category_id, image_url)
select 'Cucumber', id, null from product_category where code = 'VEGETABLES';

insert into generic_product (name, category_id, image_url)
select 'Onion', id, null from product_category where code = 'VEGETABLES';

insert into generic_product (name, category_id, image_url)
select 'Potato', id, null from product_category where code = 'VEGETABLES';

insert into generic_product (name, category_id, image_url)
select 'Banana', id, null from product_category where code = 'FRUITS';

insert into generic_product (name, category_id, image_url)
select 'Apple', id, null from product_category where code = 'FRUITS';

insert into generic_product (name, category_id, image_url)
select 'Lemon', id, null from product_category where code = 'FRUITS';