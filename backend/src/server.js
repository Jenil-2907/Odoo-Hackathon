import "dotenv/config";
import app from "./app.js";
import pool, { testDBConnection } from "./db.js";

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await testDBConnection();
    console.log(" MySQL connected successfully");
  } catch (err) {
    console.error(" MySQL connection failed:", err.message);
  }
})();

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
