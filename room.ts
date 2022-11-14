import express from "express";
import { client } from "./database";
import socketIO from "socket.io";

let roomRouter = express.Router();

export function createRoomRouter(io: socketIO.Server) {
  roomRouter.post("/room", async (req, res) => {
    let result = await client.query(
      /* sql */ `select * from room where deleted_at > now() or deleted_at is null`
    );
    io.emit("new-room", result.rows);

    res.json({});
  });

  roomRouter.get("/rooms", async (req, res) => {
    let result = await client.query(
      /* sql */ `select deleted_at, id, haspassword, headcount from room where password is not null and deleted_at > now() or deleted_at is null`
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
