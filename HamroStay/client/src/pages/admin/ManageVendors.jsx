import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, CheckCircle, XCircle, Eye, Package } from "lucide-react";
import { vendorApi } from "../../api/allApis";
import { fmtDate } from "../../utils/formatDate";
import { VENDOR_CATEGORIES } from "../../utils/constants";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

export default function ManageVendors() {
  const qc = useQueryClient();
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("");
  const [approved, setApproved] = useState("");
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-vendors", { search, category, approved }],
    queryFn: () => vendorApi.getVendors({ search, category, isApproved: approved }).then(r => r.data.data),
  });

  const { data: orderData } = useQuery({
    queryKey: ["vendor-orders", selected?.id],
    queryFn: () => vendorApi.getOrders(selected.id, {}).then(r => r.data.data),
    enabled: !!selected,
  });

  const approveMutation = useMutation({
    mutationFn: (id) => vendorApi.approveVendor(id),
    onSuccess: () => { toast.success("Vendor approved."); qc.invalidateQueries(["admin-vendors"]); },
    onError: (err) => toast.error(err.response?.data?.message || "Approval failed."),
  });

  const orderMutation = useMutation({
    mutationFn: ({ vendorId, data }) => vendorApi.createOrder(vendorId, data),
    onSuccess: () => { toast.success("Order created."); qc.invalidateQueries(["vendor-orders", selected?.id]); },
    onError: (err) => toast.error(err.response?.data?.message || "Order failed."),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Manage Vendors</h1>
        <p className="text-dark-400 text-sm">{data?.pagination?.total || 0} total vendors</p>
      </div>

      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input type="text" placeholder="Search vendors..." value={search}
            onChange={e => setSearch(e.target.value)} className="input pl-10 text-sm" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="input text-sm w-auto">
          <option value="">All Categories</option>
          {VENDOR_CATEGORIES.map(c => <option key={c} value={c}>{c.replace("_"," ")}</option>)}
        </select>
        <select value={approved} onChange={e => setApproved(e.target.value)} className="input text-sm w-auto">
          <option value="">All</option>
          <option value="true">Approved</option>
          <option value="false">Pending</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Vendor List */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader size="lg" /></div>
          ) : (
            <div className="space-y-3">
              {data?.vendors?.map(v => (
                <div key={v.id}
                  className={`card p-4 cursor-pointer transition-all duration-200 hover:border-gold-500/30 ${selected?.id === v.id ? "border border-gold-500/40 bg-gold-500/5" : ""}`}
                  onClick={() => setSelected(v)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {v.logo ? (
                        <img src={v.logo} alt={v.businessName} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gold-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-white">{v.businessName}</h3>
                        <p className="text-dark-400 text-xs">{v.contactPerson} · {v.email}</p>
                        <p className="text-dark-500 text-xs mt-0.5">{v.category?.replace("_"," ")}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                        v.isApproved
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                          : "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
                      }`}>
                        {v.isApproved ? <><CheckCircle className="w-3 h-3"/>Approved</> : <><XCircle className="w-3 h-3"/>Pending</>}
                      </span>
                      {!v.isApproved && (
                        <button onClick={e => { e.stopPropagation(); approveMutation.mutate(v.id); }}
                          disabled={approveMutation.isPending}
                          className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/25 transition-colors">
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-dark-400">
                    <span>Orders: <span className="text-white">{v.totalOrders}</span></span>
                    <span>Rating: <span className="text-gold-400">{v.rating || "N/A"}</span></span>
                    <span>Joined: <span className="text-white">{fmtDate(v.createdAt)}</span></span>
                  </div>
                </div>
              ))}
              {data?.vendors?.length === 0 && (
                <div className="text-center py-12 card">
                  <p className="text-dark-400">No vendors found.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Vendor Detail Panel */}
        <div>
          {selected ? (
            <div className="card p-5 space-y-5 sticky top-24">
              <h3 className="font-display font-semibold text-white">{selected.businessName}</h3>
              <div className="space-y-2 text-sm">
                {[
                  ["Contact", selected.contactPerson],
                  ["Email",   selected.email],
                  ["Phone",   selected.phone],
                  ["Address", selected.address],
                  ["Category", selected.category?.replace("_"," ")],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-dark-400">{label}</span>
                    <span className="text-white text-right max-w-[55%] truncate">{val}</span>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div>
                <h4 className="font-medium text-white text-sm mb-3">Recent Orders</h4>
                {orderData?.orders?.length > 0 ? (
                  <div className="space-y-2">
                    {orderData.orders.slice(0,5).map(o => (
                      <div key={o.id} className="flex justify-between items-center p-2.5 rounded-xl bg-dark-800/50 text-xs">
                        <span className="text-dark-300 font-mono">{o.orderRef?.slice(0,8)}</span>
                        <span className="text-gold-400">${o.totalAmount.toFixed(0)}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          o.status === "DELIVERED" ? "text-emerald-400" :
                          o.status === "CANCELLED" ? "text-red-400" : "text-yellow-400"
                        }`}>{o.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-dark-500 text-xs text-center py-3">No orders yet</p>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Eye className="w-10 h-10 text-dark-700 mx-auto mb-3" />
              <p className="text-dark-400 text-sm">Select a vendor to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}