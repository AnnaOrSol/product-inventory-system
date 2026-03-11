create table installation_members (
    id bigserial primary key,
    installation_id uuid not null,
    user_id uuid not null,
    role varchar(50) not null,
    joined_at timestamp not null,
    created_at timestamp not null,
    updated_at timestamp not null,

    constraint uk_installation_member unique (installation_id, user_id)
);

create index idx_installation_members_installation_id
    on installation_members (installation_id);

create index idx_installation_members_user_id
    on installation_members (user_id);