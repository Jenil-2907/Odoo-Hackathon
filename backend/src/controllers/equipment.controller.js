import pool from "../db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Create new equipment
 */
export const createEquipment = asyncHandler(async (req, res) => {
  const { name, serialNumber, department, location, maintenanceTeamId } =
    req.body;

  if (!name || !serialNumber || !maintenanceTeamId) {
    throw new ApiError(400, "Required fields are missing");
  }

  const [result] = await pool.query(
    `INSERT INTO equipment (name, serial_number, department, location, maintenance_team_id)
     VALUES (?, ?, ?, ?, ?)`,
    [name, serialNumber, department, location, maintenanceTeamId]
  );

  res
    .status(201)
    .json(new ApiResponse(201, { id: result.insertId }, "Equipment created"));
});

/**
 * Get all equipment
 */
export const getAllEquipment = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT * FROM equipment WHERE is_scrapped = false`
  );

  res.status(200).json(new ApiResponse(200, rows));
});

/**
 * Get equipment by ID
 */
export const getEquipmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [[equipment]] = await pool.query(
    `SELECT * FROM equipment WHERE id = ?`,
    [id]
  );

  if (!equipment) {
    throw new ApiError(404, "Equipment not found");
  }

  res.status(200).json(new ApiResponse(200, equipment));
});

/**
 * Scrap equipment
 */
export const scrapEquipment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [result] = await pool.query(
    `UPDATE equipment SET is_scrapped = true WHERE id = ?`,
    [id]
  );

  if (result.affectedRows === 0) {
    throw new ApiError(404, "Equipment not found");
  }

  res.status(200).json(new ApiResponse(200, null, "Equipment scrapped"));
});
