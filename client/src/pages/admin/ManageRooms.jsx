import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { roomApi } from "../../api/roomApi";
import { ROOM_TYPES, STATUS_COLORS } from "../../utils/constants";
const ROOM_STATUSES = ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "RESERVED"];
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

const EMPTY_ROOM = { roomNumber:"", name:"", type:"STANDARD", floor:1, capacity:2, pricePerNight:100, description:"", amenities:[], images:[], size:300, bedType:"King", viewType:"", isFeatured:false, discount:0 };

export default function ManageRooms() {
  const qc = useQueryClient();
  const [search,     setSearch]    = useState("");
  const [type,       setType]      = useState("");
  const [roomStatus, setRoomStatus]= useState("");
  const [page,       setPage]      = useState(1);
  const [modal,    setModal]   = useState(null); // null | "create" | "edit"
  const [selected, setSelected]= useState(null);
  const [form,     setForm]    = useState(EMPTY_ROOM);
  const [amenityInput, setAmenityInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-rooms", { search, type, page }],
    // status="" → all statuses; specific value → filter by that status
    queryFn: () => roomApi.getRooms({ search, type, page, limit: 12, status: roomStatus }).then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (d) => roomApi.createRoom(d),
    onSuccess: () => { toast.success("Room created."); qc.invalidateQueries(["admin-rooms"]); setModal(null); setForm(EMPTY_ROOM); },
    onError: (err) => toast.error(err.response?.data?.message || "Create failed."),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => roomApi.updateRoom(id, data),
    onSuccess: () => { toast.success("Room updated."); qc.invalidateQueries(["admin-rooms"]); setModal(null); },
    onError: (err) => toast.error(err.response?.data?.message || "Update failed."),
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => roomApi.deleteRoom(id),
    onSuccess: () => { toast.success("Room deleted."); qc.invalidateQueries(["admin-rooms"]); },
    onError: (err) => toast.error(err.response?.data?.message || "Delete failed."),
  });

  const openCreate = () => { setForm(EMPTY_ROOM); setModal("create"); };
  const openEdit   = (room) => { setForm({ ...room, amenities: room.amenities || [], images: room.images || [] }); setSelected(room.id); setModal("edit"); };
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form, floor: parseInt(form.floor), capacity: parseInt(form.capacity), pricePerNight: parseFloat(form.pricePerNight), size: parseFloat(form.size), discount: parseFloat(form.discount || 0) };
    if (modal === "create") createMutation.mutate(data);
    else updateMutation.mutate({ id: selected, data });
  };
  const addAmenity = () => { if(amenityInput.trim()) { setForm(f=>({...f, amenities:[...f.amenities, amenityInput.trim()]})); setAmenityInput(""); } };
  const removeAmenity = (a) => setForm(f => ({ ...f, amenities: f.amenities.filter(x => x !== a) }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">Manage Rooms</h1>
          <p className="text-dark-400 text-sm">{data?.pagination?.total || 0} total rooms</p>
        </div>
        <button onClick={openCreate} className="btn-gold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Room
        </button>
      </div>

      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input type="text" placeholder="Search rooms..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="input pl-10 text-sm" />
        </div>
        <select value={type} onChange={e=>{setType(e.target.value);setPage(1);}} className="input text-sm w-auto">
          <option value="">All Types</option>
          {ROOM_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <select value={roomStatus} onChange={e=>{setRoomStatus(e.target.value);setPage(1);}} className="input text-sm w-auto">
          <option value="">All Status</option>
          {ROOM_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader size="lg" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>{["Room","Type","Floor","Capacity","Price/Night","Status","Featured",""].map(h=><th key={h} className="table-header text-left">{h}</th>)}</tr>
              </thead>
              <tbody>
                {data?.rooms?.map(room => (
                  <tr key={room.id} className="hover:bg-white/2 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <img src={room.images?.[0] || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=80&q=50"} alt="" className="w-12 h-9 rounded-lg object-cover flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm font-medium">{room.name}</p>
                          <p className="text-dark-400 text-xs">#{room.roomNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell"><span className="badge-gold">{room.type}</span></td>
                    <td className="table-cell text-sm">{room.floor}</td>
                    <td className="table-cell text-sm">{room.capacity}</td>
                    <td className="table-cell text-gold-400 font-semibold">रू {room.pricePerNight}</td>
                    <td className="table-cell"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[room.status]}`}>{room.status}</span></td>
                    <td className="table-cell">{room.isFeatured ? "⭐":"—"}</td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button onClick={()=>openEdit(room)} className="p-1.5 rounded-lg hover:bg-gold-500/10 text-dark-400 hover:text-gold-400 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={()=>{if(window.confirm("Delete this room?"))deleteMutation.mutate(room.id);}}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-dark-400 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border border-gold-500/20">
            <h2 className="font-display text-xl font-bold text-white mb-6">{modal === "create" ? "Add New Room" : "Edit Room"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[["Room Number","roomNumber","text","101"],["Room Name","name","text","Deluxe Suite"],["Floor","floor","number","1"],["Capacity","capacity","number","2"],["Price/Night","pricePerNight","number","150"],["Size (sq ft)","size","number","400"],["Bed Type","bedType","text","King"],["View Type","viewType","text","Mountain View"]].map(([label,field,type,ph])=>(
                  <div key={field}>
                    <label className="label text-xs">{label}</label>
                    <input type={type} placeholder={ph} value={form[field]||""} onChange={e=>setForm({...form,[field]:e.target.value})} className="input text-sm" required={["roomNumber","name"].includes(field)} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Room Type</label>
                  <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="input text-sm">
                    {ROOM_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Discount (%)</label>
                  <input type="number" min="0" max="100" value={form.discount||0} onChange={e=>setForm({...form,discount:e.target.value})} className="input text-sm" />
                </div>
              </div>
              <div>
                <label className="label text-xs">Description</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} className="input resize-none text-sm" required />
              </div>
              <div>
                <label className="label text-xs">Image URLs (one per line)</label>
                <textarea value={form.images?.join("\n")||""} onChange={e=>setForm({...form,images:e.target.value.split("\n").filter(Boolean)})} rows={2} className="input resize-none text-sm font-mono" placeholder="https://example.com/img.jpg" />
              </div>
              <div>
                <label className="label text-xs">Amenities</label>
                <div className="flex gap-2 mb-2">
                  <input value={amenityInput} onChange={e=>setAmenityInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addAmenity();}}} placeholder="Add amenity" className="input text-sm flex-1" />
                  <button type="button" onClick={addAmenity} className="btn-outline-gold text-sm py-2 px-3">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.amenities?.map(a=>(
                    <span key={a} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-dark-300 text-xs">
                      {a}<button type="button" onClick={()=>removeAmenity(a)} className="hover:text-red-400">×</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="featured" checked={form.isFeatured||false} onChange={e=>setForm({...form,isFeatured:e.target.checked})} className="w-4 h-4 accent-yellow-500" />
                <label htmlFor="featured" className="text-sm text-dark-300">Featured Room</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createMutation.isPending||updateMutation.isPending} className="btn-gold flex-1">
                  {createMutation.isPending||updateMutation.isPending ? "Saving..." : modal === "create" ? "Create Room" : "Update Room"}
                </button>
                <button type="button" onClick={()=>setModal(null)} className="btn-ghost flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}