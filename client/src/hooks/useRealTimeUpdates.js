// client/src/hooks/useRealTimeUpdates.js
// Listens to socket events and invalidates TanStack Query caches for real-time updates
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./useSocket";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

export function useRealTimeUpdates() {
  const socket   = useSocket();
  const qc       = useQueryClient();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!socket || !user) return;

    // ── Booking status updated (customer + admin) ──────────
    const onBookingUpdated = ({ bookingId, status }) => {
      // Invalidate all booking-related queries
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      qc.invalidateQueries({ queryKey: ["booking", bookingId] });
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      qc.invalidateQueries({ queryKey: ["admin-bookings-recent"] });
      qc.invalidateQueries({ queryKey: ["fnmis-kpis"] });
      qc.invalidateQueries({ queryKey: ["fnmis-revenue"] });
      qc.invalidateQueries({ queryKey: ["fnmis-roomtype"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });

      // Show toast to customer
      if (user.role === "CUSTOMER") {
        const messages = {
          CONFIRMED:   "🎉 Your booking is confirmed!",
          CANCELLED:   "Your booking has been cancelled.",
          CHECKED_IN:  "Welcome! You're now checked in. 🏨",
          CHECKED_OUT: "Check-out complete. Thank you for staying!",
        };
        const msg = messages[status];
        if (msg) {
          status === "CANCELLED" ? toast.error(msg) : toast.success(msg);
        }
      }
    };

    // ── Payment completed ──────────────────────────────────
    const onPaymentCompleted = ({ bookingId, amount }) => {
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      qc.invalidateQueries({ queryKey: ["booking", bookingId] });
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      qc.invalidateQueries({ queryKey: ["fnmis-kpis"] });
      qc.invalidateQueries({ queryKey: ["fnmis-revenue"] });
      qc.invalidateQueries({ queryKey: ["fnmis-roomtype"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });

      if (user.role === "CUSTOMER") {
        toast.success(`Payment of NPR ${amount?.toFixed(0)} confirmed! ✅`);
      }
      if (user.role === "ADMIN") {
        toast.success(`New payment received: NPR ${amount?.toFixed(0)}`);
      }
    };

    // ── New booking (admin only) ───────────────────────────
    const onNewBooking = ({ bookingRef }) => {
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      qc.invalidateQueries({ queryKey: ["admin-bookings-recent"] });
      qc.invalidateQueries({ queryKey: ["fnmis-kpis"] });
      qc.invalidateQueries({ queryKey: ["fnmis-revenue"] });
      qc.invalidateQueries({ queryKey: ["fnmis-roomtype"] });
      if (user.role === "ADMIN") {
        toast.success(`New booking received: ${bookingRef}`);
      }
    };

    // ── Vendor order status updated ────────────────────────
    const onOrderUpdated = () => {
      qc.invalidateQueries({ queryKey: ["vendor-my-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-vendors"] });
    };

    socket.on("booking:updated",   onBookingUpdated);
    socket.on("payment:completed", onPaymentCompleted);
    socket.on("booking:new",       onNewBooking);
    socket.on("order:updated",     onOrderUpdated);

    return () => {
      socket.off("booking:updated",   onBookingUpdated);
      socket.off("payment:completed", onPaymentCompleted);
      socket.off("booking:new",       onNewBooking);
      socket.off("order:updated",     onOrderUpdated);
    };
  }, [socket, user, qc]);
}
