console.log("✅ users routes loaded");
import express from "express";
import {
  signupUser,
  loginUser,
  getTechnicians,
} from "../controllers/users.controller.js";

const userRouter = express.Router();

userRouter.post("/signup", signupUser);
userRouter.post("/login", loginUser);
userRouter.get("/technicians", getTechnicians);

export default userRouter;
