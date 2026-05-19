import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">Get In Touch</p>
          <h1 className="section-title mb-4">Contact Us</h1>
          <p className="section-subtitle mx-auto text-center">We're here 24/7 to assist you with any queries or reservations.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Info */}
          <div className="space-y-6">
            {[
              { icon: MapPin, title: "Address",       info: "Thamel, Kathmandu 44600, Nepal" },
              { icon: Phone,  title: "Phone",         info: "+977 1 4XXXXXX · +977 98XXXXXXXX" },
              { icon: Mail,   title: "Email",         info: "info@hamrostay.com" },
              { icon: Clock,  title: "Reception",     info: "Open 24/7 — We never close" },
            ].map(({ icon: Icon, title, info }) => (
              <div key={title} className="flex gap-4 card-gold p-5">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <p className="font-semibold text-white mb-0.5">{title}</p>
                  <p className="text-dark-400 text-sm">{info}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <h3 className="font-display font-semibold text-white text-xl mb-2">Send a Message</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label text-xs">Your Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="John Doe" required className="input text-sm" />
              </div>
              <div>
                <label className="label text-xs">Email Address</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="you@example.com" required className="input text-sm" />
              </div>
            </div>
            <div>
              <label className="label text-xs">Subject</label>
              <input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                placeholder="How can we help?" required className="input text-sm" />
            </div>
            <div>
              <label className="label text-xs">Message</label>
              <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                placeholder="Your message..." rows={5} required className="input resize-none text-sm" />
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}