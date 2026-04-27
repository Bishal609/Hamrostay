import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Phone, MapPin, Lock } from "lucide-react";
import { userApi } from "../../api/allApis";
import { authApi } from "../../api/authApi";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const qc = useQueryClient();
  const [profile, setProfile] = useState({ name: user?.name || "", phone: user?.phone || "", address: user?.address || "" });
  const [pwForm, setPwForm]   = useState({ currentPassword: "", newPassword: "", confirm: "" });

  const profileMutation = useMutation({
    mutationFn: (data) => userApi.updateProfile(data).then(r => r.data.data),
    onSuccess: (updated) => { updateUser(updated); toast.success("Profile updated."); },
    onError: (err) => toast.error(err.response?.data?.message || "Update failed."),
  });

  const pwMutation = useMutation({
    mutationFn: (data) => authApi.changePassword(data),
    onSuccess: () => { toast.success("Password changed."); setPwForm({ currentPassword: "", newPassword: "", confirm: "" }); },
    onError: (err) => toast.error(err.response?.data?.message || "Password change failed."),
  });

  const handleProfileSubmit = (e) => { e.preventDefault(); profileMutation.mutate(profile); };
  const handlePwSubmit = (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error("Passwords don't match.");
    if (pwForm.newPassword.length < 6) return toast.error("Password must be at least 6 characters.");
    pwMutation.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
  };

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Profile Settings</h1>
        <p className="text-dark-400 text-sm">Manage your account information</p>
      </div>

      {/* Avatar */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-gold-gradient flex items-center justify-center text-dark-950 text-2xl font-bold font-display flex-shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-white text-lg">{user?.name}</p>
          <p className="text-dark-400 text-sm">{user?.email}</p>
          <span className="badge-gold mt-1">{user?.role}</span>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleProfileSubmit} className="card p-6 space-y-4">
        <h2 className="font-display font-semibold text-white text-lg mb-4">Personal Information</h2>
        <div>
          <label className="label">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="input pl-10" />
          </div>
        </div>
        <div>
          <label className="label">Email (read-only)</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input type="email" value={user?.email} disabled className="input pl-10 opacity-60 cursor-not-allowed" />
          </div>
        </div>
        <div>
          <label className="label">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="+977 9XXXXXXXXX" className="input pl-10" />
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-dark-400" />
            <textarea value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} rows={2} className="input pl-10 resize-none" placeholder="Your address..." />
          </div>
        </div>
        <button type="submit" disabled={profileMutation.isPending} className="btn-gold">
          {profileMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Change Password */}
      <form onSubmit={handlePwSubmit} className="card p-6 space-y-4">
        <h2 className="font-display font-semibold text-white text-lg mb-4">Change Password</h2>
        {[
          ["Current Password", "currentPassword"],
          ["New Password",     "newPassword"],
          ["Confirm Password", "confirm"],
        ].map(([label, field]) => (
          <div key={field}>
            <label className="label">{label}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input type="password" value={pwForm[field]} onChange={e => setPwForm({...pwForm, [field]: e.target.value})}
                placeholder="••••••••" className="input pl-10" required />
            </div>
          </div>
        ))}
        <button type="submit" disabled={pwMutation.isPending} className="btn-gold">
          {pwMutation.isPending ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}