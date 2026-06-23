import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AdminSidebar } from "./components/admin/AdminSidebar";
import { TopNavbar } from "./components/admin/TopNavbar";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Toaster } from "sonner";
import { useAdminStore } from "./lib/store";
import { useEffect } from "react";

// Lazy-load pages
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Vendors from "./pages/Vendors";
import Drivers from "./pages/Drivers";
import Users from "./pages/Users";
import Disputes from "./pages/Disputes";
import Payments from "./pages/Payments";
import Analytics from "./pages/Analytics";
import Commissions from "./pages/Commissions";
import Content from "./pages/Content";
import Settings from "./pages/Settings";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const fetchAdminProfile = useAdminStore((state) => state.fetchAdminProfile);
  const fetchAllData = useAdminStore((state) => state.fetchAllData);

  useEffect(() => {
    fetchAdminProfile();
    fetchAllData();
  }, [fetchAdminProfile, fetchAllData]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAF9" }}>
      <AdminSidebar />
      <main style={{ marginLeft: 280, flex: 1, display: "flex", flexDirection: "column", overflowX: "hidden" }}>
        <TopNavbar />
        <div style={{ flex: 1 }}>{children}</div>
      </main>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  if (isLogin) return <LoginPage />;

  return (
    <AdminLayout>
      <ProtectedRoute>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/users" element={<Users />} />
          <Route path="/disputes" element={<Disputes />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/commissions" element={<Commissions />} />
          <Route path="/content" element={<Content />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ProtectedRoute>
    </AdminLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
