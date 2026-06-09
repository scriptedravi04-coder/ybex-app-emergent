import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
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
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";

function ProtectedRoute({ children, requireOnboarded = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-white/60">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireOnboarded && !user.onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};
const pageTransition = { duration: 0.35, ease: [0.22, 0.61, 0.36, 1] };

function Page({ children }) {
  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) return <AuthCallback />;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout><Page><Landing /></Page></Layout>} />
        <Route path="/login" element={<Layout><Page><Login /></Page></Layout>} />
        <Route path="/signup" element={<Layout><Page><Signup /></Page></Layout>} />
        <Route path="/onboarding" element={<ProtectedRoute><Layout><Page><Onboarding /></Page></Layout></ProtectedRoute>} />
        <Route path="/explore" element={<Layout><Page><Explore /></Page></Layout>} />
        <Route path="/creator/:id" element={<Layout><Page><CreatorProfile /></Page></Layout>} />
        <Route path="/dashboard" element={<ProtectedRoute requireOnboarded><Layout><Page><Dashboard /></Page></Layout></ProtectedRoute>} />
        <Route path="/campaigns" element={<Layout><Page><Campaigns /></Page></Layout>} />
        <Route path="/campaigns/:id" element={<Layout><Page><CampaignDetail /></Page></Layout>} />
        <Route path="/collabs" element={<ProtectedRoute><Layout><Page><Collabs /></Page></Layout></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Layout><Page><Chat /></Page></Layout></ProtectedRoute>} />
        <Route path="/chat/:userId" element={<ProtectedRoute><Layout><Page><Chat /></Page></Layout></ProtectedRoute>} />
        <Route path="/leaderboard" element={<Layout><Page><Leaderboard /></Page></Layout>} />
        <Route path="/notifications" element={<ProtectedRoute><Layout><Page><Notifications /></Page></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Page><Settings /></Page></Layout></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Layout><Page><Admin /></Page></Layout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AnimatedRoutes />
          <Toaster position="top-right" theme="dark" richColors />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}
