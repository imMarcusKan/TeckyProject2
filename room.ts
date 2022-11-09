import express from "express";
import { client } from "./database";
import socketIO from "socket.io";

let roomRouter = express.Router();

export function createRoomRouter(io: socketIO.Server) {
  roomRouter.post("/room", async (req, res) => {
    let result = await client.query(
      /* sql */ `select content, headcount from demo`
    );
    io.emit("new-room", result.rows);
    res.json({});
  });
  return roomRouter;
}

//TODO delete certain room after time interval
// socket.on("delete-room", () => {
//   roomRouter.delete("/delete-room", (req, res) => {});
// });
