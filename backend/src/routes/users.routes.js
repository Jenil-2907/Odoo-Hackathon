import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

import {
  signupUser,
  loginUser,
  getTechnicians,
} from "../controllers/users.controller.js";

const userRouter = express.Router();

userRouter.post("/signup", signupUser);
userRouter.post("/login", loginUser);
userRouter.get(
  "/technicians",
  authenticate,
  authorize("manager"),
  getTechnicians
);

export default userRouter;
