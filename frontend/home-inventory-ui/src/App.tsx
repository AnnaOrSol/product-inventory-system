import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import Settings from "@/pages/Settings";
import InventoryRequirementsPage from "@/pages/InventoryRequirementsPage";
import LoginPage from "@/pages/LoginPage";
import OnboardingPage from "@/pages/OnboardingPage";
import { useAuth } from "@/context/AuthContext";
import RegisterPage from "@/pages/RegisterPage";
<<<<<<< HEAD
import FullInventory from "./pages/FullInventory";
=======
>>>>>>> main

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />

        <Route
          path="/requirements"
          element={
            <ProtectedRoute>
              <InventoryRequirementsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
<<<<<<< HEAD
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <FullInventory />
            </ProtectedRoute>
          }
        />
=======
>>>>>>> main
      </Routes>
    </BrowserRouter>
  );
}