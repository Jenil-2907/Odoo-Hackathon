import express from "express";
import {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  scrapEquipment,
} from "../controllers/equipment.controller.js";

const router = express.Router();

router.post("/", createEquipment);
router.get("/", getAllEquipment);
router.get("/:id", getEquipmentById);
router.patch("/:id/scrap", scrapEquipment);

export default router;
