import express from "express";
import { client } from "./database";
import { format, add } from "date-fns";

export let roomsubmitRouter = express.Router();

roomsubmitRouter.post("/demo", async (req, res) => {
  let { content, headNumber, addTime, password } = req.body;
  let deleteTime = format(
    add(new Date(), { minutes: addTime }),
    "yyyy-MM-dd HH:mm:ss"
  );
  let checkPW = true;
  if (!password) {
    checkPW = false;
  }
  await client.query(
    /* sql */ `insert into demo (content,headcount,deleted_at,password, haspassword) values ($1,$2,$3,$4,$5)`,
    [content, headNumber, deleteTime, password, checkPW]
  );
  res.redirect("/homePage.html");
});

roomsubmitRouter.post("/password", async (req, res) => {
  let { id, password } = req.body;
  let data = await client.query(
    /* sql */ `select (id) from demo where id = $1 and password = $2 and deleted_at > now()`,
    [id, password]
  );
  res.json(data.rows);
});
