import express from "express";
import { client } from "./database";

export let passwordRouter = express.Router();

passwordRouter.get("/roompassword", async (req, res) => {
  let result = await client.query(
    /* sql */ `select * from demo where password is not null`
  );
  res.json(result.rows);
});
