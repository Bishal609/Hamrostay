import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter } from "lucide-react";
import { bookingApi } from "../../api/bookingApi";
import { paymentApi } from "../../api/paymentApi";
import { fmtDate } from "../../utils/formatDate";
import { STATUS_COLORS, BOOKING_STATUSES } from "../../utils/constants";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

export default function MyBookings() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page,   setPage]   = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings", { search, status, page }],
    queryFn: () => bookingApi.getBookings({ search, status, page, limit: 10 }).then(r => r.data.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => bookingApi.cancelBooking(id),
    onSuccess: () => { toast.success("Booking cancelled."); qc.invalidateQueries(["my-bookings"]); },
    onError:   (err) => toast.error(err.response?.data?.message || "Cancel failed."),
  });

  const payMutation = useMutation({
    mutationFn: (id) => paymentApi.createSession(id).then(r => r.data.data),
    onSuccess: (d) => { window.location.href = d.url; },
    onError:   (err) => toast.error(err.response?.data?.message || "Payment failed."),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">My Bookings</h1>
        <p className="text-dark-400 text-sm">Manage all your reservations</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input type="text" placeholder="Search by reference..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input pl-10 text-sm" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input pl-10 text-sm w-auto">
            <option value="">All Status</option>
            {BOOKING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader size="lg" /></div>
      ) : data?.bookings?.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-4xl mb-4">📋</p>
          <h3 className="font-display text-xl text-white mb-2">No bookings found</h3>
          <Link to="/rooms" className="btn-gold mt-4 inline-flex">Browse Rooms</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.bookings?.map(b => (
            <div key={b.id} className="card p-5 flex flex-col sm:flex-row gap-4">
              <img src={b.room?.images?.[0] || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200&q=60"}
                alt="" className="w-full sm:w-28 h-24 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-white">{b.room?.name}</h3>
                    <p className="text-dark-400 text-xs font-mono">Ref: {b.bookingRef}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-dark-300 mb-3">
                  <span>Check-in: <span className="text-white">{fmtDate(b.checkIn)}</span></span>
                  <span>Check-out: <span className="text-white">{fmtDate(b.checkOut)}</span></span>
                  <span>Guests: <span className="text-white">{b.guests}</span></span>
                  <span>Total: <span className="text-gold-400 font-semibold">${b.finalAmount.toFixed(2)}</span></span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link to={`/booking/${b.id}`} className="btn-outline-gold text-xs py-1.5 px-3">View Details</Link>
                  {b.status === "PENDING" && !b.payment && (
                    <button onClick={() => payMutation.mutate(b.id)} disabled={payMutation.isPending}
                      className="btn-gold text-xs py-1.5 px-3">Pay Now</button>
                  )}
                  {["PENDING","CONFIRMED"].includes(b.status) && (
                    <button onClick={() => { if(window.confirm("Cancel this booking?")) cancelMutation.mutate(b.id); }}
                      className="px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 text-xs hover:bg-red-500/10 transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}