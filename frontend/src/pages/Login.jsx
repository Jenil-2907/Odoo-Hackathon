import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("technician"); // default for demo
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    // 🔐 DEMO AUTH LOGIC (Frontend-only)
    localStorage.setItem("token", "demo-token");
    localStorage.setItem("role", role);
    localStorage.setItem("userEmail", email);

    // Notify app about auth change (same-window)
    window.dispatchEvent(new Event('authChange'));

    // 🔁 Role-based redirect
    if (role === "technician") {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  }

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "2rem auto",
        padding: 20,
        border: "1px solid #eee",
        borderRadius: 8,
      }}
    >
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        {/* Role Selector */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Login as</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="technician">Technician</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </div>

        {error && (
          <div style={{ color: "red", marginBottom: 12 }}>{error}</div>
        )}

        <button type="submit" style={{ padding: "8px 16px" }}>
          Sign in
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
