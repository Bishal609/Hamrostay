import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, ArrowRight, AlertTriangle } from "lucide-react";
import { paymentApi } from "../../api/paymentApi";
import Loader from "../../components/common/Loader";

export default function EsewaCheckout() {
  const { sessionId } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["esewa-session", sessionId],
    queryFn: () => paymentApi.getEsewaSession(sessionId).then((r) => r.data.data),
    enabled: Boolean(sessionId),
  });

  useEffect(() => {
    if (data) {
      const form = document.forms["esewa-form"];
      if (form) form.submit();
    }
  }, [data]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader size="lg" /></div>;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card max-w-lg p-6 text-center">
          <AlertTriangle className="mx-auto mb-4 w-12 h-12 text-red-400" />
          <h1 className="text-2xl font-bold text-white mb-2">Payment could not start</h1>
          <p className="text-dark-400 mb-4">Please try again from your booking page.</p>
          <Link to="/bookings" className="btn-gold inline-flex items-center gap-2">
            Go to My Bookings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full card p-6 space-y-6">
        <div className="flex items-center gap-3 text-green-400">
          <CheckCircle className="w-8 h-8" />
          <h1 className="text-xl font-semibold text-white">Redirecting to eSewa</h1>
        </div>
        <p className="text-dark-300">We are securely sending your payment details to eSewa. Please do not close this window.</p>

        <div className="rounded-2xl bg-dark-900 border border-white/10 p-4">
          <div className="grid grid-cols-2 gap-3 text-sm text-dark-400">
            <div>
              <p className="text-white font-medium">Amount</p>
              <p className="mt-1 text-gold-400">रू{data.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-white font-medium">Booking Ref</p>
              <p className="mt-1 text-dark-300 break-all">{data.bookingRef}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-dark-400">
          <p>Your payment will be processed through eSewa. If the form does not submit automatically, click Continue.</p>
          <p className="text-white">Merchant code: <span className="text-gold-400">{data.merchantCode}</span></p>
        </div>

        <form name="esewa-form" action={data.esewaUrl} method="POST" className="hidden">
          <input type="hidden" name="amt" value={data.amount} />
          <input type="hidden" name="psc" value="0" />
          <input type="hidden" name="pdc" value="0" />
          <input type="hidden" name="tAmt" value={data.amount} />
          <input type="hidden" name="pid" value={data.sessionId} />
          <input type="hidden" name="scd" value={data.merchantCode} />
          <input type="hidden" name="su" value={data.successUrl} />
          <input type="hidden" name="fu" value={data.failureUrl} />
        </form>

        <div className="flex justify-end gap-3">
          <Link to="/bookings" className="btn-outline-gold text-sm">Back to Bookings</Link>
          <button onClick={() => document.forms["esewa-form"]?.submit()} className="btn-gold text-sm">
            Continue to eSewa
          </button>
        </div>
      </div>
    </div>
  );
}
