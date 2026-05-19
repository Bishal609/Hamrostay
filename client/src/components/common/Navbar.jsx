// client/src/components/common/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu, X, Bell, ChevronDown, LogOut,
  LayoutDashboard, BookOpen, Settings, Crown
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { userApi } from "../../api/allApis";
import { useQuery } from "@tanstack/react-query";

const NAV_LINKS = [
  { label: "Home",    to: "/" },
  { label: "Rooms",   to: "/rooms" },
  { label: "About",   to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate  = useNavigate();
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const dropRef = useRef(null);

  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => userApi.getNotifications().then((r) => r.data.data),
    enabled: isAuthenticated(),
    refetchInterval: 30000,
  });
  const unreadCount = notifData?.filter((n) => !n.isRead).length || 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const dashboardLink =
    user?.role === "ADMIN" ? "/admin" : user?.role === "VENDOR" ? "/vendor" : "/dashboard";

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
      scrolled
        ? "bg-dark-950/95 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
        : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold group-hover:shadow-gold-lg transition-all duration-300">
              <Crown className="w-5 h-5 text-dark-950" />
            </div>
            <div>
              <span className="text-lg font-display font-bold text-gradient-gold leading-none block">HamroStay</span>
              <span className="text-[10px] text-dark-400 tracking-[0.15em] uppercase leading-none">Luxury Hotels</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive ? "text-gold-400 bg-gold-500/10" : "text-dark-300 hover:text-white hover:bg-white/5"
                  }`
                }>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {isAuthenticated() ? (
              <>
                <Link to={dashboardLink} className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <Bell className="w-5 h-5 text-dark-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-gold-500 text-dark-950 text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="relative" ref={dropRef}>
                  <button onClick={() => setDropdown(!dropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold-500/30 transition-all duration-200">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-gold-500/40" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center">
                        <span className="text-dark-950 text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-white max-w-[100px] truncate">{user?.name}</span>
                    <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform duration-200 ${dropdown ? "rotate-180" : ""}`} />
                  </button>
                  {dropdown && (
                    <div className="absolute right-0 mt-2 w-56 card border border-white/10 py-1 z-50 animate-slide-down">
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-dark-400 truncate">{user?.email}</p>
                        <span className="badge-gold mt-1">{user?.role}</span>
                      </div>
                      {[
                        { to: dashboardLink, icon: LayoutDashboard, label: "Dashboard" },
                        { to: "/bookings",   icon: BookOpen,        label: "My Bookings" },
                        { to: "/profile",    icon: Settings,        label: "Profile" },
                      ].map(({ to, icon: Icon, label }) => (
                        <Link key={to} to={to} onClick={() => setDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-dark-300 hover:text-gold-400 hover:bg-gold-500/5 transition-colors">
                          <Icon className="w-4 h-4" /> {label}
                        </Link>
                      ))}
                      <div className="border-t border-white/5 mt-1">
                        <button onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/5 transition-colors">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login"    className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-gold text-sm py-2 px-5">Book Now</Link>
              </div>
            )}
            <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-white/5 text-dark-300 hover:text-white">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden border-t border-white/5 pb-4 pt-2 animate-slide-down">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-sm font-medium transition-colors mb-1 ${
                    isActive ? "text-gold-400 bg-gold-500/10" : "text-dark-300 hover:text-white hover:bg-white/5"
                  }`
                }>
                {link.label}
              </NavLink>
            ))}
            {!isAuthenticated() && (
              <div className="flex gap-2 mt-3">
                <Link to="/login"    onClick={() => setOpen(false)} className="flex-1 btn-outline-gold text-sm text-center py-2.5">Sign In</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="flex-1 btn-gold text-sm text-center py-2.5">Book Now</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
