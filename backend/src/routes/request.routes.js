import express from "express";
import {
  createRequest,
  getAllRequests,
  getRequestsByEquipment,
  assignTechnician,
  updateRequestStatus,
  completeRequest,
  scrapRequest,
  getPreventiveCalendar,
} from "../controllers/request.controller.js";

const requestRoute = express.Router();

requestRoute.post("/", createRequest);
requestRoute.get("/", getAllRequests);

requestRoute.get("/equipment/:equipmentId", getRequestsByEquipment);
requestRoute.get("/calendar", getPreventiveCalendar);

requestRoute.patch("/:id/assign", assignTechnician);
requestRoute.patch("/:id/status", updateRequestStatus);
requestRoute.patch("/:id/complete", completeRequest);
requestRoute.patch("/:id/scrap", scrapRequest);

export default requestRoute;
