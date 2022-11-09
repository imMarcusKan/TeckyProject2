import express from "express";
import { client } from "./database";
import socketIO from "socket.io";
import { format } from "date-fns";

let roomRouter = express.Router();

export function createRoomRouter(io: socketIO.Server) {
  roomRouter.post("/room", async (req, res) => {
    let currentTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    console.log(currentTime);
    let result = await client.query(
      /* sql */ `select content, headcount, deleted_at from demo where deleted_at > now()`
    );
    console.log(result.rows);
    io.emit("new-room", result.rows);
    res.json({});
  });
  return roomRouter;
}

//TODO delete certain room after time interval
// socket.on("delete-room", () => {
//   roomRouter.delete("/delete-room", (req, res) => {});
// });
