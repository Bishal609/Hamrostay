import { useParams, useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Download, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "../../api/bookingApi";
import { paymentApi } from "../../api/paymentApi";
import { fmtDate } from "../../utils/formatDate";
import Loader from "../../components/common/Loader";

export default function BookingSuccess() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingApi.getBookingById(id).then(r => r.data.data),
  });

  const { data: paymentVerification } = useQuery({
    queryKey: ["payment-verification", sessionId],
    queryFn: () => paymentApi.verifyPayment(sessionId).then(r => r.data.data),
    enabled: !!sessionId,
    retry: false,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader size="lg" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 animate-pulse-gold">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
        <p className="text-dark-400 mb-8">Your reservation is confirmed. A confirmation email has been sent.</p>

        {booking && (
          <div className="card p-6 text-left mb-6 border border-gold-500/20">
            <div className="space-y-3 text-sm">
              {[
                ["Booking Ref",  booking.bookingRef],
                ["Room",         booking.room?.name],
                ["Check-In",     fmtDate(booking.checkIn)],
                ["Check-Out",    fmtDate(booking.checkOut)],
                ["Guests",       booking.guests],
                ["Total Paid",   `रू${booking.finalAmount.toFixed(2)}`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-dark-400">{label}</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Link to="/bookings" className="flex-1 btn-outline-gold flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> My Bookings
          </Link>
          <Link to="/" className="flex-1 btn-gold flex items-center justify-center gap-2">
            <Home className="w-4 h-4" /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}