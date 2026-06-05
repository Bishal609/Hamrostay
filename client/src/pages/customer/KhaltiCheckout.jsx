import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, ArrowRight, AlertTriangle } from "lucide-react";
import { paymentApi } from "../../api/paymentApi";
import Loader from "../../components/common/Loader";

export default function KhaltiCheckout() {
  const { sessionId } = useParams();
  const [isInitializing, setIsInitializing] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ["khalti-session", sessionId],
    queryFn: () => paymentApi.getKhaltiSession(sessionId).then((r) => r.data.data),
    enabled: Boolean(sessionId),
  });

  useEffect(() => {
    if (data && !isInitializing) {
      setIsInitializing(true);
      // Load Khalti script
      const script = document.createElement("script");
      script.src = "https://khalti.s3.amazonaws.com/KPG/dist/2.0.0/khalti-checkout.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const config = {
          publicKey: data.publicKey || import.meta.env.VITE_KHALTI_PUBLIC_KEY,
          productIdentity: data.bookingId,
          productName: `Booking ${data.bookingRef}`,
          productUrl: window.location.href,
          eventHandler: {
            onSuccess(payload) {
              console.log(payload);
              // Redirect to verification
              window.location.href = `/api/payments/khalti/verify?pidx=${payload.pidx}&transactionId=${payload.transaction_id}`;
            },
            onError(error) {
              console.error(error);
              window.location.href = `/booking/${data.bookingId}?payment_failed=true`;
            },
            onClose() {
              console.log("widget is closing");
            },
          },
          amount: data.amount * 100, // Khalti expects amount in paisa
        };

        const checkout = new window.KhaltiCheckout(config);
        // Auto-open the payment modal
        checkout.show({ amount: data.amount * 100 });
      };
    }
  }, [data, isInitializing]);

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
          <h1 className="text-xl font-semibold text-white">Processing Khalti Payment</h1>
        </div>
        <p className="text-dark-300">We are securely redirecting you to Khalti. Please do not close this window.</p>

        <div className="rounded-2xl bg-dark-900 border border-white/10 p-4">
          <div className="grid grid-cols-2 gap-3 text-sm text-dark-400">
            <div>
              <p className="text-white font-medium">Amount</p>
              <p className="mt-1 text-gold-400">रू{data?.amount?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-white font-medium">Booking Ref</p>
              <p className="mt-1 text-dark-300 break-all">{data?.bookingRef}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-dark-400">
          <p>Your payment will be processed through Khalti. The payment window should open automatically.</p>
          <p className="text-yellow-400">If the payment modal does not appear, please check if pop-ups are allowed in your browser.</p>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/bookings" className="btn-outline-gold text-sm">Back to Bookings</Link>
        </div>
      </div>
    </div>
  );
}
