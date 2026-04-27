import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Crown, User, Lock, Mail, Phone } from "lucide-react";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const navigate    = useNavigate();
  const { register } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const { user } = await register(form);
      toast.success("Account created! Welcome to HamroStay.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-dark-900">
        <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80" alt="" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center">
              <Crown className="w-5 h-5 text-dark-950" />
            </div>
            <span className="text-2xl font-display font-bold text-gradient-gold">HamroStay</span>
          </div>
          <h2 className="font-display text-4xl font-bold text-white mb-4">Join HamroStay</h2>
          <p className="text-dark-300 text-lg leading-relaxed max-w-md">Create your account to unlock exclusive member rates, priority booking, and a personalised luxury experience.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-dark-400 mb-8">Already have an account? <Link to="/login" className="text-gold-400 hover:text-gold-300">Sign in</Link></p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="John Doe" required className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="you@example.com" required className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="+977 9XXXXXXXXX" className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type={show ? "text" : "password"} value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="Min. 6 characters" required className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
          <p className="text-dark-500 text-xs text-center mt-4">By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}