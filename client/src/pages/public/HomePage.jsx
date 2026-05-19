import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Users, Search, Star, Shield, Clock, Wifi, Coffee, Car, Dumbbell, Waves, ChefHat } from "lucide-react";
import { roomApi } from "../../api/roomApi";
import RoomCard from "../../components/rooms/RoomCard";
import HotelMap from "../../components/maps/HotelMap";
import Loader from "../../components/common/Loader";

const AMENITIES = [
  { icon: Wifi, label: "Free Wi-Fi" },
  { icon: Coffee, label: "Fine Dining" },
  { icon: Car, label: "Valet Parking" },
  { icon: Dumbbell, label: "Fitness Center" },
  { icon: Waves, label: "Swimming Pool" },
  { icon: ChefHat, label: "Room Service" },
];

const STATS = [
  { value: "500+", label: "Happy Guests" },
  { value: "50+",  label: "Luxury Rooms" },
  { value: "15+",  label: "Years of Excellence" },
  { value: "4.9",  label: "Average Rating" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [checkIn,  setCheckIn]  = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests,   setGuests]   = useState(1);

  const { data: featuredData, isLoading } = useQuery({
    queryKey: ["rooms", "featured"],
    queryFn: () => roomApi.getRooms({ featured: true, limit: 6 }).then(r => r.data.data),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkIn)  params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests)   params.set("capacity", guests);
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div className="overflow-hidden">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=90"
            alt="HamroStay Hero"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950/50 via-dark-950/60 to-dark-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950/80 via-transparent to-dark-950/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm font-medium mb-6">
              <Star className="w-4 h-4 fill-current" /> Nepal's Premier Luxury Hotel
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
              Experience<br />
              <span className="text-gradient-gold">Timeless</span><br />
              Luxury
            </h1>
            <p className="text-dark-300 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl">
              Nestled in the heart of Kathmandu, HamroStay offers an unrivalled blend of Nepali heritage and world-class modern hospitality.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="glass p-4 sm:p-5 rounded-2xl border border-gold-500/20 shadow-gold">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="label text-xs">Check-In</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500/60" />
                    <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="input pl-10 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Check-Out</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500/60" />
                    <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split("T")[0]}
                      className="input pl-10 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Guests</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500/60" />
                    <select value={guests} onChange={e => setGuests(e.target.value)} className="input pl-10 text-sm">
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-gold w-full flex items-center justify-center gap-2">
                <Search className="w-4 h-4" /> Search Available Rooms
              </button>
            </form>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dark-500 animate-bounce">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gold-500/50 to-transparent" />
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="py-12 bg-dark-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl sm:text-4xl font-display font-bold text-gradient-gold mb-1">{value}</div>
                <div className="text-dark-400 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Rooms ────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">Our Collection</p>
          <h2 className="section-title mb-4">Featured Rooms & Suites</h2>
          <p className="section-subtitle mx-auto text-center">Each room is a masterpiece of design and comfort, crafted to deliver an unforgettable experience.</p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader size="lg" text="Loading rooms..." /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredData?.rooms?.map(room => <RoomCard key={room.id} room={room} />)}
          </div>
        )}
        <div className="text-center mt-10">
          <a href="/rooms" className="btn-outline-gold inline-flex items-center gap-2">View All Rooms</a>
        </div>
      </section>

      {/* ── Amenities ─────────────────────────────────────── */}
      <section className="py-20 bg-dark-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">World-Class</p>
            <h2 className="section-title mb-4">Hotel Amenities</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {AMENITIES.map(({ icon: Icon, label }) => (
              <div key={label} className="card-gold p-5 flex flex-col items-center gap-3 text-center group hover:border-gold-500/40 cursor-default">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center group-hover:bg-gold-500/20 transition-colors">
                  <Icon className="w-5 h-5 text-gold-400" />
                </div>
                <span className="text-sm text-dark-300 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">Why HamroStay</p>
              <h2 className="section-title mb-6">Luxury Redefined, <span className="text-gradient-gold">Every Stay</span></h2>
              <div className="space-y-5">
                {[
                  { icon: Shield, title: "Best Rate Guarantee", desc: "We guarantee the best available rate on all our rooms. Book directly for exclusive perks." },
                  { icon: Clock,  title: "24/7 Concierge",      desc: "Our dedicated team is available around the clock to fulfill any request, anytime." },
                  { icon: Star,   title: "5-Star Experience",   desc: "Award-winning hospitality with meticulous attention to every detail of your stay." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-gold-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{title}</h4>
                      <p className="text-dark-400 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&q=80" alt="Luxury Room" className="rounded-2xl w-full object-cover h-80 lg:h-[460px]" />
              <div className="absolute -bottom-4 -left-4 glass border border-gold-500/20 rounded-2xl px-5 py-4 shadow-gold">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <img key={i} src={`https://i.pravatar.cc/32?img=${i+10}`} className="w-8 h-8 rounded-full border-2 border-dark-900" alt="" />
                    ))}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">500+ reviews</p>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(i=><Star key={i} className="w-3 h-3 text-gold-400 fill-gold-400"/>)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Map ───────────────────────────────────────────── */}
      <section className="py-20 bg-dark-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">Location</p>
            <h2 className="section-title mb-4">Find Us in Kathmandu</h2>
            <p className="section-subtitle mx-auto text-center">Centrally located in Thamel, minutes from major attractions.</p>
          </div>
          <HotelMap height="450px" />
        </div>
      </section>
    </div>
  );
}