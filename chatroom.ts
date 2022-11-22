import express from "express";
// import { client } from "./database";
import socketIO from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { client } from "./database";

import {escape} from 'html-escaper';


let chatRoomRouter = express.Router();

let userTracker = {} as any;

export function createChatRoomRouter(io: socketIO.Server) {
  // const req = socket.request as express.Request;
  // let userName = req.session.user?.username;
  io.on("connection", async function (socket) {
    const req = socket.request as express.Request;

    let userName:string = req.session["user.username"] || uuidv4();
    let socketId = socket.id;

    if (!userTracker[userName]) {
      userTracker[userName] = {};
    }

    
    (socket.request as any).session.save();
    console.log(
        "----------------------------------------------------------------"
    );
    console.log("Hello a user has 進入:", userName);

    socket.join(userName)

    socket.emit("hello_user", {
      data: "hello",
      userId: userName,
      socketId: socketId,
    });

    socket.on("user_message", async (data) => {
      console.log(data, userName);
      let userIDD = req.session["user.id"];
      // console.log("data on click", data);
      // console.log("userID", userIDD);
      // console.log("received time:", data.date);

      let scapeHTML = escape(data.data);
      console.log(scapeHTML);
      
      await client.query(
        /* sql */ `insert into message(content, users_id,room_id) values ($1,$2,$3)`,
        [scapeHTML, userIDD, data.roomID]
      );


      io.to(data.roomID).emit("receive_data_from_server", {
        receivedData: {...data, data: scapeHTML},
        sendUser: userName,
        msgTime: data.date,
        id: userIDD,
      });
    });

    socket.on("join_room", (data) => {
      console.log("Join Room:", data.room, "room pw(todo):", data.pw);
      let userIDD = req.session["user.id"];

      //todo: if (pw check)
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
      userTracker[userName]["socketId"] = socketId;

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
      console.log(
        "----------------------------------------------------------------"
      );
      try {
        console.log(
          "Bye a user has 離開:",
          userName,
          "From Room:",
          userTracker[userName]["current_room"]
        );
        /* notify other clients someone left */
        let userIDD = req.session["user.id"];

        console.log("LEAVEING", userTracker[userName]);
        if (
          userTracker[userName] &&
          userTracker[userName]["current_pages"] === "chat_room"
        ) {
          io.to(userTracker[userName]["current_room"]).emit("user_left", {
            userId: userName,
          });

          updateRoomStatus(
            userIDD,
            userTracker[userName]["current_room"],
            false
          );
          socket.leave(userTracker[userName]["current_room"]);
        }

        delete userTracker[userName];

        countNumOfPeople();
      } 
      catch (error) {
        console.log(error);
      }
    });

    // let roomsDate = io.of("/").adapter.rooms;
    // let roomsList = Array.from(roomsDate).map((v) => [v[0], Array.from(v[1])]);
    // console.log("roomList:",roomsList);

    /* 被他人邀請 one on one chat */
    socket.on("user_invited", (data) => {
      let invitee = data.invitee;
      let inviter = data.inviter;

      let inviteeSocketId = userTracker[invitee]["socketId"];
      let inviterSocketId = userTracker[inviter]["socketId"];

      console.log(
        "----------------------------------------------------------------"
      );
      console.log("(邀請訊號)", "邀請者:", inviter, "受邀者:", invitee);
      console.log(
        "(邀請訊號)",
        "邀請者SocketId:",
        inviterSocketId,
        "受邀者SocketId:",
        inviteeSocketId
      );

      /* 通知受邀者 */
      io.to(inviteeSocketId).emit("getInvited", {
        invitee: invitee,
        inviter: inviter,
        inviteeSocketId: inviteeSocketId,
        inviterSocketId: inviterSocketId,
      });
    });

    /* user 接受邀請 */
    socket.on("user_accept_invite", (data) => {

      console.log(
        "----------------------------------------------------------------"
      );
      console.log("user_accept_invite");
      console.log("data:", data.data);

      let invitee = data.data.invitee;
      let inviter = data.data.inviter;

      let inviteeSocketId = userTracker[invitee]["socketId"];
      let inviterSocketId = userTracker[inviter]["socketId"];
      
      console.log("(同意邀請訊號)", "邀請者:", inviter, "受邀者:", invitee);
      console.log(
        "(同意邀請訊號)",
        "邀請者SocketId:",
        inviterSocketId,
        "受邀者SocketId:",
        inviteeSocketId
      );

      // socket.join(user.id)
      /* 回覆邀請者，已被Accept */
      io.to(inviterSocketId).emit("getAccept", {
        invitee: invitee,
        inviter: inviter,
        inviteeSocketId: inviteeSocketId,
        inviterSocketId: inviterSocketId,
      });
    });

    /* user 拒絕邀請 */
    socket.on("user_reject_invite", (data) => {
      console.log(
        "----------------------------------------------------------------"
      );
      console.log("user_reject_invite");
      console.log("data:", data.data);
      let invitee = data.data.invitee;
      let inviter = data.data.inviter;
      let inviteeSocketId = userTracker[invitee]["socketId"];
      let inviterSocketId = userTracker[inviter]["socketId"];
      console.log("(拒絕邀請訊號)", "邀請者:", inviter, "受邀者:", invitee);
      console.log(
        "(拒絕邀請訊號)",
        "邀請者SocketId:",
        inviterSocketId,
        "受邀者SocketId:",
        inviteeSocketId
      );
      /* 回覆邀請者，已被Reject */
      io.to(inviterSocketId).emit("getReject", {
        invitee: invitee,
        // inviter: inviter,
        // inviteeSocketId: inviteeSocketId,
        // inviterSocketId: inviterSocketId
      });
    });

    // socket.on("joinSecret", (data) => {
    //   socket.join("room1");
    //   console.log("joinSecret",data);
    //   console.log("Tracker", userTracker);
    // });
    socket.on("joinSecret", (data) => {
      socket.join(data.roomID);
      // socket.join("room1")
      console.log("joinSecret", data.roomID);
    });

    socket.on("secretMessage", (data: any) => {
      console.log("received data secretMessage", data);
      // console.log(data.socketID);
      io.to(data.roomID).emit("sentSecret", data);
      // work to all users
      // io.emit("sentSecret", data);
    });

  });

  return chatRoomRouter;
}


// () => {

// }

// ()=>{console.log("jfhb");}