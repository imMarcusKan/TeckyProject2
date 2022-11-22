import express from "express";
import { client } from "./database";

import {escape} from 'html-escaper';

export let messageRouter = express.Router();

messageRouter.get("/messages/:roomID", async (req, res) => {
  let roomID = req.params.roomID;
  let username = req.session["user.username"];

  let result = await client.query(
    /* sql */ `select users.id, username, content, room_id, created_at from message left outer join users on message.users_id = users.id where room_id = $1 order by created_at ASC`,
    [roomID]
  );

  // import {escape} from 'html-escaper';


  let message = result.rows.map( v => {
    return {
      ...v,
      content: escape(v.content)
    }
  });


  res.json({ messages: message, username: username }); // req.session["name"]
});

messageRouter.get("/secretmessage", async (req, res) => {
  let username = req.session["user.username"];

  let result = await client.query(
    /* sql */ `select users.id, username, content, room_id, created_at from message left outer join users on message.users_id = users.id where username = $1 order by created_at ASC`,
    [username]
  );

  res.json(result.rows);
});

messageRouter.get("/topic/:roomID", async (req, res) => {
  let roomID = req.params.roomID;
  // console.log(roomID)
  let result = await client.query(`select * from room where id = $1`, [roomID]);
  // console.log('result.rows', result.rows)
  res.json(result.rows);
});
