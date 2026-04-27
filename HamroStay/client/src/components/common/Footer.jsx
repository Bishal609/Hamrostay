// client/src/components/common/Footer.jsx
import { Link } from "react-router-dom";
import { Crown, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  const links = {
    Hotel:   [{ label: "About Us", href: "/about" }, { label: "Our Rooms", href: "/rooms" }, { label: "Facilities", href: "/about#facilities" }, { label: "Contact", href: "/contact" }],
    Guests:  [{ label: "Book a Room", href: "/rooms" }, { label: "Check Booking", href: "/login" }, { label: "Cancellation Policy", href: "/contact" }, { label: "FAQs", href: "/contact" }],
    Legal:   [{ label: "Privacy Policy", href: "/" }, { label: "Terms of Service", href: "/" }, { label: "Cookie Policy", href: "/" }],
  };

  return (
    <footer className="bg-dark-950 border-t border-white/5 mt-20">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
                <Crown size={16} className="text-dark-950" />
              </div>
              <span className="font-display text-xl font-bold text-gradient-gold">HamroStay</span>
            </Link>
            <p className="text-dark-400 text-sm leading-relaxed mb-6 max-w-xs">
              Experience unparalleled luxury in the heart of Nepal. Where Himalayan heritage meets world-class hospitality.
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                { icon: MapPin, text: "Thamel, Kathmandu, Nepal 44600" },
                { icon: Phone, text: "+977 1 4701234" },
                { icon: Mail, text: "reservations@hamrostay.com" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-dark-400">
                  <Icon size={14} className="text-gold-500 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{title}</h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-sm text-dark-400 hover:text-gold-400 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-dark-500 text-xs">© {year} HamroStay Luxury Hotels. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
              <button key={i} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-dark-400 hover:text-gold-400 hover:bg-gold-500/10 transition-all">
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
