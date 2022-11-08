import express from "express";
import { client } from "./database";
import socketIO from "socket.io";

let roomRouter = express.Router();

export function createRoomRouter(io: socketIO.Server) {
  roomRouter.post("/room", async (req, res) => {
    let result = await client.query(/* sql */ `select content from demo`);
    // let json = JSON.stringify(result.rows);
    console.log(result.rows);
    io.emit("new-room", result.rows);
    res.json({});
  });
  return roomRouter;
}
