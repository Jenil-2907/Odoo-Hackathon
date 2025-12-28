import pool from "../db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * CREATE TEAM (Manager only)
 */
export const createTeam = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Team name is required");
  }

  // Prevent duplicate teams
  const [[existing]] = await pool.query(
    "SELECT id FROM teams WHERE name = ?",
    [name]
  );

  if (existing) {
    throw new ApiError(409, "Team already exists");
  }

  const [result] = await pool.query(
    "INSERT INTO teams (name) VALUES (?)",
    [name]
  );

  res.status(201).json(
    new ApiResponse(
      201,
      { id: result.insertId, name },
      "Team created successfully"
    )
  );
});

/**
 * GET ALL TEAMS
 */
export const getAllTeams = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name FROM teams ORDER BY name"
  );

  res.status(200).json(new ApiResponse(200, rows));
});
