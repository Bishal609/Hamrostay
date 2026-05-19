import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, ToggleLeft, ToggleRight } from "lucide-react";
import { userApi } from "../../api/allApis";
import { fmtDate } from "../../utils/formatDate";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

export default function ManageUsers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [role,   setRole]   = useState("");
  const [page,   setPage]   = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", { search, role, page }],
    queryFn: () => userApi.getAllUsers({ search, role, page, limit: 15 }).then(r => r.data.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => userApi.toggleUserStatus(id),
    onSuccess: (res) => { toast.success(res.data.message); qc.invalidateQueries(["admin-users"]); },
    onError: (err) => toast.error(err.response?.data?.message || "Toggle failed."),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Manage Users</h1>
        <p className="text-dark-400 text-sm">{data?.pagination?.total || 0} total users</p>
      </div>

      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input type="text" placeholder="Search users..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="input pl-10 text-sm" />
        </div>
        <select value={role} onChange={e=>{setRole(e.target.value);setPage(1);}} className="input text-sm w-auto">
          <option value="">All Roles</option>
          {["ADMIN","CUSTOMER","VENDOR"].map(r=><option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {isLoading ? <div className="flex justify-center py-16"><Loader size="lg" /></div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>{["User","Role","Joined","Status","Action"].map(h=><th key={h} className="table-header text-left">{h}</th>)}</tr>
              </thead>
              <tbody>
                {data?.users?.map(u => (
                  <tr key={u.id} className="hover:bg-white/2 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center text-dark-950 text-sm font-bold flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{u.name}</p>
                          <p className="text-xs text-dark-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell"><span className="badge-gold">{u.role}</span></td>
                    <td className="table-cell text-xs">{fmtDate(u.createdAt)}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${u.isActive?"bg-emerald-500/15 text-emerald-400 border-emerald-500/20":"bg-red-500/15 text-red-400 border-red-500/20"}`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button onClick={()=>toggleMutation.mutate(u.id)} disabled={toggleMutation.isPending}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${u.isActive?"border-red-500/20 text-red-400 hover:bg-red-500/10":"border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"}`}>
                        {u.isActive ? <><ToggleLeft className="w-3.5 h-3.5"/>Deactivate</> : <><ToggleRight className="w-3.5 h-3.5"/>Activate</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}