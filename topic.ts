import express from "express";
import { client } from "./database";
import { format, add } from "date-fns";

export let topicRouter = express.Router();

topicRouter.post("/demo", async (req, res) => {
  let { content, headNumber, addTime } = req.body;
  console.log("addTime", addTime);
  let deleteTime = format(
    add(new Date(), { minutes: addTime }),
    "yyyy-MM-dd HH:mm:ss"
  );
  await client.query(
    /* sql */ `insert into demo (content,headcount,deleted_at) values ($1,$2,$3)`,
    [content, headNumber, deleteTime]
  );
  res.redirect("/homePage.html");
});
