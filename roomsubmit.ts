import express from "express";
import { client } from "./database";
import { format, add } from "date-fns";

export let roomsubmitRouter = express.Router();

roomsubmitRouter.post("/demo", async (req, res) => {
  let { content, headNumber, addTime, password } = req.body;
  let deleteTime;
  console.log("addTime:", addTime);
  if (addTime == 99) {
    deleteTime = null;
  } else {
    deleteTime = format(
      add(new Date(), { minutes: addTime }),
      "yyyy-MM-dd HH:mm:ss"
    );
  }
  console.log("deletedTime:", deleteTime);
  let checkPW = true;
  if (!password) {
    checkPW = false;
  }
  await client.query(
    /* sql */ `insert into room (topic,headcount,deleted_at,password, haspassword) values ($1,$2,$3,$4,$5)`,
    [content, headNumber, deleteTime, password, checkPW]
  );
  res.redirect("/homePage.html");
});

roomsubmitRouter.post("/password", async (req, res) => {
  let { roomID, password } = req.body;
  let data = await client.query(
    /* sql */ `select (id) from room where id = $1 and password = $2 and deleted_at > now()`,
    [roomID, password]
  );

  res.json(data.rows);
});

roomsubmitRouter.post("/user_room_ID", async (req, res) => {
  try {
    
    let { userID, roomID } = req.body;
    await client.query(
      /* sql */ `insert into room_participant (users_id, room_id) values ($1,$2)`,
      [userID, roomID]
    );
    res.json({});
  } catch (error) {
    console.log(error);
    
    res.json({});

  }
});

roomsubmitRouter.delete("/record", async (req, res) => {
  try {
    let { userID } = req.body;
    
    console.log("userID when leaving room:", userID);
  
    await client.query(
      /* sql */ `delete from room_participant where users_id = $1`,
      [+userID]
    );
    res.json({});

  } catch (error) {
    console.log(error);
    res.json({});
  }
});
