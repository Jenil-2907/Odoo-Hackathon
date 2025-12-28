import express from "express";
import { createTeam, getAllTeams } from "../controllers/team.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const teamRouter = express.Router();

teamRouter.post(
  "/",
  authenticate,
  authorize("manager"),
  createTeam
);

teamRouter.get(
  "/",
  authenticate,
  getAllTeams
);

export default teamRouter;
