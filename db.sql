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