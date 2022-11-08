import express from "express";

//import path from "path";
//import { Request, Response } from "express";

export const userRouter = express.Router();

userRouter.post("/register", (req, res) => {
  console.log(req.body);
  res.end();
});
