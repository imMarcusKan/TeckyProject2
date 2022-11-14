import express from "express";
// import { client } from "./database";
import socketIO from "socket.io";

// const genId = () => Math.floor(Math.random() * 10000000);

let chatRoomRouter = express.Router();

export function createChatRoomRouter(io: socketIO.Server) {

  // const req = socket.request as express.Request;
  // let userName = req.session["username"];

    io.on("connection", function (socket) {
      const req = socket.request as express.Request;
      let userName = req.session["username"];
    
      (socket.request as any).session.save();
    
      console.log("Hello a user has enter:", req.session["username"]);
      socket.join("room-A");

      /* notify other clients someone join */
      socket.broadcast.emit("user_joined",{ userId: userName });
    
      socket.emit("hello_user", { data: "hello", userId: userName });
    
      socket.on("user_message", (data) => {
        console.log(data, userName);
        io.to("room-A").emit("receive_data_from_server", {
          receivedData: data,
          sendUser: userName,
        });
      });

      socket.on("disconnect", () => {
        // const req = socket.request as express.Request;
        // let userName = req.session["username"];
        console.log("Bye a user has left:", userName)
        /* notify other clients someone left */
        socket.broadcast.emit('user_left', {
          userId: userName
          // numUsers: numUsers
        });
      });
    });

    return chatRoomRouter
}

