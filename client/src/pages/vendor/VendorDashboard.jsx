import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";
import { vendorApi } from "../../api/allApis";
import { fmtDate } from "../../utils/formatDate";
import { STATUS_COLORS } from "../../utils/constants";
import Loader from "../../components/common/Loader";
import { Link } from "react-router-dom";

export default function VendorDashboard() {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["vendor-profile"],
    queryFn: () => vendorApi.getMyProfile().then(r => r.data.data),
  });

  const { data: ordersData } = useQuery({
    queryKey: ["vendor-my-orders"],
    queryFn: () => vendorApi.getMyOrders({ limit: 10 }).then(r => r.data.data),
    enabled: !!profile,
  });

  if (profileLoading) return <div className="flex justify-center py-20"><Loader size="lg" text="Loading vendor profile..." /></div>;

  if (!profile) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto">
          <Package className="w-8 h-8 text-gold-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white">Register as Vendor</h2>
        <p className="text-dark-400">You don't have a vendor profile yet. Register to start supplying HamroStay.</p>
        <Link to="/vendor/register" className="btn-gold inline-flex">Register Now</Link>
      </div>
    );
  }

  const lowStock = profile.inventory?.filter(i => i.stock <= i.minStock) || [];
  const orders   = ordersData?.orders || [];
  const revenue  = orders.filter(o => o.status === "DELIVERED").reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="card-gold p-6 border border-gold-500/25">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-white mb-1">{profile.businessName}</h1>
            <p className="text-dark-400 text-sm">{profile.category?.replace("_"," ")} · {profile.contactPerson}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
            profile.isApproved
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
              : "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
          }`}>
            {profile.isApproved ? "✓ Approved" : "⏳ Pending Approval"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: ShoppingCart, label: "Total Orders",     value: profile.totalOrders,          color: "text-blue-400",    bg: "bg-blue-500/10" },
          { icon: TrendingUp,   label: "Revenue (Delivered)", value: `रू${revenue.toFixed(0)}`,  color: "text-gold-400",    bg: "bg-gold-500/10" },
          { icon: Package,      label: "Inventory Items",  value: profile.inventory?.length || 0, color: "text-purple-400",  bg: "bg-purple-500/10" },
          { icon: AlertTriangle,label: "Low Stock Items",  value: lowStock.length,               color: "text-red-400",     bg: "bg-red-500/10" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-dark-400 text-xs">{label}</p>
              <p className="text-xl font-bold text-white font-mono">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        {lowStock.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="font-display font-semibold text-white">Low Stock Alert</h3>
            </div>
            <div className="space-y-3">
              {lowStock.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                  <div>
                    <p className="text-sm font-medium text-white">{item.itemName}</p>
                    <p className="text-xs text-dark-400">${item.unitPrice}/{item.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-bold text-lg">{item.stock}</p>
                    <p className="text-dark-500 text-xs">Min: {item.minStock}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/vendor/inventory" className="btn-outline-gold w-full text-center text-sm mt-4 block">Manage Inventory</Link>
          </div>
        )}

        {/* Recent Orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white">Recent Orders</h3>
            <Link to="/vendor/orders" className="text-gold-400 text-xs hover:text-gold-300">View all</Link>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-10 h-10 text-dark-700 mx-auto mb-2" />
              <p className="text-dark-400 text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 6).map(o => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50">
                  <div>
                    <p className="text-sm font-medium text-white font-mono">{o.orderRef?.slice(0, 10)}</p>
                    <p className="text-xs text-dark-400">{fmtDate(o.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gold-400 font-semibold">${o.totalAmount.toFixed(0)}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${STATUS_COLORS[o.status] || ""}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}