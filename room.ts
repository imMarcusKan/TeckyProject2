import express from "express";
import { client } from "./database";
import socketIO from "socket.io";

let roomRouter = express.Router();

export function createRoomRouter(io: socketIO.Server) {
  roomRouter.post("/room", async (req, res) => {
    let result = await client.query(
      /* sql */ `select * from room where deleted_at > now()`
    );
    io.emit("new-room", result.rows);

    res.json({});
  });

  roomRouter.get("/rooms", async (req, res) => {
    let result = await client.query(
      /* sql */ `select id, haspassword, headcount from room where password is not null and deleted_at > now()`
    );
    res.json(result.rows);
  });

  return roomRouter;
}
