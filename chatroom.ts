import express from "express";
// import { client } from "./database";
import socketIO from "socket.io";

// const genId = () => Math.floor(Math.random() * 10000000);

let chatRoomRouter = express.Router();

export function createChatRoomRouter(io: socketIO.Server) {

    io.on("connection", function (socket) {
      const req = socket.request as express.Request;
    
      (socket.request as any).session.save();
    
      // console.log("Hello a user has enter");
      socket.join("room-A");
    
      socket.emit("hello_user", { data: "hello", userId: req.session["username"] });
    
      socket.on("user_message", (data) => {
        console.log(data, req.session["username"]);
        io.to("room-A").emit("receive_data_from_server", {
          receivedData: data,
          sendUser: req.session["username"],
        });
      });
    });

    return chatRoomRouter
}

