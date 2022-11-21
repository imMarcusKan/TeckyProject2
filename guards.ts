import { Request, Response, NextFunction } from "express";

export function isLoggedIn(req: Request, res: Response, next: NextFunction) {
  if (req.session?.["user.id"]) {
    next();
  } else {
    res.redirect("/login.html");
  }
}

export function isPermittedToRoom(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let { roomID } = req.query;
  let roomIdArray: number[] = req.session?.["user.roomID"];

  console.log(roomID, roomIdArray);
  next();

  // if (!!roomID && roomIdArray.indexOf(+roomID as number) >= 0) {
  //   // have
  //   next();
  // } else {
  //   res.redirect("/homepage.html");
  // }
}
