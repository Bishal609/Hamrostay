import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOpen, CreditCard, Clock, Star } from "lucide-react";
import { bookingApi } from "../../api/bookingApi";
import useAuthStore from "../../store/authStore";
import { fmtDate } from "../../utils/formatDate";
import { STATUS_COLORS } from "../../utils/constants";
import Loader from "../../components/common/Loader";

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => bookingApi.getBookings({ limit: 5 }).then(r => r.data.data),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const bookings = data?.bookings || [];
  const stats = {
    total:      bookings.length,
    confirmed:  bookings.filter(b => b.status === "CONFIRMED").length,
    checkedIn:  bookings.filter(b => b.status === "CHECKED_IN").length,
    spent:      bookings.filter(b => b.payment?.status === "COMPLETED").reduce((s,b) => s + b.finalAmount, 0),
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="card-gold p-6 bg-gradient-to-r from-dark-900 to-dark-800">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Welcome back, {user?.name}! 👋</h1>
        <p className="text-dark-400">Here's an overview of your stay history.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen,    label: "Total Bookings",  value: stats.total,     color: "text-blue-400",    bg: "bg-blue-500/10" },
          { icon: Clock,       label: "Confirmed",       value: stats.confirmed, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { icon: Star,        label: "Currently In",    value: stats.checkedIn, color: "text-gold-400",    bg: "bg-gold-500/10" },
          { icon: CreditCard,  label: "Total Spent",     value: `रू ${stats.spent.toFixed(0)}`, color: "text-purple-400", bg: "bg-purple-500/10" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-dark-400 text-xs">{label}</p>
              <p className="text-xl font-bold text-white font-mono">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="font-display font-semibold text-white text-lg">Recent Bookings</h2>
          <Link to="/bookings" className="text-gold-400 hover:text-gold-300 text-sm transition-colors">View all</Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-14">
            <BookOpen className="w-12 h-12 text-dark-700 mx-auto mb-3" />
            <p className="text-dark-400 mb-4">No bookings yet</p>
            <Link to="/rooms" className="btn-gold">Browse Rooms</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {["Booking Ref","Room","Check-In","Check-Out","Amount","Status",""].map(h => (
                    <th key={h} className="table-header text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-white/2 transition-colors">
                    <td className="table-cell font-mono text-xs text-gold-400">{b.bookingRef}</td>
                    <td className="table-cell">
                      <div>
                        <p className="text-white text-sm font-medium">{b.room?.name}</p>
                        <p className="text-dark-400 text-xs">#{b.room?.roomNumber}</p>
                      </div>
                    </td>
                    <td className="table-cell text-xs">{fmtDate(b.checkIn)}</td>
                    <td className="table-cell text-xs">{fmtDate(b.checkOut)}</td>
                    <td className="table-cell font-semibold text-gold-400">रू {b.finalAmount.toFixed(0)}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                    </td>
                    <td className="table-cell">
                      <Link to={`/booking/${b.id}`} className="text-gold-400 hover:text-gold-300 text-xs transition-colors">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card-gold p-6 text-center border border-gold-500/25">
        <p className="text-gold-400 font-display text-lg font-semibold mb-2">Ready for your next adventure?</p>
        <p className="text-dark-400 text-sm mb-4">Explore our luxury rooms and book your perfect getaway.</p>
        <Link to="/rooms" className="btn-gold inline-flex">Browse Rooms</Link>
      </div>
    </div>
  );
}