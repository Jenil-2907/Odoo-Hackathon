import pool from "../db.js";

export const logRequestStatusChange = async ({
  requestId,
  oldStatus,
  newStatus,
  userId,
}) => {
  await pool.query(
    `INSERT INTO request_logs
     (request_id, old_status, new_status, changed_by)
     VALUES (?, ?, ?, ?)`,
    [requestId, oldStatus, newStatus, userId]
  );
};
