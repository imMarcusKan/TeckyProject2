import express from "express";
import { client } from "./database";

export let roomRouter = express.Router();

roomRouter.get("/room", async (req, res) => {
  let result = await client.query(/* sql */ `select content from demo`);
  res.json(result.rows);
});
