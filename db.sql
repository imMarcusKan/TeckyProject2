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
----------------------------------
create table room_participant(
    id serial primary key,
    users_id integer references users(id),
    room_id integer references room(id)
);
create table message(
    id serial primary key,
    content text NOT NULL,
    created_at timestamp default current_timestamp,
    users_id integer references users(id),
    room_id integer references room(id)
);
INSERT INTO message(content, users_id, room_id)
values ('hi', 1, 24),
    ('bye', 2, 24);
insert into category(content)
values ('吹水台');
insert into category(content)
values ('心事台');
insert into category(content)
values ('體育台');
insert into category(content)
values ('電玩台');
----------------------------------------
select *
from room_participant
    left outer join room on room_participant.room_id = room.id;
alter table users
add column gender varchar(1);
alter table users
add column profile_pic varchar(255);
alter table room
add column user_id integer references users(id);
insert into room(id, topic, headcount, category_id, haspassword)
values (1, 'public', 100, 1, false);一