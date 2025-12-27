import pool from "../db.js";
import bcrypt from "bcryptjs";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

/**
 * SIGNUP
 */
export const signupUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, teamId } = req.body;

  if (!name || !email || !password || !role) {
    throw new ApiError(400, "All fields are required");
  }

  const allowedRoles = ["manager", "technician", "user"];
  if (!allowedRoles.includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  if (!passwordRegex.test(password)) {
    throw new ApiError(
      400,
      "Password must contain lowercase, uppercase, special character and be at least 8 characters long"
    );
  }

  // Check email uniqueness
  const [[existingUser]] = await pool.query(
    `SELECT id FROM users WHERE email = ?`,
    [email]
  );

  if (existingUser) {
    throw new ApiError(409, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    `INSERT INTO users (name, email, password, role, team_id)
     VALUES (?, ?, ?, ?, ?)`,
    [name, email, hashedPassword, role, teamId || null]
  );

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { id: result.insertId, name, email, role },
        "Signup successful"
      )
    );
});

/**
 * LOGIN
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const [[user]] = await pool.query(`SELECT * FROM users WHERE email = ?`, [
    email,
  ]);

  if (!user) {
    throw new ApiError(404, "Account not exist");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid Password");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        team_id: user.team_id,
      },
      "Login successful"
    )
  );
});

/**
 * GET TECHNICIANS
 */
export const getTechnicians = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, name, email, team_id FROM users WHERE role = 'technician'`
  );

  res.status(200).json(new ApiResponse(200, rows));
});
