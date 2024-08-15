import express from "express";
import { verifyRole } from "../middlewares/verifyRole";
import {
  createAuthor,
  deleteAuthor,
  getAllAuthors,
  updateAuthor,
} from "../controllers/authorsController";

const authoresRouter = express.Router();

authoresRouter.post("/createAuthor", verifyRole("admin"), createAuthor);
authoresRouter.patch("/updateAuthor/:id", verifyRole("admin"), updateAuthor);
authoresRouter.delete("/deleteAuthor/:id", verifyRole("admin"), deleteAuthor);

authoresRouter.get("/getAllAuthors", getAllAuthors);
export default authoresRouter;
