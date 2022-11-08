import express from "express";
import { print } from "listening-on";
import SocketIO from "socket.io";
import http from "http";
import { topicRouter } from "./topic";
import { createRoomRouter } from "./room";

const app = express();
const server = new http.Server(app);
const io = new SocketIO.Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(topicRouter);
app.use(createRoomRouter(io));

app.use(express.static("public"));

const PORT = 8080;
server.listen(PORT, () => {
  print(PORT);
});

// app.listen(PORT, () => {
//   print(PORT);
// });
