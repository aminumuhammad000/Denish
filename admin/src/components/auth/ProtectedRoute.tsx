import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { clearAdminSession, isAdminSessionExpired } from "../../lib/auth";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("admin_token");
  const location = useLocation();

  if (!token || isAdminSessionExpired()) {
    clearAdminSession();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
