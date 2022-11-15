import express from "express";
import { client } from "./database";

export let messageRouter = express.Router();

messageRouter.get("/messages/:roomID", async (req, res) => {
  let roomID = req.params.roomID;
  let username = req.session["user.username"];

  let result = await client.query(
    /* sql */ `select users.id, username, content, room_id, created_at from message left outer join users on message.users_id = users.id where room_id = $1 order by created_at ASC`,
    [roomID]
  );
  let message = result.rows;
  res.json({ messages: message, username: username }); // req.session["name"]
});

// messageRouter.post('/message/:roomID', async (req,res)=>{
//     let roomID = req.params.roomID

//     await client.query(/* sql*/ `insert into message(content, users_id, room_id) values ($1,$2,$3)`)
// })
