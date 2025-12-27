import { BrowserRouter, Routes, Route } from "react-router-dom";

// Common
import Nav from "./components/Nav.jsx";
import Home from "./pages/home.jsx";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Dashboard
import TechnicianDashboard from "./pages/TechnicianDashboard.jsx";

// Maintenance
import MaintenanceBoard from "./pages/Maintenance/MaintenanceBoard.jsx";
import CreateRequest from "./pages/Maintenance/CreateRequest.jsx";
import RequestDetails from "./pages/Maintenance/RequestDetails.jsx";

// Calendar
import MaintenanceCalendar from "./pages/Calendar/MaintenanceCalendar.jsx";

// Equipment
import EquipmentList from "./pages/Equipment/EquipmentList.jsx";
import EquipmentDetails from "./pages/Equipment/EquipmentDetails.jsx";

// Teams & Reports
import TeamList from "./pages/Teams/TeamList.jsx";
import MaintenanceReport from "./pages/Reports/MaintenanceReport.jsx";

// Auth
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Nav />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Technician Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="technician">
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/maintenance"
          element={
            <ProtectedRoute role="technician">
              <MaintenanceBoard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/maintenance/new"
          element={
            <ProtectedRoute role="technician">
              <CreateRequest />
            </ProtectedRoute>
          }
        />

        <Route
          path="/maintenance/:id"
          element={
            <ProtectedRoute role="technician">
              <RequestDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute role="technician">
              <MaintenanceCalendar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/equipment"
          element={
            <ProtectedRoute role="technician">
              <EquipmentList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/equipment/:id"
          element={
            <ProtectedRoute role="technician">
              <EquipmentDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teams"
          element={
            <ProtectedRoute role="technician">
              <TeamList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute role="technician">
              <MaintenanceReport />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
