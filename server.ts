import express from "express";
import { print } from "listening-on";
import SocketIO from "socket.io";
import http from "http";
import { topicRouter } from "./topic";

const app = express();
const server = new http.Server(app);
const io = new SocketIO.Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(topicRouter);

let counter = 0;
io.on("connection", (socket) => {
  socket.on("addRoom", () => {
    counter++;
    io.emit("counter", counter);
  });
});

app.use(express.static("public"));

const PORT = 8080;
server.listen(PORT, () => {
  print(PORT);
});

// app.listen(PORT, () => {
//   print(PORT);
// });
