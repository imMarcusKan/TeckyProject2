import express from "express";
import { client } from "./database";
import { checkPassword } from "./hash";
import { hashPassword } from "./hash";
import "./session";
import jwt from "jsonwebtoken";
import { sendEmailToUser } from "./email";
import formidable from "formidable";
import fs from "fs";

export const userRouter = express.Router();
const JWT_SECRET = "Some super secret..";

/////////////////////edit profile pic/////////////////////
const uploadDir = "uploads";

fs.mkdirSync(uploadDir, { recursive: true });
const form = formidable({
  uploadDir,
  keepExtensions: true,
  maxFiles: 1,
  maxFileSize: 10 * 1024 ** 2,
  filter: (part) => part.mimetype?.startsWith("image/") || false,
});

userRouter.post("/user/profile", (req, res) => {
  let user_id = req.session["user.id"];

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400);
      res.json({ err: "err in profile Pic form:" + err });
      return;
    }

    let {} = fields;
    let images = toArray(files.image);
    let image = images[0];

    await client.query(`UPDATE users set profile_pic=$1 where id=$2`, [
      image.newFilename,
      user_id,
    ]);

    return res.json({ message: "success" });
  });
});

function toArray<T>(field: T[] | T | undefined): T[] {
  if (Array.isArray(field)) {
    return field;
  }
  if (!field) {
    return [];
  }
  return [field];
}

/////////////////////edit username /////////////////////
userRouter.post("/user/username", async (req, res) => {
  let { username } = req.body;
  let user_id = req.session["user.id"];

  try {
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

      req.session["user.username"] = username;
    }

    return res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    return res.json({ err: "error" });
  }
});

/////////////////////edit password/////////////////////

userRouter.post("/user/password", async (req, res) => {
  let { password, password2 } = req.body;
  let user_id = req.session["user.id"];

  try {
    // if (!password) {
    //   return res.json({ err: "miss password" });
    // }
    if (password != password2) {
      return res.json({ message: "password mismatch" });
    }

    let password_hash = await hashPassword(password);

    await client.query(`UPDATE users set password=$1 where id=$2`, [
      password_hash,
      user_id,
    ]);

    return res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    return res.json({ err: "error" });
  }
});

//       let pass = fields.password;
//       let password: string = Array.isArray(pass) ? pass[0] : pass;
//       let { password2 } = fields;
//       console.log("files: ", files);

//     // let { username, password, password2, profile_pic } = formidable();

//     // if (username) {
//     //   let result = await client.query(`select * from users where username=$1`, [
//     //     username,
//     //   ]);
//     //   if (result.rows[0]) {
//     //     return res.json({ message: "username already used" });
//     //   }
//     //   await client.query(`UPDATE users set username=$1 where id=$2`, [
//     //     username,
//     //     user_id,
//     //   ]);
//     // }
//   } catch (error) {
//     console.log(error);

//     res.json({ err: "error" });
//   }
// });

/////////////////////enter the registered email/////////////////////
userRouter.post("/forgot-password", async (req, res, next) => {
  const { email } = req.body;

  let data = await client.query(`select * from users where email=$1`, [email]);
  //console.log(data);
  let user = data.rows[0];
  if (!user) {
    res.json("user not registered"); // object { msg: "yo"}
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

userRouter.get("/current-user", async (req, res) => {
  let username = await req.session["user.username"];

  console.log(`req.session["user.username"]`, req.session["user.username"]);

  return res.json(username);
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
  //console.log(user);

  if (!user) {
    return res.json({
      status: false,
      message: `username is wrong`,
      redirectUrl: "/login",
    });
  }

  const match = await checkPassword(password, user.password);

  if (!match) {
    res.json({
      status: false,
      message: `password is wrong`,
      redirectUrl: "/login",
    });
    return;
  }

  res.status(200);
  req.session["user.id"] = user.id;
  req.session["user.username"] = user.username;

  res.json({
    status: true,
    message: "match",
    username: "username",
    url: "/homepage.html",
  });
  return;

  // console.log("username: ", req.session["user.username"]);
  // return res.json({
  //   status: true,
  //   message: `match`,
  //   redirectUrl: "../frontend/homepage.html",
  //   username: "username",
  // });
});

/////////////////////register part/////////////////////

userRouter.post("/register", async (req, res) => {
  let { username, password, email, gender } = req.body;

  if (password.length <= 7) {
    return res.json({
      status: false,
      message: "pw length must be larger than 8 words",
    });
  }

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
    "INSERT INTO users (username,password,email,gender) values ($1,$2,$3,$4)returning id",
    [username, password_hash, email, gender]
  );

  return res.json({ status: true, message: `success` });
});

/////////////////////session(ng g musk nei)/////////////////////

userRouter.get("/userID", async (req, res) => {
  let username = req.session["user.username"];

  let data = await client.query(
    /* sql */ `select id from users where username = $1`,
    [username]
  );

  const id = data.rows.length === 1 ? data.rows[0].id : "";

  res.json({ id: id });
});
