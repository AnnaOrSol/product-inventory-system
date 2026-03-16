update product
set generic_product_id = (select id from generic_product where name = 'Milk')
where name in ('Milk 3% Tnuva', 'Milk 2l');

update product
set generic_product_id = (select id from generic_product where name = 'Ketchup')
where name = 'Tomato ketchup';

update product
set generic_product_id = (select id from generic_product where name = 'Tahini')
where name = 'Techina Yerushalayim 500gr';

update product
set generic_product_id = (select id from generic_product where name = 'Salt')
where name = 'Salt';

update product
set generic_product_id = (select id from generic_product where name = 'Sugar')
where name in ('Sugar', 'Brown sugar classic');

update product
set generic_product_id = (select id from generic_product where name = 'Flour')
where name in ('All purpose flour', 'Self-rising flour');

update product
set generic_product_id = (select id from generic_product where name = 'Mayonnaise')
where name = 'Mayo';

update product
set generic_product_id = (select id from generic_product where name = 'Tomato')
where name = 'Tomato';

update product
set generic_product_id = (select id from generic_product where name = 'Cucumber')
where name = 'Cucumber';

update product
set generic_product_id = (select id from generic_product where name = 'Onion')
where name = 'Onion';

update product
set generic_product_id = (select id from generic_product where name = 'Potato')
where name = 'Potato';

update product
set generic_product_id = (select id from generic_product where name = 'Banana')
where name = 'Banana';

update product
set generic_product_id = (select id from generic_product where name = 'Apple')
where name = 'Apple';

update product
set generic_product_id = (select id from generic_product where name = 'Lemon')
where name = 'Lemon';