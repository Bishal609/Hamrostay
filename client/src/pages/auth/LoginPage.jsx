import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Crown, Lock, Mail } from "lucide-react";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuthStore();
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await login(form);
      toast.success(`Welcome back, ${user.name}!`);
      const redirect = user.role === "ADMIN" ? "/admin" : user.role === "VENDOR" ? "/vendor" : from;
      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-dark-900">
        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80" alt="" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center">
              <Crown className="w-5 h-5 text-dark-950" />
            </div>
            <span className="text-2xl font-display font-bold text-gradient-gold">HamroStay</span>
          </div>
          <h2 className="font-display text-4xl font-bold text-white mb-4">Welcome Back</h2>
          <p className="text-dark-300 text-lg leading-relaxed max-w-md">Sign in to manage your reservations, access exclusive member benefits, and continue your luxury journey.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {["5-Star Hospitality","AI Concierge","Instant Confirmation"].map(b=>(
              <span key={b} className="badge-gold">{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center">
                <Crown className="w-5 h-5 text-dark-950" />
              </div>
              <span className="text-xl font-display font-bold text-gradient-gold">HamroStay</span>
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Sign In</h1>
          <p className="text-dark-400 mb-8">Don't have an account? <Link to="/register" className="text-gold-400 hover:text-gold-300">Create one</Link></p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="you@example.com" required className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type={show ? "text" : "password"} value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="••••••••" required className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-dark-800/50 border border-white/5">
            <p className="text-dark-400 text-xs font-medium mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs text-dark-500 font-mono">
              <p>Admin:    admin@hamrostay.com / admin123</p>
              <p>Customer: guest@hamrostay.com / guest123</p>
              <p>Vendor:   vendor@hamrostay.com / vendor123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}