import express from "express";
import { client } from "./database";
import { checkPassword } from "./hash";
import { hashPassword } from "./hash";
// import { Console } from "console";

export const userRouter = express.Router();

userRouter.post("/login", async (req, res) => {
  let { username, password } = req.body;
  console.log(req.body);

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
  console.log("result:", result);

  let user = result.rows[0];
  console.log("user:", user);

  if (!user) {
    console.log(user);
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
    res.json({ status: true, message: `you can suck now` });
  }

  return res.json({ status: false, message: `fail` });
});

userRouter.post("/register", async (req, res) => {
  let { username, password, email } = req.body;
  console.log(req.body);

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
