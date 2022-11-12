import express from "express";
import { client } from "./database";
import { checkPassword } from "./hash";
import { hashPassword } from "./hash";
import "./session";

export const userRouter = express.Router();

userRouter.get("/current-user", (req, res) => {
  let user = req.session.username;
  console.log("get session:", req.session.username);
  res.json({ user });
});

userRouter.post("/login", async (req, res) => {
  let { username, password } = req.body;

  if (!password) {
    res.status(400);
    return res.json({ status: false, message: `No username` });
  }

  if (!username) {
    res.status(400);
    return res.json({ status: false, message: `No password` });
  }

  let result = await client.query(
    "select username,password from users where username=$1",
    [username]
  );

  let user = result.rows[0];

  if (!user) {
    return res.json({
      status: false,
      message: `username and password is wrong`,
      redirectUrl: "/",
    });
  }

  const match = await checkPassword(password, user.password);

  if (match) {
    res.status(200);
    req.session.username = username;
    return res.json({
      status: true,
      message: `match`,
      redirectUrl: "/homepage.html",
      username: "username",
    });
  }

  return res.json({ status: false, message: `fail` });
});

userRouter.post("/register", async (req, res) => {
  let { username, password, email } = req.body;

  let result = await client.query(
    `select username from users where username=$1`,
    [username]
  );

  let usernameInDataBase = result.rows.length;

  if (usernameInDataBase > 0) {
    return res.json({ status: false, message: "username already used" });
  }

  let password_hash = await hashPassword(password);

  await client.query(
    "INSERT INTO users (username,password,email) values ($1,$2,$3)",
    [username, password_hash, email]
  );
  res.status(200);
  req.session.username = username;
  return res.json({ status: true, message: `success` });
});

userRouter.get("/userID", async (req, res) => {
  let username = req.session.username;
  let data = await client.query(
    /* sql */ `select id from users where username = $1`,
    [username]
  );
  const id = data.rows.length === 1 ? data.rows[0].id : "";
  res.json({ id: id });
});
