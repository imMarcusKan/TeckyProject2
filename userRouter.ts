import express from "express";
import { client } from "./database";
import { checkPassword } from "./hash";
import { hashPassword } from "./hash";
import "./session";
import jwt from "jsonwebtoken";
import { sendEmailToUser } from "./email";

export const userRouter = express.Router();
const JWT_SECRET = "Some super secret..";

/////////////////////edit username and password/////////////////////
userRouter.patch("/edit", async (req, res) => {
  try {
    let { username, password, password2 } = req.body;
    let user_id = req.session["user.id"];

    if (username) {
      let result = await client.query(`select * from users where username=$1`, [
        username,
      ]);
      if (result.rows[0]) {
        return res.json({ message: "username already used" });
      }
      await client.query(`UPDATE users set username=$1 where id=$2`, [
        username,
        user_id,
      ]);
    }
    if (password) {
      if (password != password2) {
        return res.json({ message: "password mismatch" });
      }
      let password_hash = await hashPassword(password);
      await client.query(`UPDATE users set password=$1 where id=$2`, [
        password_hash,
        user_id,
      ]);
    }
    return res.json({ message: "success" });
  } catch (error) {
    console.log(error);

    return res.json({ message: "error" });
  }
});

/////////////////////enter the registered email/////////////////////
userRouter.post("/forgot-password", async (req, res, next) => {
  const { email } = req.body;

  let data = await client.query(`select * from users where email=$1`, [email]);
  //console.log(data);
  let user = data.rows[0];
  if (!user) {
    res.json("user not registered");
    return;
  }
  const secret = JWT_SECRET + user.password;
  const payload = {
    email: user.email,
    id: user.id,
  };

  const token = jwt.sign(payload, secret, { expiresIn: "600s" });
  const link = `http://localhost:8080/reset-password.html?userId=${user.id}&token=${token}`;
  sendEmailToUser(user.email, link);
  //console.log(link);
  res.send("password reset link has been sent to ur email...");
});

/////////////////////reset password/////////////////////

userRouter.get("/reset-password/:id/:token", async (req, res, next) => {
  const { id, token } = req.params;

  let data = await client.query(`select * from users where id=$1`, [id]);
  //console.log(data);
  let user = data.rows[0];
  if (id != user.id) {
    res.send("invalid id...");
    return;
  }
  const secret = JWT_SECRET + user.password;
  try {
    const payload = jwt.verify(token, secret);

    res.render("reset-password");
    console.log(payload);
  } catch (error) {
    // console.log("fuck off");
    res.send("fuck off");
  }
});

/////////////////////enter a new password/////////////////////

userRouter.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password, password2 } = req.body;
  //console.log(req.params);
  let data = await client.query(`select * from users where id=$1`, [id]);

  let user = data.rows[0];

  const secret = JWT_SECRET + user.password;
  try {
    const payload = jwt.verify(token, secret);
    console.log(payload);
    if (password != password2) {
      return res.json({ message: "password different, please confirm again" });
    }
    let hashedPassword = await hashPassword(password);
    await client.query(`update users set password = $1 where id = $2`, [
      hashedPassword,
      user.id,
    ]);
    return res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "expired token" });
  }
});

/////////////////////homepage get username/////////////////////

userRouter.get("/current-user", (req, res) => {
  let username = req.session["user.username"];
  res.json(username);
});
/////////////////////login part/////////////////////
userRouter.post("/login", async (req, res) => {
  let { username, password } = req.body;

  if (!username) {
    res.status(400);
    return res.json({ status: false, message: `No username` });
  }

  if (!password) {
    res.status(400);
    return res.json({ status: false, message: `No password` });
  }

  let result = await client.query("select * from users where username=$1", [
    username,
  ]);

  let user = result.rows[0];

  if (!user) {
    return res.json({
      status: false,
      message: `username is wrong`,
      redirectUrl: "/",
    });
  }

  const match = await checkPassword(password, user.password);

  if (match) {
    res.status(200);
    req.session["user.id"] = user.id;
    req.session["user.username"] = username;
    // console.log("username: ", req.session["user.username"]);
    return res.json({
      status: true,
      message: `match`,
      redirectUrl: "/homepage.html",
      username: "username",
    });
  }

  return res.json({ status: false, message: `password is wrong` });
});

/////////////////////register part/////////////////////

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

  let returnID = await client.query(
    "INSERT INTO users (username,password,email) values ($1,$2,$3)returning id",
    [username, password_hash, email]
  );
  let userID = returnID.rows[0].id;
  res.status(200);
  req.session["user.id"] = userID;
  req.session["user.username"] = username;

  return res.json({ status: true, message: `success` });
});

/////////////////////session/////////////////////

userRouter.get("/userID", async (req, res) => {
  let username = req.session["user.username"];
  let data = await client.query(
    /* sql */ `select id from users where username = $1`,
    [username]
  );
  const id = data.rows.length === 1 ? data.rows[0].id : "";
  res.json({ id: id });
});
