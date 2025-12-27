import pool from "../db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * CREATE MAINTENANCE REQUEST
 * Flow: Breakdown / Preventive
 */
export const createRequest = asyncHandler(async (req, res) => {
  const { subject, type, equipmentId, scheduledDate } = req.body;

  if (!subject || !type || !equipmentId) {
    throw new ApiError(400, "Required fields are missing");
  }

  //  Auto-fill logic (Equipment → Team)
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
     (subject, type, status, equipment_id, team_id, scheduled_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      subject,
      type,
      status,
      equipmentId,
      maintenanceTeamId,
      scheduledDate || null,
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
  const { status, teamId, type } = req.query;

  let query = `SELECT * FROM maintenance_requests WHERE 1=1`;
  const values = [];

  if (status) {
    query += ` AND status = ?`;
    values.push(status);
  }

  if (teamId) {
    query += ` AND team_id = ?`;
    values.push(teamId);
  }

  if (type) {
    query += ` AND type = ?`;
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

  const [rows] = await pool.query(
    `SELECT * FROM maintenance_requests WHERE equipment_id = ?`,
    [equipmentId]
  );

  res.status(200).json(new ApiResponse(200, rows));
});

/**
 * ASSIGN TECHNICIAN
 */
export const assignTechnician = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { technicianId } = req.body;

  if (!technicianId) {
    throw new ApiError(400, "Technician ID is required");
  }

  // NOTE: Team ownership check can be added once technician table exists
  await pool.query(
    `UPDATE maintenance_requests SET assigned_technician_id = ?
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

  const allowedTransitions = {
    New: ["In Progress"],
    "In Progress": ["Repaired", "Scrap"],
  };

  const [[request]] = await pool.query(
    `SELECT status FROM maintenance_requests WHERE id = ?`,
    [id]
  );

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (!allowedTransitions[request.status]?.includes(status)) {
    throw new ApiError(400, "Invalid status transition");
  }

  await pool.query(`UPDATE maintenance_requests SET status = ? WHERE id = ?`, [
    status,
    id,
  ]);

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

  await pool.query(
    `UPDATE maintenance_requests
     SET status = 'Repaired', duration_hours = ?
     WHERE id = ?`,
    [durationHours, id]
  );

  res.status(200).json(new ApiResponse(200, null, "Request completed"));
});

/**
 * SCRAP REQUEST (AND EQUIPMENT)
 */
export const scrapRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get equipment ID
  const [[request]] = await pool.query(
    `SELECT equipment_id FROM maintenance_requests WHERE id = ?`,
    [id]
  );

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  await pool.query(
    `UPDATE maintenance_requests SET status = 'Scrap' WHERE id = ?`,
    [id]
  );

  await pool.query(`UPDATE equipment SET is_scrapped = true WHERE id = ?`, [
    request.equipment_id,
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Request and equipment scrapped"));
});

/**
 * CALENDAR VIEW (Preventive Only)
 */
export const getPreventiveCalendar = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT * FROM maintenance_requests WHERE type = 'Preventive'`
  );

  res.status(200).json(new ApiResponse(200, rows));
});
