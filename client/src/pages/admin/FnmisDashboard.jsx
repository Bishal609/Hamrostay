import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, IndianRupee, TrendingUp, BarChart3 } from "lucide-react";
import { fnmisApi } from "../../api/allApis";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { fmtDate } from "../../utils/formatDate";
import { EXPENSE_CATEGORIES } from "../../utils/constants";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

const PERIOD_OPTIONS = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
];

const TOOLTIP_STYLE = { background: "#1a1a1a", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "8px", color: "#f5f5f5" };

export default function FnmisDashboard() {
  const qc = useQueryClient();
  const [period, setPeriod] = useState("month");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ title:"", amount:"", category:"UTILITIES", date: new Date().toISOString().split("T")[0], description:"" });

  const { data: kpis } = useQuery({ 
    queryKey: ["fnmis-kpis"], 
    queryFn: () => fnmisApi.getKPIs().then(r=>r.data.data),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const { data: revenue, isLoading: revLoading } = useQuery({ 
    queryKey: ["fnmis-revenue", period], 
    queryFn: () => fnmisApi.getRevenue(period).then(r=>r.data.data),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const { data: occupancy } = useQuery({ 
    queryKey: ["fnmis-occ", period], 
    queryFn: () => fnmisApi.getOccupancy(period).then(r=>r.data.data),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const { data: expenses } = useQuery({ 
    queryKey: ["fnmis-expenses"], 
    queryFn: () => fnmisApi.getExpenses({ limit: 20 }).then(r=>r.data.data),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const addExpenseMutation = useMutation({
    mutationFn: (data) => fnmisApi.addExpense(data),
    onSuccess: () => { toast.success("Expense added."); qc.invalidateQueries(["fnmis-expenses"]); qc.invalidateQueries(["fnmis-kpis"]); setShowExpenseModal(false); setExpenseForm({ title:"",amount:"",category:"UTILITIES",date:new Date().toISOString().split("T")[0],description:"" }); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed."),
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">FNMIS Dashboard</h1>
          <p className="text-dark-400 text-sm">Financial & Management Information System</p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-1 bg-dark-800 rounded-xl p-1 border border-white/5">
            {PERIOD_OPTIONS.map(p=>(
              <button key={p.value} onClick={()=>setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period===p.value?"bg-gold-500 text-dark-950":"text-dark-400 hover:text-white"}`}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={()=>setShowExpenseModal(true)} className="btn-gold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue",   value: `रू ${(kpis?.revenue?.current||0).toFixed(0)}`,   change: kpis?.revenue?.growth, icon: IndianRupee, color: "text-gold-400",    bg: "bg-gold-500/10" },
          { label: "Net Profit",      value: `रू ${(kpis?.netProfit||0).toFixed(0)}`,           icon: TrendingUp,  color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Total Expenses",  value: `रू ${(kpis?.expenses||0).toFixed(0)}`,            icon: BarChart3,   color: "text-red-400",     bg: "bg-red-500/10" },
          { label: "Occupancy Rate",  value: `${kpis?.occupancy?.rate||0}%`,                  icon: BarChart3,   color: "text-blue-400",    bg: "bg-blue-500/10" },
        ].map(({ label, value, change, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-dark-400 text-xs">{label}</p>
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}><Icon className={`w-4 h-4 ${color}`}/></div>
            </div>
            <p className="text-2xl font-bold text-white font-mono">{value}</p>
            {change !== undefined && <p className={`text-xs mt-1 ${parseFloat(change)>=0?"text-emerald-400":"text-red-400"}`}>{parseFloat(change)>=0?"+":""}{change}% vs last period</p>}
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-white mb-6">Revenue Trend</h3>
        {revLoading ? <div className="flex justify-center py-10"><Loader/></div> : revenue?.chartData?.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenue.chartData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{fill:"#666",fontSize:11}} tickLine={false} axisLine={false} tickFormatter={v=>v.slice(5)} />
              <YAxis tick={{fill:"#666",fontSize:11}} tickLine={false} axisLine={false} tickFormatter={v=>`रू ${v}`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v=>[`रू ${v.toFixed(2)}`,"Revenue"]} />
              <Area type="monotone" dataKey="amount" stroke="#D4AF37" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-dark-500 py-10">No revenue data for selected period</p>}
      </div>

      {/* Occupancy Chart */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-white mb-6">Occupancy Rate (Last 30 Days)</h3>
        {occupancy?.dailyData?.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={occupancy.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{fill:"#666",fontSize:10}} tickLine={false} axisLine={false} tickFormatter={v=>v.slice(5)} />
              <YAxis tick={{fill:"#666",fontSize:11}} tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v=>[`${v}%`,"Occupancy"]} />
              <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-dark-500 py-8">No occupancy data</p>}
      </div>

      {/* Expenses Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="font-display font-semibold text-white">Recent Expenses</h3>
          <p className="text-dark-400 text-sm">Total: <span className="text-white font-semibold">रू {(expenses?.total||0).toFixed(2)}</span></p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>{["Title","Category","Amount","Date","Description"].map(h=><th key={h} className="table-header text-left">{h}</th>)}</tr></thead>
            <tbody>
              {expenses?.expenses?.map(e=>(
                <tr key={e.id} className="hover:bg-white/2">
                  <td className="table-cell font-medium text-white text-sm">{e.title}</td>
                  <td className="table-cell"><span className="badge-gold text-[10px]">{e.category}</span></td>
                  <td className="table-cell text-red-400 font-semibold">-रू {e.amount.toFixed(2)}</td>
                  <td className="table-cell text-xs">{fmtDate(e.date)}</td>
                  <td className="table-cell text-xs text-dark-400">{e.description||"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 border border-gold-500/20">
            <h2 className="font-display text-xl font-bold text-white mb-6">Add Expense</h2>
            <form onSubmit={e=>{e.preventDefault();addExpenseMutation.mutate({...expenseForm,amount:parseFloat(expenseForm.amount)});}} className="space-y-4">
              <div>
                <label className="label text-xs">Title</label>
                <input type="text" value={expenseForm.title} onChange={e=>setExpenseForm({...expenseForm,title:e.target.value})} className="input text-sm" required placeholder="e.g. Electricity Bill" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Amount (रू)</label>
                  <input type="number" min="0" step="0.01" value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm,amount:e.target.value})} className="input text-sm" required />
                </div>
                <div>
                  <label className="label text-xs">Date</label>
                  <input type="date" value={expenseForm.date} onChange={e=>setExpenseForm({...expenseForm,date:e.target.value})} className="input text-sm" required />
                </div>
              </div>
              <div>
                <label className="label text-xs">Category</label>
                <select value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm,category:e.target.value})} className="input text-sm">
                  {EXPENSE_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label text-xs">Description (optional)</label>
                <textarea value={expenseForm.description} onChange={e=>setExpenseForm({...expenseForm,description:e.target.value})} rows={2} className="input resize-none text-sm" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={addExpenseMutation.isPending} className="btn-gold flex-1">{addExpenseMutation.isPending?"Adding...":"Add Expense"}</button>
                <button type="button" onClick={()=>setShowExpenseModal(false)} className="btn-ghost flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}