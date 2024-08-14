import express from "express";
import "dotenv/config";
import { Response } from "express";
import cors from "cors";
import Credentials from "./middlewares/credentials";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRouter";
import { booksRouter } from "./routes/booksRouter";
import { whiteList } from "./config";

//middlewares usage
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const app = express();
app.use(cors({ origin: whiteList }));
app.use(Credentials);
app.use(express.json());
app.use(cookieParser());

//routes
app.get("/",async (_: any, res: Response) => {
  return res.status(200).json({ msg: "hello there!" });
});
app.use("/api/auth", authRouter);
app.use("/api/books", booksRouter);

//starting web server
app.listen(port, () => {
  console.log(`server is running on: http://127.0.0.1:${port}`);
});
