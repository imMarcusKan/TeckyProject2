import express from "express";
import { print } from "listening-on";
import SocketIO from "socket.io";
import http from "http";
import { roomsubmitRouter } from "./roomsubmit";
import { createRoomRouter } from "./room";
import { userRouter } from "./userRouter";
import path from "path";
import "./session";
// import expressSession from "express-session";
import { sessionMiddleware } from "./session";
import { createChatRoomRouter } from "./chatroom";
import { messageRouter } from "./message";
import { isLoggedIn } from "./guards";

const app = express();
const server = new http.Server(app);
const io = new SocketIO.Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use((req, res, next) => {
//   console.log(Date.now(), req.method, req.url);
//   next();
// });

app.use(sessionMiddleware);

io.use((socket, next) => {
  let req = socket.request as express.Request;
  let res = req.res as express.Response;
  sessionMiddleware(req, res, next as express.NextFunction);
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve("public", "login.html"));
});

app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(roomsubmitRouter);
app.use(userRouter);
app.use(createRoomRouter(io));
app.use(createChatRoomRouter(io));
app.use(messageRouter);
app.use(isLoggedIn, express.static("frontend"));

app.post("/message", (req, res) => {
  console.log("creating body", req.body);
  const { message } = req.body;

  console.log("creating message", message);

  res.json({});
});

app.use((req, res) => {
  res.status(404);
  res.sendFile(path.resolve("public", "404.html"));
});

const PORT = 8080;
server.listen(PORT, () => {
  print(PORT);
});

// app.listen(PORT, () => {
//   print(PORT);
// });
