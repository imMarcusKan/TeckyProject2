import express from "express";
import { print } from "listening-on";
import SocketIO from "socket.io";
import http from "http";
import { topicRouter } from "./topic";
import { createRoomRouter } from "./room";
import { userRouter } from "./userRouter";
import path from "path";
import expressSession from "express-session";

const app = express();
const server = new http.Server(app);
const io = new SocketIO.Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionMiddleware = expressSession({
  secret: "Tecky Academy teaches typescript",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
});

app.use(sessionMiddleware);

io.use((socket, next) => {
  let req = socket.request as express.Request;
  let res = req.res as express.Response;
  sessionMiddleware(req, res, next as express.NextFunction);
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve("public", "login.html"));
});

const genId = () => Math.floor(Math.random() * 10000000);
io.on("connection", function (socket) {
  const req = socket.request as express.Request;
  req.session["key"] = genId();

  (socket.request as any).session.save();

  // console.log("Hello a user has enter");
  socket.join("room-A");

  socket.emit("hello_user", { data: "hello", userId: req.session["key"] });

  socket.on("user_message", (data) => {
    console.log(data, req.session["key"]);
    io.to("room-A").emit("receive_data_from_server", {
      receivedData: data,
      sendUser: req.session["key"],
    });
  });
});

app.use(topicRouter);
app.use(userRouter);
app.use(createRoomRouter(io));
app.use(express.static("public"));

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
