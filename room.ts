import express from "express";
import { client } from "./database";
import socketIO from "socket.io";

let roomRouter = express.Router();

export function createRoomRouter(io: socketIO.Server) {
  roomRouter.post("/room", async (req, res) => {
    let result = await client.query(/* sql */ `select * 
      from room 
      where (deleted_at > now() or deleted_at is null) 
      and id >2 ORDER BY id`);
    io.emit("new-room", result.rows);
    res.json({});
  });

  roomRouter.post("/userlist/:roomID", async (req, res) => {
    let roomID = req.params.roomID;

    let result = await client.query(
      /* sql */ `select users_id, room_id, username, gender, profile_pic 
      from room_participant 
      left outer join users on room_participant.users_id = users.id 
      where room_id = $1`,
      [roomID]
    );

    io.emit("user-list", result.rows);
    // console.log("user-list", result.rows);
    res.json({});
  });

  roomRouter.get("/user-list/:username", async (req, res) => {
    let username = req.params.username;
    let result = await client.query(
      /* sql */ `select users.id,username,profile_pic,gender,content,count(content)as count 
      from users 
      full outer join room on users.id=room.user_id 
      full outer join category on room.category_id=category.id 
      where username=$1 group by content,users.id`,
      [username]
    );
    res.json(result.rows);
  });

  roomRouter.get("/rooms", async (req, res) => {
    let result = await client.query(
      /* sql */ `select deleted_at, id, haspassword, headcount from room where (password is not null and id > 2) and (deleted_at > now() or deleted_at is null) ORDER BY id`
    );
    res.json(result.rows);
  });

  return roomRouter;
}

roomRouter.get("/room_status", async (req, res) => {
  let result = await client.query(
    /* sql */ `select room_id, count(room_id) as roomstatus from room_participant group by room_id`
  );
  res.json(result.rows);
});

roomRouter.post("/category", async (req, res) => {
  let { categoryID } = req.body;
  let result = await client.query(
    /* sql */ `select * from room where (category_id = $1 and id >2) and (deleted_at > now() or deleted_at is null) ORDER BY id`,
    [categoryID]
  );
  res.json(result.rows);
});

roomRouter.get("/quick", async (req, res) => {
  let result = await client.query(
    /* sql */ `select (id) from room where (haspassword = false and id > 2) and (deleted_at > now() or deleted_at is null)`
  );
  let data = result.rows;
  let randomRoom = data[Math.floor(Math.random() * data.length)];
  res.json(randomRoom);
});

// let a = `select (id) from room`
// let b = `where (haspassword = false and id > 2)`
