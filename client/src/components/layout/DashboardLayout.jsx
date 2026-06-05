import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BedDouble, BookOpen, Users, Store,
  BarChart3, Package, ShoppingCart, Crown, LogOut,
  Menu, X, Bell, Settings, ChevronRight
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import ChatWidget from "../chat/ChatWidget";
import { useRealTimeUpdates } from "../../hooks/useRealTimeUpdates";

const ADMIN_LINKS = [
  { to: "/admin",          icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/rooms",    icon: BedDouble,       label: "Rooms" },
  { to: "/admin/bookings", icon: BookOpen,        label: "Bookings" },
  { to: "/admin/users",    icon: Users,           label: "Users" },
  { to: "/admin/vendors",  icon: Store,           label: "Vendors" },
  { to: "/admin/fnmis",    icon: BarChart3,       label: "FNMIS" },
];
const CUSTOMER_LINKS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/bookings",  icon: BookOpen,        label: "My Bookings" },
  { to: "/rooms",     icon: BedDouble,       label: "Browse Rooms" },
  { to: "/profile",   icon: Settings,        label: "Profile" },
];
const VENDOR_LINKS = [
  { to: "/vendor",           icon: LayoutDashboard, label: "Dashboard" },
  { to: "/vendor/orders",    icon: ShoppingCart,    label: "Orders" },
  { to: "/vendor/inventory", icon: Package,         label: "Inventory" },
  { to: "/profile",          icon: Settings,        label: "Profile" },
];

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useRealTimeUpdates(); // Real-time socket updates → TanStack Query invalidation
  const links = role === "ADMIN" ? ADMIN_LINKS : role === "VENDOR" ? VENDOR_LINKS : CUSTOMER_LINKS;

  const handleLogout = async () => { await logout(); navigate("/"); };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-dark-900 border-r border-white/5 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
            <Crown className="w-4 h-4 text-dark-950" />
          </div>
          <span className="font-display font-bold text-gradient-gold">HamroStay</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-dark-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-gold-500/30" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center flex-shrink-0">
                <span className="text-dark-950 text-sm font-bold">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <span className="badge-gold text-[10px]">{user?.role}</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={["/admin","/dashboard","/vendor"].includes(to)}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/5">
          <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut className="w-4 h-4" /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-dark-950/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-dark-300 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <p className="text-sm text-dark-400 hidden lg:block">Welcome back, <span className="text-white font-semibold">{user?.name}</span></p>
          <button className="p-2 rounded-lg hover:bg-white/5 text-dark-300 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in"><Outlet /></main>
      </div>
      <ChatWidget />
    </div>
  );
}