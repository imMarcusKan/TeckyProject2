import express from "express";
import { client } from "./database";
import socketIO from "socket.io";

let roomRouter = express.Router();

export function createRoomRouter(io: socketIO.Server) {
  roomRouter.post("/room", async (req, res) => {
    let result = await client.query(
      /* sql */ `select * from demo where deleted_at > now()`
    );
    io.emit("new-room", result.rows);
    setInterval(function () {
      io.emit("interval", result.rows);
    }, 30000);
    res.json({});
  });
  return roomRouter;
}
