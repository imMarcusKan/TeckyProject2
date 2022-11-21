import { Request, Response, NextFunction } from "express";

export function isEnteredPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.session?.["user.roomID"]) {
    next();
  } else {
    res.redirect("/homepage.html");
  }
}
