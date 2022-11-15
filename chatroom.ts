import express from "express";
// import { client } from "./database";
import socketIO from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { client } from "./database";

// const genId = () => Math.floor(Math.random() * 10000000);

let chatRoomRouter = express.Router();

// let myRoomList = {}

// myRoomList["room"].push("tom")

let userTracker = {} as any;

export function createChatRoomRouter(io: socketIO.Server) {
  // const req = socket.request as express.Request;
  // let userName = req.session.user?.username;

  io.on("connection", async function (socket) {
    const req = socket.request as express.Request;
    let userName = req.session["user.username"] || uuidv4();

    if (!userTracker[userName]) {
      userTracker[userName] = {};
    }

    (socket.request as any).session.save();

    console.log("Hello a user has enter:", userName);
    // socket.join("room-A");

    /* notify other clients someone join */
    // socket.broadcast.emit("user_joined",{ userId: userName });

    socket.emit("hello_user", { data: "hello", userId: userName });

    socket.on("user_message", async (data) => {
      console.log(data, userName);
      let userIDD = req.session["user.id"];
      console.log("data on click", data);
      console.log("userID", userIDD);
      await client.query(
        /* sql */ `insert into message(content, users_id,room_id) values ($1,$2,$3)`,
        [data.data, userIDD, data.roomID]
      );
      io.to("room-A").emit("receive_data_from_server", {
        receivedData: data,
        sendUser: userName,
      });
    });

    socket.on("join_room", (data) => {
      console.log(data.room, data.pw);
      console.log("HIIIIIIIIII");

      if (true) {
        socket.join(data.room);
        socket.broadcast.emit("user_joined", { userId: userName });
      }
    });

    socket.on("current_pages", (data) => {
      console.log(data.current_pages);
      userTracker[userName]["current_pages"] = data.current_pages;
      userTracker[userName]["current_room"] = data.current_room;

      console.log("Tracker", userTracker);
    });

    socket.on("disconnect", (data) => {
      console.log("reasons", data);

      // const req = socket.request as express.Request;
      // let userName = req.session.user?.username;
      console.log("Bye a user has left:", userName);
      /* notify other clients someone left */
      // socket.broadcast.emit('user_left', {
      //   userId: userName
      //   // numUsers: numUsers
      // });

      console.log("LEAVEING", userTracker[userName]);

      if (
        userTracker[userName] &&
        userTracker[userName]["current_pages"] === "chat_room"
      ) {
        io.to(userTracker[userName]["current_room"]).emit("user_left", {
          userId: userName,
        });

        socket.leave(userTracker[userName]["current_room"]);
      }

      delete userTracker[userName];
    });

    let roomsDate = io.of("/").adapter.rooms;
    console.log(roomsDate["t-lJ170IWcG8HoWUAAAB"]);

    let roomsList = Array.from(roomsDate).map((v) => [v[0], Array.from(v[1])]);
    console.log(roomsList);
  });

  return chatRoomRouter;
}
