import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateAccessToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      role: user.role,
      team_id: user.team_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

export const generateRefreshToken = () =>
  crypto.randomBytes(40).toString("hex");

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
