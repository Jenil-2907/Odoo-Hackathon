import express from "express";
import {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  scrapEquipment,
} from "../controllers/equipment.controller.js";

const equipmentRouter = express.Router();

equipmentRouter.post("/", createEquipment);
equipmentRouter.get("/", getAllEquipment);
equipmentRouter.get("/:id", getEquipmentById);
equipmentRouter.patch("/:id/scrap", scrapEquipment);

export default equipmentRouter;
