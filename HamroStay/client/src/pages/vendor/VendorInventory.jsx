import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Package, AlertTriangle } from "lucide-react";
import { vendorApi } from "../../api/allApis";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

const EMPTY_ITEM = { itemName: "", description: "", unit: "piece", unitPrice: 0, stock: 0, minStock: 10 };

export default function VendorInventory() {
  const qc = useQueryClient();
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState(EMPTY_ITEM);

  const { data: profile } = useQuery({
    queryKey: ["vendor-profile"],
    queryFn: () => vendorApi.getMyProfile().then(r => r.data.data),
  });

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["vendor-inventory", profile?.id],
    queryFn: () => vendorApi.getInventory(profile.id).then(r => r.data.data),
    enabled: !!profile,
  });

  const addMutation = useMutation({
    mutationFn: (data) => vendorApi.addInventoryItem(profile.id, data),
    onSuccess: () => { toast.success("Item added."); qc.invalidateQueries(["vendor-inventory"]); setModal(null); setForm(EMPTY_ITEM); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, data }) => vendorApi.updateInventoryItem(profile.id, itemId, data),
    onSuccess: () => { toast.success("Item updated."); qc.invalidateQueries(["vendor-inventory"]); setModal(null); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed."),
  });

  const openEdit = (item) => { setForm({ ...item }); setSelected(item.id); setModal("edit"); };
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form, unitPrice: parseFloat(form.unitPrice), stock: parseInt(form.stock), minStock: parseInt(form.minStock) };
    if (modal === "create") addMutation.mutate(data);
    else updateMutation.mutate({ itemId: selected, data });
  };

  const UNITS = ["piece", "kg", "litre", "gram", "box", "dozen", "roll", "pack"];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">Inventory</h1>
          <p className="text-dark-400 text-sm">{inventory?.length || 0} items</p>
        </div>
        <button onClick={() => { setForm(EMPTY_ITEM); setModal("create"); }} className="btn-gold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader size="lg" /></div>
      ) : inventory?.length === 0 ? (
        <div className="text-center py-16 card">
          <Package className="w-12 h-12 text-dark-700 mx-auto mb-3" />
          <p className="text-dark-400 mb-4">No inventory items yet</p>
          <button onClick={() => { setForm(EMPTY_ITEM); setModal("create"); }} className="btn-gold">Add First Item</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map(item => {
            const isLow = item.stock <= item.minStock;
            return (
              <div key={item.id} className={`card p-5 border ${isLow ? "border-red-500/30" : "border-white/5"} hover:border-gold-500/30 transition-all duration-200`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{item.itemName}</h3>
                    {item.description && <p className="text-dark-400 text-xs mt-0.5">{item.description}</p>}
                  </div>
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-gold-500/10 text-dark-400 hover:text-gold-400 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="bg-dark-800/50 rounded-lg p-2.5">
                    <p className="text-dark-400 text-xs">Price</p>
                    <p className="text-gold-400 font-semibold">रू${item.unitPrice}/{item.unit}</p>
                  </div>
                  <div className={`rounded-lg p-2.5 ${isLow ? "bg-red-500/10" : "bg-dark-800/50"}`}>
                    <p className="text-dark-400 text-xs">Stock</p>
                    <p className={`font-bold ${isLow ? "text-red-400" : "text-white"}`}>{item.stock} {item.unit}s</p>
                  </div>
                </div>

                {isLow && (
                  <div className="flex items-center gap-1.5 text-xs text-red-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Low stock! Min: {item.minStock}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 border border-gold-500/20">
            <h2 className="font-display text-xl font-bold text-white mb-6">
              {modal === "create" ? "Add Inventory Item" : "Edit Item"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label text-xs">Item Name</label>
                <input type="text" value={form.itemName} onChange={e => setForm({...form, itemName: e.target.value})}
                  placeholder="e.g. Organic Rice" required className="input text-sm" />
              </div>
              <div>
                <label className="label text-xs">Description</label>
                <input type="text" value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Optional description" className="input text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Unit</label>
                  <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="input text-sm">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Unit Price (रू)</label>
                  <input type="number" min="0" step="0.01" value={form.unitPrice} onChange={e => setForm({...form, unitPrice: e.target.value})}
                    required className="input text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Current Stock</label>
                  <input type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                    required className="input text-sm" />
                </div>
                <div>
                  <label className="label text-xs">Min Stock Alert</label>
                  <input type="number" min="0" value={form.minStock} onChange={e => setForm({...form, minStock: e.target.value})}
                    required className="input text-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={addMutation.isPending || updateMutation.isPending} className="btn-gold flex-1">
                  {addMutation.isPending || updateMutation.isPending ? "Saving..." : modal === "create" ? "Add Item" : "Update Item"}
                </button>
                <button type="button" onClick={() => setModal(null)} className="btn-ghost flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}