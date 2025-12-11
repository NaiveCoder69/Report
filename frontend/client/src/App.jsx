import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Materials from "./pages/Materials";
import Vendors from "./pages/Vendors";
import VendorDetails from "./pages/VendorDetails";
import Bills from "./pages/Bills";
import Expense from "./pages/Expense";
import LaborContractors from "./pages/LaborContractors";
import LaborContractorDetails from "./pages/LaborContractorDetails";
import CreateCompany from "./pages/CreateCompany";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Delivery from "./pages/Delivery";

// Join / invite flow
import JoinCompanyForm from "./components/JoinCompanyForm";
import JoinPending from "./components/JoinPending";
import CompanyInvite from "./components/CompanyInvite";
import JoinRequestsAdmin from "./components/JoinRequestsAdmin";

// Layout & auth
import NavBar from "./components/NavBar";
import { AuthContext } from "./contexts/AuthContext";

///////////////////////
// TEMP ProtectedRoute
///////////////////////

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Only check if user is logged in.
  // Do NOT check company or role for now.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

///////////////////////
// App
///////////////////////

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Join / create company flow (still reachable manually) */}
        <Route path="/join-company" element={<JoinCompanyForm />} />
        <Route path="/join-pending" element={<JoinPending />} />
        <Route path="/create-company" element={<CreateCompany />} />

        {/* Invite + admin pages (protected by login only) */}
        <Route
          path="/company/invite"
          element={
            <ProtectedRoute>
              <CompanyInvite />
            </ProtectedRoute>
          }
        />
        <Route
          path="/join-requests-admin"
          element={
            <ProtectedRoute>
              <JoinRequestsAdmin />
            </ProtectedRoute>
          }
        />

        {/* Main protected app routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materials"
          element={
            <ProtectedRoute>
              <Materials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendors"
          element={
            <ProtectedRoute>
              <Vendors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendors/:id"
          element={
            <ProtectedRoute>
              <VendorDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bills"
          element={
            <ProtectedRoute>
              <Bills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expense />
            </ProtectedRoute>
          }
        />
        <Route
          path="/labor-contractors"
          element={
            <ProtectedRoute>
              <LaborContractors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/labor-contractors/:id"
          element={
            <ProtectedRoute>
              <LaborContractorDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery"
          element={
            <ProtectedRoute>
              <Delivery />
            </ProtectedRoute>
          }
        />

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
