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
    timer timestamp not null,
    head_limit INTEGER not null,
    IsActive boolean not null,
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


create table demo (
    id serial primary key,
    content TEXT,
    headcount INTEGER,
    password varchar(255),
    created_at timestamp not null,
    deleted_at timestamp not null,
    isactive boolean 
);