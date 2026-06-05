// client/src/App.jsx
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Loader from "./components/common/Loader";
import PublicLayout from "./components/layout/PublicLayout";
import DashboardLayout from "./components/layout/DashboardLayout";

// ── Lazy-loaded pages ──────────────────────────────────────
// Public
const HomePage       = lazy(() => import("./pages/public/HomePage"));
const RoomsPage      = lazy(() => import("./pages/public/RoomsPage"));
const RoomDetailPage = lazy(() => import("./pages/public/RoomDetailPage"));
const AboutPage      = lazy(() => import("./pages/public/AboutPage"));
const ContactPage    = lazy(() => import("./pages/public/ContactPage"));
// Auth
const LoginPage    = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
// Customer
const CustomerDashboard = lazy(() => import("./pages/customer/CustomerDashboard"));
const MyBookings        = lazy(() => import("./pages/customer/MyBookings"));
const BookingDetail     = lazy(() => import("./pages/customer/BookingDetail"));
const ProfilePage       = lazy(() => import("./pages/customer/ProfilePage"));
const BookingSuccess    = lazy(() => import("./pages/customer/BookingSuccess"));
const KhaltiCheckout    = lazy(() => import("./pages/customer/KhaltiCheckout"));
// Admin
const AdminDashboard  = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageRooms     = lazy(() => import("./pages/admin/ManageRooms"));
const ManageBookings  = lazy(() => import("./pages/admin/ManageBookings"));
const ManageUsers     = lazy(() => import("./pages/admin/ManageUsers"));
const ManageVendors   = lazy(() => import("./pages/admin/ManageVendors"));
const FnmisDashboard  = lazy(() => import("./pages/admin/FnmisDashboard"));
// Vendor
const VendorDashboard = lazy(() => import("./pages/vendor/VendorDashboard"));
const VendorOrders    = lazy(() => import("./pages/vendor/VendorOrders"));
const VendorInventory = lazy(() => import("./pages/vendor/VendorInventory"));

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<Loader fullScreen />}>{children}</Suspense>
);

export default function App() {
  return (
    <Routes>
      {/* ── Public Routes ─────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route path="/"            element={<SuspenseWrapper><HomePage /></SuspenseWrapper>} />
        <Route path="/rooms"       element={<SuspenseWrapper><RoomsPage /></SuspenseWrapper>} />
        <Route path="/rooms/:id"   element={<SuspenseWrapper><RoomDetailPage /></SuspenseWrapper>} />
        <Route path="/about"       element={<SuspenseWrapper><AboutPage /></SuspenseWrapper>} />
        <Route path="/contact"     element={<SuspenseWrapper><ContactPage /></SuspenseWrapper>} />
      </Route>

      {/* ── Auth Routes ───────────────────────────── */}
      <Route path="/login"    element={<SuspenseWrapper><LoginPage /></SuspenseWrapper>} />
      <Route path="/register" element={<SuspenseWrapper><RegisterPage /></SuspenseWrapper>} />

      {/* ── Customer Routes ───────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN"]} />}>
        <Route element={<DashboardLayout role="CUSTOMER" />}>
          <Route path="/dashboard"              element={<SuspenseWrapper><CustomerDashboard /></SuspenseWrapper>} />
          <Route path="/bookings"               element={<SuspenseWrapper><MyBookings /></SuspenseWrapper>} />
          <Route path="/booking/:id"            element={<SuspenseWrapper><BookingDetail /></SuspenseWrapper>} />
          <Route path="/booking/:id/success"    element={<SuspenseWrapper><BookingSuccess /></SuspenseWrapper>} />
          <Route path="/khalti/:sessionId"      element={<SuspenseWrapper><KhaltiCheckout /></SuspenseWrapper>} />
          <Route path="/profile"                element={<SuspenseWrapper><ProfilePage /></SuspenseWrapper>} />
        </Route>
      </Route>

      {/* ── Admin Routes ──────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route element={<DashboardLayout role="ADMIN" />}>
          <Route path="/admin"              element={<SuspenseWrapper><AdminDashboard /></SuspenseWrapper>} />
          <Route path="/admin/rooms"        element={<SuspenseWrapper><ManageRooms /></SuspenseWrapper>} />
          <Route path="/admin/bookings"     element={<SuspenseWrapper><ManageBookings /></SuspenseWrapper>} />
          <Route path="/admin/users"        element={<SuspenseWrapper><ManageUsers /></SuspenseWrapper>} />
          <Route path="/admin/vendors"      element={<SuspenseWrapper><ManageVendors /></SuspenseWrapper>} />
          <Route path="/admin/fnmis"        element={<SuspenseWrapper><FnmisDashboard /></SuspenseWrapper>} />
        </Route>
      </Route>

      {/* ── Vendor Routes ─────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={["VENDOR"]} />}>
        <Route element={<DashboardLayout role="VENDOR" />}>
          <Route path="/vendor"           element={<SuspenseWrapper><VendorDashboard /></SuspenseWrapper>} />
          <Route path="/vendor/orders"    element={<SuspenseWrapper><VendorOrders /></SuspenseWrapper>} />
          <Route path="/vendor/inventory" element={<SuspenseWrapper><VendorInventory /></SuspenseWrapper>} />
        </Route>
      </Route>

      {/* ── Fallback ──────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
