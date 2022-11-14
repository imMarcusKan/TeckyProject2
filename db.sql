create database socket;
create role socket with password 'socket' superuser;
alter role socket with login;
-------------------------------------------
create table users(
    id serial primary key,
    username varchar(255) not null,
    password varchar(255) not null,
    email varchar(255) not null
);
create table category(
    id serial primary key,
    content TEXT not null
);
create table room (
    id serial primary key,
    topic TEXT not null,
    headcount INTEGER not null,
    password text,
    created_at timestamp default now(),
    deleted_at timestamp,
    haspassword boolean,
    category_id integer not null references category(id)
);
create table message (
    id serial primary key,
    content TEXT not null,
    created_at timestamp not null,
    room_id INTEGER not null,
    user_id INTEGER not null
);
alter table room
add column password TEXT not null;
----------------------------------
alter table room
alter column password drop not null;
----------------------------------
alter table users drop column nickname;
----------------------------------
create table room_participant(
    id serial primary key,
    users_id integer references users(id),
    room_id integer references room(id)
);
create table message(
    id serial primary key,
    content text NOT NULL,
    users_id integer references users(id),
    room_id integer references room(id)
);
INSERT INTO message(content, users_id, room_id)
values ('hi', 1, 24),
    ('bye', 2, 24);