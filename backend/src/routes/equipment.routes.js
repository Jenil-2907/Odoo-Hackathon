import express from "express";
import {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  scrapEquipment,
} from "../controllers/equipment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const equipmentRouter = express.Router();

equipmentRouter.post("/", authenticate, authorize("manager"), createEquipment);

equipmentRouter.patch(
  "/:id/scrap",
  authenticate,
  authorize("manager"),
  scrapEquipment
);

equipmentRouter.get("/", getAllEquipment);
equipmentRouter.get("/:id", getEquipmentById);

export default equipmentRouter;
