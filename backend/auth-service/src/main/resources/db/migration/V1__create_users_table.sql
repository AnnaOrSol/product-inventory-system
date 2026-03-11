create table users (
    id uuid primary key,
    name varchar(100) not null,
    email varchar(255) not null unique,
    phone varchar(20) not null unique,
    password_hash varchar(255) not null,
    role varchar(50) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp
);