import express from "express";
import {
  createBook,
  deleteBookById,
  getAllBooks,
  updateBookById,
} from "../controllers/booksController";
import { verifyJwt } from "../middlewares/verifyJwt";
import { verifyRole } from "../middlewares/verifyRole";

export const booksRouter = express.Router();

booksRouter.use(verifyJwt);

booksRouter.post("/createBook", verifyRole("admin"), createBook);
booksRouter.patch("/updateBook/:id", verifyRole("admin"), updateBookById);
booksRouter.delete("/deleteBook/:id", verifyRole("admin"), deleteBookById);
booksRouter.get("/getAllBooks", getAllBooks);
