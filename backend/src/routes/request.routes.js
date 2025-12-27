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
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const requestRoute = express.Router();

requestRoute.post("/", authenticate, createRequest);
requestRoute.get("/", getAllRequests);

requestRoute.get("/equipment/:equipmentId", getRequestsByEquipment);
requestRoute.get("/calendar", getPreventiveCalendar);

requestRoute.patch(
  "/:id/assign",
  authenticate,
  authorize("manager"),
  assignTechnician
);
requestRoute.patch(
  "/:id/status",
  authenticate,
  authorize("manager", "technician"),
  updateRequestStatus
);
requestRoute.patch(
  "/:id/complete",
  authenticate,
  authorize("technician"),
  completeRequest
);
requestRoute.patch(
  "/:id/scrap",
  authenticate,
  authorize("manager"),
  scrapRequest
);

export default requestRoute;
