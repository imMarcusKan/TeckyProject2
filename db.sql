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
----------------------------------
create table demo (
    id serial primary key,
    content text not null,
    headcount integer,
    password varchar(255),
    created_at timestamp default current_time,
    -- deleted_at timestamp,
    isactive boolean,
    haspassword boolean
);
create table room_participant (
    id serial primary key,
    users_id integer not null references users(id),
    room_id integer not null references room(id)
);
alter table room drop column isactive;
alter table room drop column timer;
alter table room
add column created_at timestamp default now();
alter table room
add column deleted_at timestamp;
alter table room
add column haspassword boolean;
alter table room
    rename column head_limit to headcount;