import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Star, Users, BedDouble, Maximize2, Wifi, Check, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { roomApi } from "../../api/roomApi";
import { bookingApi } from "../../api/bookingApi";
import { paymentApi } from "../../api/paymentApi";
import Loader from "../../components/common/Loader";
import { fmtDate, nightsBetween } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

export default function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [imgIdx, setImgIdx] = useState(0);
  const [checkIn,  setCheckIn]  = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests,   setGuests]   = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  const { data: room, isLoading } = useQuery({
    queryKey: ["room", id],
    queryFn: () => roomApi.getRoomById(id).then(r => r.data.data),
  });

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const TAX = 0.13;
  const baseAmount   = room ? room.pricePerNight * (1 - (room.discount || 0) / 100) * nights : 0;
  const taxAmount    = baseAmount * TAX;
  const finalAmount  = baseAmount + taxAmount;

  const bookMutation = useMutation({
    mutationFn: (data) => bookingApi.createBooking(data).then(r => r.data.data),
    onSuccess: async (booking) => {
      toast.loading("Redirecting to payment...");
      const payRes = await paymentApi.createSession(booking.id).then(r => r.data.data);
      window.location.href = payRes.url;
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Booking failed.");
      setIsBooking(false);
    },
  });

  const handleBook = async () => {
    if (!isAuthenticated()) return navigate("/login");
    if (!checkIn || !checkOut) return toast.error("Please select check-in and check-out dates.");
    if (nights < 1) return toast.error("Check-out must be after check-in.");
    setIsBooking(true);
    bookMutation.mutate({
      roomId: id, checkIn, checkOut, guests,
      guestDetails: { name: user.name, email: user.email },
    });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center pt-24"><Loader size="lg" text="Loading room details..." /></div>;
  if (!room)    return <div className="min-h-screen flex items-center justify-center pt-24"><p className="text-dark-400">Room not found.</p></div>;

  const images = room.images?.length ? room.images : ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80"];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-400 hover:text-gold-400 text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Rooms
        </button>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left — Details */}
          <div className="lg:col-span-3 space-y-8">
            {/* Gallery */}
            <div className="relative rounded-2xl overflow-hidden h-72 sm:h-96">
              <img src={images[imgIdx]} alt={room.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950/40 to-transparent" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-dark-950/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-dark-900 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-dark-950/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-dark-900 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? "bg-gold-400 w-4" : "bg-white/40"}`} />
                    ))}
                  </div>
                </>
              )}
              {room.discount > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-500/90 text-white text-xs font-bold">-{room.discount}% OFF</div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === imgIdx ? "border-gold-500" : "border-transparent opacity-60 hover:opacity-100"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Room Info */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-display text-3xl font-bold text-white mb-1">{room.name}</h1>
                  <p className="text-dark-400 text-sm">Room #{room.roomNumber} · Floor {room.floor}</p>
                </div>
                {room.averageRating > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold-500/10 border border-gold-500/20">
                    <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
                    <span className="font-bold text-white">{room.averageRating}</span>
                    <span className="text-dark-400 text-xs">({room.reviewCount})</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-dark-300 mb-5">
                {[[Users, `${room.capacity} Guests`],[BedDouble, room.bedType],[Maximize2, `${room.size} sq ft`]].map(([Icon, label]) => (
                  <div key={label} className="flex items-center gap-1.5"><Icon className="w-4 h-4 text-gold-500/60" />{label}</div>
                ))}
              </div>

              <p className="text-dark-300 leading-relaxed mb-6">{room.description}</p>

              {/* Amenities */}
              <div>
                <h3 className="font-display font-semibold text-white mb-3">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {room.amenities?.map(a => (
                    <div key={a} className="flex items-center gap-2 text-sm text-dark-300">
                      <Check className="w-4 h-4 text-gold-500 flex-shrink-0" />{a}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews */}
            {room.reviews?.length > 0 && (
              <div>
                <h3 className="font-display font-semibold text-white mb-4">Guest Reviews</h3>
                <div className="space-y-4">
                  {room.reviews.slice(0, 5).map(review => (
                    <div key={review.id} className="card p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-dark-950 text-xs font-bold">
                          {review.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{review.user?.name}</p>
                          <div className="flex gap-0.5">{[1,2,3,4,5].map(i=><Star key={i} className={`w-3 h-3 ${i<=review.rating?"text-gold-400 fill-gold-400":"text-dark-700"}`}/>)}</div>
                        </div>
                        <span className="ml-auto text-xs text-dark-500">{fmtDate(review.createdAt)}</span>
                      </div>
                      <p className="text-dark-300 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — Booking Card */}
          <div className="lg:col-span-2">
            <div className="card-gold p-6 sticky top-28 border border-gold-500/25">
              <div className="mb-4">
                {room.discount > 0 ? (
                  <div>
                    <span className="text-dark-500 line-through text-sm">रू {room.pricePerNight}/night</span>
                    <p className="text-3xl font-bold text-gold-400">रू {(room.pricePerNight * (1 - room.discount / 100)).toFixed(0)}<span className="text-base font-normal text-dark-400">/night</span></p>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-gold-400">रू {room.pricePerNight}<span className="text-base font-normal text-dark-400">/night</span></p>
                )}
                <p className="text-xs text-dark-400 mt-1">+ 13% VAT</p>
              </div>

              <div className="gold-divider" />

              <div className="space-y-3 mb-4">
                <div>
                  <label className="label text-xs">Check-In Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500/60" />
                    <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split("T")[0]} className="input pl-10 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Check-Out Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500/60" />
                    <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split("T")[0]} className="input pl-10 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Guests</label>
                  <select value={guests} onChange={e => setGuests(parseInt(e.target.value))} className="input text-sm">
                    {Array.from({length: room.capacity}, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>

              {nights > 0 && (
                <div className="bg-dark-800/50 rounded-xl p-4 mb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-dark-300">
                    <span>रू {(room.pricePerNight * (1 - (room.discount || 0)/100)).toFixed(0)} × {nights} night{nights>1?"s":""}</span>
                    <span>रू {baseAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-dark-300">
                    <span>Taxes (13% VAT)</span>
                    <span>रू {taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white border-t border-white/10 pt-2">
                    <span>Total</span>
                    <span className="text-gold-400">रू {finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button onClick={handleBook} disabled={isBooking || bookMutation.isPending}
                className="btn-gold w-full flex items-center justify-center gap-2">
                {isBooking ? "Processing..." : isAuthenticated() ? "Book Now & Pay" : "Sign In to Book"}
              </button>

              <p className="text-center text-dark-500 text-xs mt-3">Free cancellation · Secure payment via Khalti</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}