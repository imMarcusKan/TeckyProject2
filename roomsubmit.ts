import express from "express";
import { client } from "./database";
import { format, add } from "date-fns";

export let roomsubmitRouter = express.Router();

roomsubmitRouter.post("/demo", async (req, res) => {
  let { content, headNumber, addTime, password, category } = req.body;
  let deleteTime;
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
    /* sql */ `insert into room (topic,headcount,deleted_at,password, haspassword,category_id) values ($1,$2,$3,$4,$5,$6)`,
    [content, headNumber, deleteTime, password, checkPW, category]
  );
  await client.query;
  res.redirect("/homePage.html");
});

roomsubmitRouter.post("/password", async (req, res) => {
  let { roomID, password } = req.body;
  let data = await client.query(
    /* sql */ `select (id) from room where id = $1 and password = $2`,
    [roomID, password]
  );
  console.log("data.rows when typing wrong pw", data.rows);
  res.json(data.rows);
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

roomsubmitRouter.post("/search", async (req, res) => {
  let { content } = req.body; //the value can be roomID or content
  console.log("value", content);
  let result = await client.query(
    /* sql */ `select * from room where topic like $1 and deleted_at > now() or deleted_at is null`,
    [`%${content}%`]
  );
  console.log("result", result.rows);
  res.json(result.rows);
});
