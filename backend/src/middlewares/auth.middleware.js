import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, team_id }
    next();
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token");
  }
};
