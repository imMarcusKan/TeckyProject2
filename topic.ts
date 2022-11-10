import express from "express";
import { client } from "./database";
import { format, add } from "date-fns";

export let topicRouter = express.Router();

topicRouter.post("/demo", async (req, res) => {
  let { content, headNumber, addTime, password } = req.body;
  let deleteTime = format(
    add(new Date(), { minutes: addTime }),
    "yyyy-MM-dd HH:mm:ss"
  );
  await client.query(
    /* sql */ `insert into demo (content,headcount,deleted_at,password) values ($1,$2,$3,$4)`,
    [content, headNumber, deleteTime, password]
  );
  res.redirect("/homePage.html");
});
