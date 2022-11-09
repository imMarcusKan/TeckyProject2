import express from "express";
import { client } from "./database";

export let topicRouter = express.Router();

topicRouter.post("/demo", async (req, res) => {
  let { content, headNumber } = req.body;
  await client.query(
    /* sql */ `insert into demo (content,headcount) values ($1,$2)`,
    [content, headNumber]
  );
  res.redirect("/homePage.html");
});
