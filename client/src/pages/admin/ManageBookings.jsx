import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, RefreshCw } from "lucide-react";
import { bookingApi } from "../../api/bookingApi";
import { paymentApi } from "../../api/paymentApi";
import { fmtDate } from "../../utils/formatDate";
import { STATUS_COLORS, BOOKING_STATUSES } from "../../utils/constants";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

export default function ManageBookings() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page,   setPage]   = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings", { search, status, page }],
    queryFn: () => bookingApi.getBookings({ search, status, page, limit: 15 }).then(r => r.data.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => bookingApi.updateBookingStatus(id, status),
    onSuccess: () => { 
      toast.success("Status updated."); 
      qc.invalidateQueries(["admin-bookings"]);
      qc.invalidateQueries(["fnmis-kpis"]);
      qc.invalidateQueries(["fnmis-revenue"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Update failed."),
  });

  const refundMutation = useMutation({
    mutationFn: (bookingId) => paymentApi.refund({ bookingId, reason: "Admin refund" }),
    onSuccess: () => { 
      toast.success("Refund initiated."); 
      qc.invalidateQueries(["admin-bookings"]);
      qc.invalidateQueries(["fnmis-kpis"]);
      qc.invalidateQueries(["fnmis-revenue"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Refund failed."),
  });

  const STATUS_ACTIONS = {
    PENDING:    ["CONFIRMED","CANCELLED"],
    CONFIRMED:  ["CHECKED_IN","CANCELLED"],
    CHECKED_IN: ["CHECKED_OUT"],
    CHECKED_OUT:[],
    CANCELLED:  [],
    REFUNDED:   [],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Manage Bookings</h1>
        <p className="text-dark-400 text-sm">{data?.pagination?.total || 0} total bookings</p>
      </div>

      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input type="text" placeholder="Search by ref or guest name..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="input pl-10 text-sm" />
        </div>
        <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} className="input text-sm w-auto">
          <option value="">All Status</option>
          {BOOKING_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? <div className="flex justify-center py-16"><Loader size="lg" /></div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>{["Ref","Guest","Room","Check-In","Check-Out","Amount","Status","Actions"].map(h=><th key={h} className="table-header text-left">{h}</th>)}</tr>
              </thead>
              <tbody>
                {data?.bookings?.map(b => (
                  <tr key={b.id} className="hover:bg-white/2 transition-colors">
                    <td className="table-cell font-mono text-xs text-gold-400">{b.bookingRef?.slice(0,10)}</td>
                    <td className="table-cell">
                      <p className="text-sm text-white">{b.user?.name}</p>
                      <p className="text-xs text-dark-400">{b.user?.email}</p>
                    </td>
                    <td className="table-cell text-sm">{b.room?.name}</td>
                    <td className="table-cell text-xs">{fmtDate(b.checkIn)}</td>
                    <td className="table-cell text-xs">{fmtDate(b.checkOut)}</td>
                    <td className="table-cell text-gold-400 font-semibold">रू {b.finalAmount?.toFixed(0)}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-1.5 flex-wrap">
                        {STATUS_ACTIONS[b.status]?.map(nextStatus => (
                          <button key={nextStatus} onClick={()=>statusMutation.mutate({id:b.id,status:nextStatus})}
                            disabled={statusMutation.isPending}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-gold-500/20 text-gold-400 hover:bg-gold-500/10 transition-colors">
                            {nextStatus.replace("_"," ")}
                          </button>
                        ))}
                        {b.payment?.status === "COMPLETED" && b.status !== "REFUNDED" && (
                          <button onClick={()=>{if(window.confirm("Issue refund?"))refundMutation.mutate(b.id);}}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {data?.pagination?.totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-white/5">
              {Array.from({length: data.pagination.totalPages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p===page?"bg-gold-500 text-dark-950":"border border-white/10 text-dark-300 hover:border-gold-500/30"}`}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}