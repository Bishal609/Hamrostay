import { useQuery } from "@tanstack/react-query";
import { DollarSign, BedDouble, BookOpen, Users, TrendingUp, Clock } from "lucide-react";
import { fnmisApi } from "../../api/allApis";
import { bookingApi } from "../../api/bookingApi";
import StatsCard from "../../components/dashboard/StatsCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { fmtDate } from "../../utils/formatDate";
import { STATUS_COLORS } from "../../utils/constants";
import Loader from "../../components/common/Loader";
import { Link } from "react-router-dom";

const COLORS = ["#D4AF37","#3b82f6","#8b5cf6","#10b981","#ef4444"];

export default function AdminDashboard() {
  const { data: kpis, isLoading: kpiLoading } = useQuery({
    queryKey: ["fnmis-kpis"],
    queryFn: () => fnmisApi.getKPIs().then(r => r.data.data),
    refetchInterval: 60000,
  });

  const { data: revenueData } = useQuery({
    queryKey: ["fnmis-revenue","month"],
    queryFn: () => fnmisApi.getRevenue("month").then(r => r.data.data),
  });

  const { data: roomTypeData } = useQuery({
    queryKey: ["fnmis-roomtype"],
    queryFn: () => fnmisApi.getRevenueByRoomType().then(r => r.data.data),
  });

  const { data: recentBookings } = useQuery({
    queryKey: ["admin-bookings-recent"],
    queryFn: () => bookingApi.getBookings({ limit: 8 }).then(r => r.data.data),
  });

  if (kpiLoading) return <div className="flex justify-center py-20"><Loader size="lg" text="Loading dashboard..." /></div>;

  const kpi = kpis || {};
  const chartData = revenueData?.chartData || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
        <p className="text-dark-400 text-sm">Real-time hotel operations overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Monthly Revenue"   value={kpi.revenue?.current?.toFixed(0) || 0} icon={DollarSign} prefix="रू" change={kpi.revenue?.growth} changeLabel="vs last month" color="gold" />
        <StatsCard title="Occupancy Rate"    value={kpi.occupancy?.rate || 0}               icon={BedDouble}  suffix="%" color="blue" />
        <StatsCard title="New Bookings"      value={kpi.bookings?.thisMonth || 0}           icon={BookOpen}   color="green" />
        <StatsCard title="Total Customers"   value={kpi.customers || 0}                     icon={Users}      color="purple" />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Pending Bookings", value: kpi.bookings?.pending || 0,           icon: Clock,       color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { label: "Checked In",       value: kpi.occupancy?.checkedIn || 0,         icon: BedDouble,   color: "text-blue-400",   bg: "bg-blue-500/10" },
          { label: "Active Vendors",   value: kpi.vendors || 0,                     icon: TrendingUp,  color: "text-emerald-400",bg: "bg-emerald-500/10" },
          { label: "Net Profit",       value: `रू${(kpi.netProfit || 0).toFixed(0)}`,icon: DollarSign,  color: "text-gold-400",   bg: "bg-gold-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-dark-400 text-xs">{label}</p>
              <p className="font-bold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold text-white">Revenue This Month</h3>
            <Link to="/admin/fnmis" className="text-gold-400 text-xs hover:text-gold-300">View Full Report →</Link>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fill: "#666", fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `रू${v}`} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "8px", color: "#f5f5f5" }}
                  formatter={v => [`रू${v.toFixed(2)}`, "Revenue"]} />
                <Area type="monotone" dataKey="amount" stroke="#D4AF37" strokeWidth={2} fill="url(#goldGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-dark-500">No revenue data yet</div>
          )}
        </div>

        {/* Room Type Pie */}
        <div className="card p-6">
          <h3 className="font-display font-semibold text-white mb-6">Revenue by Room Type</h3>
          {roomTypeData?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={roomTypeData} dataKey="revenue" nameKey="type" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                    {roomTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f5f5f5" }}
                    formatter={v => [`रू${v.toFixed(0)}`, "Revenue"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {roomTypeData.map((d, i) => (
                  <div key={d.type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-dark-300 text-xs">{d.type}</span>
                    </div>
                    <span className="text-white text-xs font-medium">{d.revenue.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-dark-500">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="font-display font-semibold text-white">Recent Bookings</h3>
          <Link to="/admin/bookings" className="text-gold-400 text-xs hover:text-gold-300">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>{["Ref","Guest","Room","Check-In","Amount","Status"].map(h=><th key={h} className="table-header text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {recentBookings?.bookings?.map(b => (
                <tr key={b.id} className="hover:bg-white/2 transition-colors">
                  <td className="table-cell font-mono text-xs text-gold-400">{b.bookingRef?.slice(0,8)}</td>
                  <td className="table-cell text-sm">{b.user?.name}</td>
                  <td className="table-cell text-sm">{b.room?.name}</td>
                  <td className="table-cell text-xs">{fmtDate(b.checkIn)}</td>
                  <td className="table-cell text-gold-400 font-semibold">${b.finalAmount?.toFixed(0)}</td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}