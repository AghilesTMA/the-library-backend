import express from "express";
import {
  logIn,
  logOut,
  signUp,
  verifyLogin,
} from "../controllers/authController";

const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/login", logIn);
authRouter.get("/logout", logOut);
authRouter.get("/verifylogin", verifyLogin);

export default authRouter;
