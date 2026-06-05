import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, CheckCircle } from "lucide-react";
import { vendorApi } from "../../api/allApis";
import { fmtDate } from "../../utils/formatDate";
import { STATUS_COLORS } from "../../utils/constants";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

export default function VendorOrders() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["vendor-profile"],
    queryFn: () => vendorApi.getMyProfile().then(r => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["vendor-my-orders", status],
    queryFn: () => vendorApi.getMyOrders({ status, limit: 20 }).then(r => r.data.data),
    enabled: !!profile,
  });

  const statusMutation = useMutation({
    mutationFn: ({ vendorId, orderId, status }) => vendorApi.updateOrderStatus(vendorId, orderId, status),
    onSuccess: () => { toast.success("Order status updated."); qc.invalidateQueries(["vendor-my-orders"]); },
    onError: (err) => toast.error(err.response?.data?.message || "Update failed."),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">My Orders</h1>
          <p className="text-dark-400 text-sm">{data?.pagination?.total || 0} total orders</p>
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input text-sm w-auto">
          <option value="">All Status</option>
          {["PENDING","PROCESSING","DELIVERED","CANCELLED"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader size="lg" /></div>
      ) : data?.orders?.length === 0 ? (
        <div className="text-center py-16 card">
          <ShoppingCart className="w-12 h-12 text-dark-700 mx-auto mb-3" />
          <p className="text-dark-400">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.orders?.map(o => (
            <div key={o.id} className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                <div>
                  <p className="font-mono text-gold-400 text-sm font-semibold">{o.orderRef}</p>
                  <p className="text-dark-400 text-xs">{fmtDate(o.createdAt)} · Requested by: {o.requestedBy}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gold-400 font-bold">रू {o.totalAmount.toFixed(2)}</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[o.status] || ""}`}>{o.status}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2 mb-4">
                {o.items?.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2.5 rounded-xl bg-dark-800/50 text-sm">
                    <span className="text-dark-200">{item.inventory?.itemName}</span>
                    <div className="flex items-center gap-4 text-xs text-dark-400">
                      <span>Qty: <span className="text-white">{item.quantity} {item.inventory?.unit}</span></span>
                      <span>@रू {item.unitPrice}</span>
                      <span className="text-gold-400 font-medium">रू {item.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {o.notes && <p className="text-dark-400 text-xs italic mb-4">Note: {o.notes}</p>}

              {/* Actions */}
              {o.status === "PENDING" && profile && (
                <div className="flex gap-2">
                  <button
                    onClick={() => statusMutation.mutate({ vendorId: profile.id, orderId: o.id, status: "PROCESSING" })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/20 text-blue-400 hover:bg-blue-500/10 text-xs transition-colors">
                    Accept Order
                  </button>
                  <button
                    onClick={() => statusMutation.mutate({ vendorId: profile.id, orderId: o.id, status: "CANCELLED" })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs transition-colors">
                    Decline
                  </button>
                </div>
              )}
              {o.status === "PROCESSING" && profile && (
                <button
                  onClick={() => statusMutation.mutate({ vendorId: profile.id, orderId: o.id, status: "DELIVERED" })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 text-xs transition-colors">
                  <CheckCircle className="w-3.5 h-3.5" /> Mark as Delivered
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}