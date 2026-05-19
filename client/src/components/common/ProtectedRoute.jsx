// client/src/components/common/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, accessToken } = useAuthStore();

  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to correct dashboard based on role
    const redirectMap = { ADMIN: "/admin", VENDOR: "/vendor", CUSTOMER: "/dashboard" };
    return <Navigate to={redirectMap[user.role] || "/"} replace />;
  }
  return <Outlet />;
}
