import express from "express";
import { print } from "listening-on";
import SocketIO from "socket.io";
import http from "http";
import { topicRouter } from "./topic";
import { createRoomRouter } from "./room";
import { userRouter } from "./userRouter";
import path from "path";

const app = express();
const server = new http.Server(app);
const io = new SocketIO.Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.sendFile(path.resolve("public", "login.html"));
});

app.use(topicRouter);
app.use(userRouter);
app.use(createRoomRouter(io));
app.use(express.static("public"));

// app.use((req, res) => {
//   res.status(404);
//   res.sendFile(path.resolve("public", "404.html"));
// });
const PORT = 8080;
server.listen(PORT, () => {
  print(PORT);
});

// app.listen(PORT, () => {
//   print(PORT);
// });
