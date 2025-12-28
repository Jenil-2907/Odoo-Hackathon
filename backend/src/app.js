import "dotenv/config";
import express from "express";
import cors from "cors";
import ApiError from "./utils/ApiError.js";
import userRouter from "./routes/users.routes.js";
import equipmentRouter from "./routes/equipment.routes.js";
import requestRoute from "./routes/request.routes.js";
import teamRouter from "./routes/team.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/equipment", equipmentRouter);
app.use("/api/requests", requestRoute);
app.use("/api/teams", teamRouter);


// Health check (optional but nice)
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

// Global error handler (must be LAST)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
  });
});

export default app;
