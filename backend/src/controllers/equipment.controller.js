import pool from "../db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Create new equipment
 */
export const createEquipment = asyncHandler(async (req, res) => {
  const {
    name,
    serialNumber,
    department,
    location,
    maintenanceTeamId,
    purchaseDate,
    warrantyExpiry,
    ownerName,
  } = req.body;

  if (!name || !serialNumber || !maintenanceTeamId) {
    throw new ApiError(400, "Required fields are missing");
  }

  if (purchaseDate && warrantyExpiry) {
    if (new Date(warrantyExpiry) < new Date(purchaseDate)) {
      throw new ApiError(400, "Warranty expiry cannot be before purchase date");
    }
  }

  const [result] = await pool.query(
    `INSERT INTO equipment
   (name, serial_number, department, location, maintenance_team_id,
    purchase_date, warranty_expiry, owner_name)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      serialNumber,
      department,
      location,
      maintenanceTeamId,
      purchaseDate || null,
      warrantyExpiry || null,
      ownerName || null,
    ]
  );

  res
    .status(201)
    .json(new ApiResponse(201, { id: result.insertId }, "Equipment created"));
});

/**
 * Get all equipment
 */
export const getAllEquipment = asyncHandler(async (req, res) => {
  const teamId = req.user.team_id;

  // Managers & technicians see only their team's equipment
  const [rows] = await pool.query(
    `SELECT * FROM equipment
     WHERE is_scrapped = false
     AND maintenance_team_id = ?`,
    [teamId]
  );

  const enrichedEquipment = rows.map((equipment) => {
    const isUnderWarranty =
      equipment.warranty_expiry &&
      new Date(equipment.warranty_expiry) >= new Date();

    return {
      ...equipment,
      isUnderWarranty,
    };
  });

  res.status(200).json(new ApiResponse(200, enrichedEquipment));
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

  const isUnderWarranty =
    equipment.warranty_expiry &&
    new Date(equipment.warranty_expiry) >= new Date();

  res.status(200).json(
    new ApiResponse(200, {
      ...equipment,
      isUnderWarranty,
    })
  );
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
