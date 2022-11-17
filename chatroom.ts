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
      console.log("received time:", data.date);
      await client.query(
        /* sql */ `insert into message(content, users_id,room_id) values ($1,$2,$3)`,
        [data.data, userIDD, data.roomID]
      );
      io.to(data.roomID).emit("receive_data_from_server", {
        receivedData: data,
        sendUser: userName,
        msgTime: data.date,
        id: userIDD,
      });
    });

    socket.on("join_room", (data) => {
      console.log("Join Room:", data.room, "room pw(todo):", data.pw);
      //todo pw check
      let userIDD = req.session["user.id"];
      if (true) {
        socket.join(data.room);
        /* notify other clients someone join */
        socket.broadcast.emit("user_joined", {
          userId: userName,
          roomID: data.room,
        });
      }
      countNumOfPeople();
      updateRoomStatus(userIDD, data.room, true);
    });

    socket.on("current_pages", (data) => {
      console.log(
        "User:",
        userName,
        "Moving to:",
        data.current_pages,
        ",Room:",
        data.current_room
      );
      userTracker[userName]["current_pages"] = data.current_pages;
      userTracker[userName]["current_room"] = data.current_room;

      console.log("Tracker", userTracker);
    });

    function countNumOfPeople() {
      const re = /^\d*(\.\d+)?$/;

      let roomsDate = io.of("/").adapter.rooms;
      let roomsList = Array.from(roomsDate)
        .map((v) => [v[0], Array.from(v[1])])
        .filter((v) => (v[0] as string).match(re));

      console.log("roomList:", roomsList);

      let roomObj = {} as any;
      roomsList.forEach((v) => (roomObj[v[0] as string] = v[1].length));

      console.log("roomList&UserCount:", roomObj);

      io.emit("room_status", roomObj);
    }

    async function updateRoomStatus(
      id: number,
      room: number,
      enterOrLeave: boolean
    ) {
      if (enterOrLeave) {
        await client.query(
          /* sql*/ `insert into room_participant(users_id, room_id) values ($1,$2)`,
          [id, room]
        );
      } else {
        await client.query(
          /* sql*/ `delete from room_participant where users_id = $1 and room_id = $2`,
          [id, room]
        );
      }
    }

    socket.on("disconnect", (data) => {
      console.log("reasons", data);

      // roomsList

      // const req = socket.request as express.Request;
      // let userName = req.session.user?.username;
      console.log("Bye a user has left:", userName);
      /* notify other clients someone left */
      // socket.broadcast.emit('user_left', {
      //   userId: userName
      //   // numUsers: numUsers
      // });
      let userIDD = req.session["user.id"];

      console.log("LEAVEING", userTracker[userName]);
      if (
        userTracker[userName] &&
        userTracker[userName]["current_pages"] === "chat_room"
      ) {
        io.to(userTracker[userName]["current_room"]).emit("user_left", {
          userId: userName,
        });
        // updateRoomStatus(userIDD, userTracker[userName]["current_room"], false);

        console.log("1", userIDD);
        console.log("2", userTracker[userName]["current_room"]);
        updateRoomStatus(userIDD, userTracker[userName]["current_room"], false);
        socket.leave(userTracker[userName]["current_room"]);
      }

      delete userTracker[userName];

      countNumOfPeople();
    });

    // let roomsDate = io.of("/").adapter.rooms;
    // let roomsList = Array.from(roomsDate).map((v) => [v[0], Array.from(v[1])]);
    // console.log("roomList:",roomsList);
  });

  return chatRoomRouter;
}
