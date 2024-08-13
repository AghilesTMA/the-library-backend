import express from "express";
import {
  buyBook,
  createBook,
  deleteBookById,
  getAllBooks,
  getPurchasedBooks,
  updateBookById,
} from "../controllers/booksController";
import { verifyJwt } from "../middlewares/verifyJwt";
import { verifyRole } from "../middlewares/verifyRole";

export const booksRouter = express.Router();

booksRouter.use(verifyJwt);

//admin end-points
booksRouter.post("/createBook", verifyRole("admin"), createBook);
booksRouter.patch("/updateBook/:id", verifyRole("admin"), updateBookById);
booksRouter.delete("/deleteBook/:id", verifyRole("admin"), deleteBookById);

//user end-pointes
booksRouter.post("/buyBook", verifyRole("user"), buyBook);
booksRouter.get("/purchaseList", verifyRole("user"), getPurchasedBooks);

// general end-points
booksRouter.get("/getAllBooks", getAllBooks);
