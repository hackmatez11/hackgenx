import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext_simple";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import PatientDashboard from "./pages/PatientDashboard";
import QueueDashboard from "./pages/QueueDashboard";
import BedManagement from "./pages/BedManagement";
import Patients from "./pages/Patients";
import AIPrediction from "./pages/AIPrediction";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Patient-only routes */}
          <Route
            path="/patient-dashboard"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Doctor-only routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="doctor">
                <Layout>
                  <QueueDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bed-management"
            element={
              <ProtectedRoute requiredRole="doctor">
                <Layout>
                  <BedManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute requiredRole="doctor">
                <Layout>
                  <Patients />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-prediction"
            element={
              <ProtectedRoute requiredRole="doctor">
                <Layout>
                  <AIPrediction />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
