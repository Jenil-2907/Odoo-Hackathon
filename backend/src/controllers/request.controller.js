import pool from "../db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { logRequestStatusChange } from "../utils/auditLogger.js";

const FINAL_STATUSES = ["Repaired", "Scrap"];

const ALLOWED_TRANSITIONS = {
  New: ["In Progress"],
  "In Progress": ["Repaired", "Scrap"],
};

/**
 * CREATE MAINTENANCE REQUEST
 * Flow: Breakdown / Preventive
 */
export const createRequest = asyncHandler(async (req, res) => {
  const { subject, type, equipmentId, scheduledDate } = req.body;
  const userId = req.user.id;

  if (!subject || !type || !equipmentId) {
    throw new ApiError(400, "Required fields are missing");
  }

  // 🔴 Auto-fill logic (Equipment → Team)
  // NOTE: This will work once equipment table exists
  const [[equipment]] = await pool.query(
    `SELECT maintenance_team_id FROM equipment WHERE id = ?`,
    [equipmentId]
  );

  if (!equipment) {
    throw new ApiError(404, "Equipment not found");
  }

  const maintenanceTeamId = equipment.maintenance_team_id;

  // Default values
  const status = "New";

  // Insert request
  const [result] = await pool.query(
    `INSERT INTO maintenance_requests
    (subject, type, status, equipment_id, team_id, scheduled_date, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      subject,
      type,
      status,
      equipmentId,
      maintenanceTeamId,
      scheduledDate || null,
      userId,
    ]
  );

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { requestId: result.insertId },
        "Maintenance request created"
      )
    );
});

/**
 * GET ALL REQUESTS (Kanban View)
 */
export const getAllRequests = asyncHandler(async (req, res) => {
  const { status, type } = req.query;
  const { role, team_id, id } = req.user;

  let query = `SELECT * FROM maintenance_requests WHERE 1=1`;
  const values = [];

  if (role === "user") {
    query += " AND created_by = ?";
    values.push(id);
  }

  if (role === "technician" || role === "manager") {
    query += " AND team_id = ?";
    values.push(team_id);
  }

  if (status) {
    query += " AND status = ?";
    values.push(status);
  }

  if (type) {
    query += " AND type = ?";
    values.push(type);
  }

  const [rows] = await pool.query(query, values);

  res.status(200).json(new ApiResponse(200, rows));
});

/**
 * GET REQUESTS BY EQUIPMENT (Smart Button)
 */
export const getRequestsByEquipment = asyncHandler(async (req, res) => {
  const { equipmentId } = req.params;

  if (req.user.role === "user") {
    const [rows] = await pool.query(
      `SELECT * FROM maintenance_requests 
       WHERE equipment_id = ? AND created_by = ?`,
      [equipmentId, req.user.id]
    );
    return res.status(200).json(new ApiResponse(200, rows));
  }

  const [rows] = await pool.query(
    `SELECT * FROM maintenance_requests 
     WHERE equipment_id = ? AND team_id = ?`,
    [equipmentId, req.user.team_id]
  );

  res.status(200).json(new ApiResponse(200, rows));
});

/**
 * ASSIGN TECHNICIAN
 */
export const assignTechnician = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { technicianId } = req.body;

  if (req.user.role !== "manager") {
    throw new ApiError(403, "Only manager can assign technician");
  }

  if (!technicianId) {
    throw new ApiError(400, "Technician ID is required");
  }

  const [[request]] = await pool.query(
    "SELECT * FROM maintenance_requests WHERE id = ?",
    [id]
  );

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (FINAL_STATUSES.includes(request.status)) {
    throw new ApiError(
      400,
      "Cannot assign technician to completed or scrapped request"
    );
  }

  if (request.assigned_technician_id) {
    throw new ApiError(400, "Technician already assigned");
  }

  if (req.user.team_id !== request.team_id) {
    throw new ApiError(403, "Not authorized");
  }

  const [[technician]] = await pool.query(
    `SELECT id FROM users
     WHERE id = ? AND role = 'technician' AND team_id = ?`,
    [technicianId, req.user.team_id]
  );

  if (!technician) {
    throw new ApiError(400, "Invalid technician for this team");
  }

  await pool.query(
    `UPDATE maintenance_requests
     SET assigned_technician_id = ?
     WHERE id = ?`,
    [technicianId, id]
  );

  res.status(200).json(new ApiResponse(200, null, "Technician assigned"));
});

/**
 * UPDATE REQUEST STATUS (Kanban Drag & Drop)
 */
export const updateRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const [[request]] = await pool.query(
    "SELECT * FROM maintenance_requests WHERE id = ?",
    [id]
  );

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (FINAL_STATUSES.includes(request.status)) {
    throw new ApiError(
      400,
      "Cannot change status of completed or scrapped request"
    );
  }

  if (req.user.team_id !== request.team_id) {
    throw new ApiError(403, "Not authorized");
  }

  if (req.user.role === "technician") {
    if (request.assigned_technician_id !== req.user.id) {
      throw new ApiError(403, "You are not assigned to this request");
    }
    if (status === "Scrap") {
      throw new ApiError(403, "Technician cannot scrap request");
    }
  }

  if (!ALLOWED_TRANSITIONS[request.status]?.includes(status)) {
    throw new ApiError(400, "Invalid status transition");
  }

  const oldStatus = request.status;

  const [result] = await pool.query(
    `UPDATE maintenance_requests
     SET status = ?
     WHERE id = ? AND status = ?`,
    [status, id, oldStatus]
  );

  if (result.affectedRows === 0) {
    throw new ApiError(409, "Request was modified concurrently");
  }

  // ✅ AUDIT LOG AFTER SUCCESS
  await logRequestStatusChange({
    requestId: id,
    oldStatus,
    newStatus: status,
    userId: req.user.id,
  });

  res.status(200).json(new ApiResponse(200, null, "Status updated"));
});

/**
 * COMPLETE REQUEST (Repaired)
 */
export const completeRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { durationHours } = req.body;

  if (!durationHours) {
    throw new ApiError(400, "Duration is required");
  }

  const [[request]] = await pool.query(
    "SELECT * FROM maintenance_requests WHERE id = ?",
    [id]
  );

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (FINAL_STATUSES.includes(request.status)) {
    throw new ApiError(400, "Request already completed or scrapped");
  }

  if (request.status !== "In Progress") {
    throw new ApiError(400, "Only in-progress requests can be completed");
  }

  if (req.user.team_id !== request.team_id) {
    throw new ApiError(403, "Not authorized");
  }

  if (req.user.id !== request.assigned_technician_id) {
    throw new ApiError(
      403,
      "Only assigned technician can complete this request"
    );
  }

  const oldStatus = request.status;

  await pool.query(
    `UPDATE maintenance_requests
     SET status = 'Repaired', duration_hours = ?
     WHERE id = ?`,
    [durationHours, id]
  );

  // ✅ AUDIT LOG
  await logRequestStatusChange({
    requestId: id,
    oldStatus,
    newStatus: "Repaired",
    userId: req.user.id,
  });

  res.status(200).json(new ApiResponse(200, null, "Request completed"));
});

/**
 * SCRAP REQUEST (AND EQUIPMENT)
 */
export const scrapRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "manager") {
    throw new ApiError(403, "Only manager can scrap requests");
  }

  const [[request]] = await pool.query(
    "SELECT * FROM maintenance_requests WHERE id = ?",
    [id]
  );

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (FINAL_STATUSES.includes(request.status)) {
    throw new ApiError(400, "Request already completed or scrapped");
  }

  if (req.user.team_id !== request.team_id) {
    throw new ApiError(403, "Not authorized");
  }

  const oldStatus = request.status;

  await pool.query(
    "UPDATE maintenance_requests SET status = 'Scrap' WHERE id = ?",
    [id]
  );

  await pool.query("UPDATE equipment SET is_scrapped = true WHERE id = ?", [
    request.equipment_id,
  ]);

  // ✅ AUDIT LOG
  await logRequestStatusChange({
    requestId: id,
    oldStatus,
    newStatus: "Scrap",
    userId: req.user.id,
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Request and equipment scrapped"));
});

/**
 * CALENDAR VIEW (Preventive Only)
 */
export const getPreventiveCalendar = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT * FROM maintenance_requests
     WHERE type = 'Preventive' AND team_id = ?`,
    [req.user.team_id]
  );

  res.status(200).json(new ApiResponse(200, rows));
});

export const getRequestLogs = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const [logs] = await pool.query(
    `SELECT rl.*, u.name AS changed_by_name
     FROM request_logs rl
     JOIN users u ON rl.changed_by = u.id
     WHERE rl.request_id = ?
     ORDER BY rl.changed_at ASC`,
    [requestId]
  );

  res.status(200).json(new ApiResponse(200, logs));
});
