import { Express } from "express";
import authRouter from "./authRouter";
import { booksRouter } from "./booksRouter";
import authoresRouter from "./authorsRouter";
import { Response } from "express";

export const router = (app: Express) => {
  app.use("/api/auth", authRouter);
  app.use("/api/books", booksRouter);
  app.use("/api/authors", authoresRouter);

  app.get("/", async (_: any, res: Response) => {
    return res.status(200).json({ msg: "hello there!" });
  });
};
