import express from "express";
import { client } from "./database";

//import path from "path";
//import { Request, Response } from "express";

export const userRouter = express.Router();

userRouter.post("/login", async (req, res) => {
  let { username, password } = req.body;
  console.log(req.body);
  let result = await client.query("select * from users where username=$1", [
    username,
  ]);
  console.log(result);
  console.log(password);
  res.end();
});

userRouter.post("/register", async (req, res) => {
  let { username, password, email } = req.body;

  await client.query(
    "INSERT INTO users (username,password,email) values ($1,$2,$3)",
    [username, password, email]
  );

  res.end();
});
