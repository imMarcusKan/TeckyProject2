import express from "express";
import { client } from "./database";
import { format, add } from "date-fns";

export let roomsubmitRouter = express.Router();

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
  let checkPW = true;
  if (!password) {
    checkPW = false;
  }
  await client.query(
    /* sql */ `insert into room (topic,headcount,deleted_at,password, haspassword,category_id, user_id) values ($1,$2,$3,$4,$5,$6,$7)`,
    [content, headNumber, deleteTime, password, checkPW, category, userID]
  );
  // await client.query;
  res.redirect("/homePage.html");
});

roomsubmitRouter.post("/password", async (req, res) => {
  let { roomID, password } = req.body;
  let data = await client.query(
    /* sql */ `select (id) from room where id = $1 and password = $2`,
    [roomID, password]
  );
  req.session["user.roomID"] = roomID;
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
