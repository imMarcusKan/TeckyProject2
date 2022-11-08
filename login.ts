import express from "express";
import { print } from "listening-on";
import path from "path";
//import { Request, Response } from "express";

const app = express();

app.get("/", (req, res) => {
  res.sendFile(path.resolve("public", "login.html"));
});

app.use(express.static("public"));
const PORT = 8080;
app.listen(PORT, () => {
  print(PORT);
});
