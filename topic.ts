import express from "express";
import { client } from "./database";

export let topicRouter = express.Router();

topicRouter.post("/demo", async (req, res) => {
  //   console.log(req.body);

  let { content } = req.body;
  await client.query(/* sql */ `insert into demo (content) values ($1)`, [
    content,
  ]);
  res.redirect("/createRoom.html");
});
