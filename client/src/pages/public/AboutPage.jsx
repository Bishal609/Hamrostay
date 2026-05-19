import { Shield, Award, Heart, Globe } from "lucide-react";
import HotelMap from "../../components/maps/HotelMap";

const TEAM = [
  { name: "Arjun Sharma",  role: "General Manager",       img: "https://i.pravatar.cc/200?img=11" },
  { name: "Priya Thapa",   role: "Head of Hospitality",   img: "https://i.pravatar.cc/200?img=5"  },
  { name: "Bikash Rai",    role: "Executive Chef",         img: "https://i.pravatar.cc/200?img=12" },
  { name: "Sita Karmacharya", role: "Spa Director",        img: "https://i.pravatar.cc/200?img=9" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900/50 to-dark-950" />
        <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1400&q=80" alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-4">Our Story</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
            Crafting <span className="text-gradient-gold">Extraordinary</span><br />Moments Since 2009
          </h1>
          <p className="text-dark-300 text-lg leading-relaxed">
            HamroStay was born from a vision to blend Nepal's rich cultural heritage with world-class luxury hospitality.
            For over 15 years, we have been the preferred destination for discerning travellers seeking authenticity and refinement.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: "Trust",       desc: "Unwavering commitment to your safety, privacy, and complete satisfaction." },
            { icon: Award,  title: "Excellence",  desc: "Every detail meticulously crafted to exceed your highest expectations." },
            { icon: Heart,  title: "Warmth",      desc: "Genuine Nepali hospitality that makes every guest feel truly at home." },
            { icon: Globe,  title: "Sustainability",desc: "Committed to eco-friendly practices that protect Nepal's natural beauty." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card-gold p-6 text-center group hover:border-gold-500/40 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-500/20 transition-colors">
                <Icon className="w-6 h-6 text-gold-400" />
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">{title}</h3>
              <p className="text-dark-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-dark-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">The Team</p>
            <h2 className="font-display text-3xl font-bold text-white">Meet Our Experts</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map(({ name, role, img }) => (
              <div key={name} className="text-center group">
                <div className="relative w-28 h-28 mx-auto mb-4">
                  <img src={img} alt={name} className="w-full h-full rounded-full object-cover ring-2 ring-dark-700 group-hover:ring-gold-500/40 transition-all duration-300" />
                  <div className="absolute inset-0 rounded-full bg-gold-500/0 group-hover:bg-gold-500/10 transition-all duration-300" />
                </div>
                <h4 className="font-semibold text-white text-sm">{name}</h4>
                <p className="text-dark-400 text-xs mt-0.5">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-white mb-2">Find Us</h2>
          <p className="text-dark-400">Thamel, Kathmandu, Nepal — the cultural heart of the city</p>
        </div>
        <HotelMap height="400px" />
      </section>
    </div>
  );
}