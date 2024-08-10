import { NextFunction, Response } from "express";

const Credentials = (_: any, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
};
export default Credentials;
