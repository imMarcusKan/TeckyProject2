import express from "express";
import { client } from "./database";
import { format, add } from "date-fns";

// roomSubmitRouter
export let roomsubmitRouter = express.Router();

//
roomsubmitRouter.post("/demo", async (req, res) => {
  let { content, headNumber, addTime, password, category } = req.body;
  let deleteTime;
  let userID = req.session["user.id"];

  console.log("category", category);

  if (addTime == 99) {
    deleteTime = null;
  } else {
    deleteTime = format(
      add(new Date(), { minutes: addTime }),
      "yyyy-MM-dd HH:mm:ss"
    );
  }

  console.log("deletedTime:", deleteTime);

  // let checkPW = !password ? false : true;
  let checkPW = true;
  if (!password) {
    checkPW = false;
  }

  // has_password

  try {
    await client.query(
      /* sql */ `insert into room (topic,headcount,deleted_at,password, haspassword,category_id, user_id) values ($1,$2,$3,$4,$5,$6,$7)`,
      [content, headNumber, deleteTime, password, checkPW, category, userID]
    );
  } catch (error) {
    console.log(error);
  }

  // await client.query;
  res.redirect("/homePage.html");
});

roomsubmitRouter.post("/password", async (req, res) => {
  let { roomID, password } = req.body;

  // check if pw or roomId exist

  let data = await client.query(
    /* sql */ `select (id) from room where id = $1 and password = $2`,
    [roomID, password]
  );

  if (!req.session["user.roomID"]) {
    req.session["user.roomID"] = [roomID];
  } else {
    req.session["user.roomID"] = [...req.session["user.roomID"], roomID];
  }

  // req.session["user.roomID"] = roomID;
  console.log("session roomID", req.session["user.roomID"]);

  res.json(data.rows);
});

roomsubmitRouter.post("/search", async (req, res) => {
  let { content } = req.body; //the value can be roomID or content
  console.log("value", content);

  let result = await client.query(
    /* sql */ `select * from room where (topic like $1 and id > 2) and (deleted_at > now() or deleted_at is null)`,
    [`%${content}%`]
  );
  
  console.log("result", result.rows);
  res.json(result.rows);
});

//
roomsubmitRouter.get("/getPermissionToRoom", async (req, res) => {
  let { roomID } = req.query;
  let roomIdArray: number[] = req.session?.["user.roomID"];

  let data = await client.query(
    /* sql */ `select haspassword 
    from room where id = $1`,
    [roomID]
  );

  if (data.rows[0].haspassword === false) {
    return res.status(200).json({ status: true });
  }

  console.log(roomID, roomIdArray);

  if (
    !!roomID &&
    !!roomIdArray &&
    Array.isArray(roomIdArray) &&
    roomIdArray.indexOf(+roomID as number) >= 0
  ) {
    return res.status(200).json({ status: true });
  } else {
    return res.status(400).json({ status: false });
  }
});
