import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthCallback from "./pages/AuthCallback";
import Onboarding from "./pages/Onboarding";
import Explore from "./pages/Explore";
import CreatorProfile from "./pages/CreatorProfile";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import Collabs from "./pages/Collabs";
import Leaderboard from "./pages/Leaderboard";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";

function ProtectedRoute({ children, requireOnboarded = false }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#525252]">Loading...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (requireOnboarded && !user.onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

function AppRouter() {
  const location = useLocation();
  // CRITICAL: Detect session_id synchronously during render (not in useEffect)
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Layout><Landing /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/signup" element={<Layout><Signup /></Layout>} />
      <Route path="/onboarding" element={<ProtectedRoute><Layout><Onboarding /></Layout></ProtectedRoute>} />
      <Route path="/explore" element={<Layout><Explore /></Layout>} />
      <Route path="/creator/:id" element={<Layout><CreatorProfile /></Layout>} />
      <Route path="/dashboard" element={<ProtectedRoute requireOnboarded><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/campaigns" element={<Layout><Campaigns /></Layout>} />
      <Route path="/campaigns/:id" element={<Layout><CampaignDetail /></Layout>} />
      <Route path="/collabs" element={<ProtectedRoute><Layout><Collabs /></Layout></ProtectedRoute>} />
      <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
      <Route path="/notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}
