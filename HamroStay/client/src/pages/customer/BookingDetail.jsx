import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, CreditCard, Calendar, Users } from "lucide-react";
import { bookingApi } from "../../api/bookingApi";
import { paymentApi } from "../../api/paymentApi";
import { fmtDate, fmtDatetime } from "../../utils/formatDate";
import { STATUS_COLORS } from "../../utils/constants";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingApi.getBookingById(id).then(r => r.data.data),
  });

  const payMutation = useMutation({
    mutationFn: () => paymentApi.createSession(id).then(r => r.data.data),
    onSuccess: (d) => { window.location.href = d.url; },
    onError: (err) => toast.error(err.response?.data?.message || "Payment error."),
  });

  const cancelMutation = useMutation({
    mutationFn: () => bookingApi.cancelBooking(id),
    onSuccess: () => { toast.success("Booking cancelled."); qc.invalidateQueries(["booking", id]); },
    onError: (err) => toast.error(err.response?.data?.message || "Cancel failed."),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader size="lg" /></div>;
  if (!booking)  return <div className="text-center py-20 text-dark-400">Booking not found.</div>;

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-400 hover:text-gold-400 text-sm transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Booking Details</h1>
          <p className="text-dark-400 text-sm font-mono">{booking.bookingRef}</p>
        </div>
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${STATUS_COLORS[booking.status]}`}>{booking.status}</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Room */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-3">Room Details</h3>
          <img src={booking.room?.images?.[0] || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=60"} alt="" className="w-full h-40 object-cover rounded-xl mb-3" />
          <p className="font-semibold text-white">{booking.room?.name}</p>
          <p className="text-dark-400 text-sm">Room #{booking.room?.roomNumber}</p>
          <span className="badge-gold mt-2">{booking.room?.type}</span>
        </div>

        {/* Stay Info */}
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-white mb-3">Stay Information</h3>
          {[[Calendar,"Check-In",fmtDate(booking.checkIn)],[Calendar,"Check-Out",fmtDate(booking.checkOut)],[Users,"Guests",booking.guests]].map(([Icon,label,val])=>(
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center"><Icon className="w-4 h-4 text-gold-400"/></div>
              <div><p className="text-xs text-dark-400">{label}</p><p className="text-white text-sm font-medium">{val}</p></div>
            </div>
          ))}
          {booking.specialRequests && (
            <div className="p-3 rounded-xl bg-dark-800/50 border border-white/5">
              <p className="text-xs text-dark-400 mb-1">Special Requests</p>
              <p className="text-dark-200 text-sm">{booking.specialRequests}</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-4">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          {[["Subtotal",`$${booking.totalAmount?.toFixed(2)}`],["Discount",`-$${booking.discountAmount?.toFixed(2)}`],["Tax (13% VAT)",`$${booking.taxAmount?.toFixed(2)}`]].map(([l,v])=>(
            <div key={l} className="flex justify-between text-dark-300"><span>{l}</span><span>{v}</span></div>
          ))}
          <div className="flex justify-between font-bold text-white border-t border-white/10 pt-2">
            <span>Total</span><span className="text-gold-400">${booking.finalAmount?.toFixed(2)}</span>
          </div>
          {booking.payment && (
            <div className="flex justify-between text-xs text-dark-400 pt-1">
              <span>Payment Status</span>
              <span className={`font-medium ${STATUS_COLORS[booking.payment.status]?.split(" ")[1] || "text-white"}`}>{booking.payment.status}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {booking.status === "PENDING" && !booking.payment && (
          <button onClick={() => payMutation.mutate()} disabled={payMutation.isPending} className="btn-gold flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> {payMutation.isPending ? "Redirecting..." : "Pay Now"}
          </button>
        )}
        {["PENDING","CONFIRMED"].includes(booking.status) && (
          <button onClick={() => { if(window.confirm("Cancel this booking?")) cancelMutation.mutate(); }}
            className="px-4 py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 transition-colors">
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
}