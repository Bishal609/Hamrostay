import { Link } from "react-router-dom";
import { Star, Users, BedDouble, Maximize2, Eye } from "lucide-react";

const TYPE_BADGE = {
  STANDARD:     { label: "Standard",     color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  DELUXE:       { label: "Deluxe",       color: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
  SUITE:        { label: "Suite",        color: "bg-gold-500/15 text-gold-400 border-gold-500/20" },
  PRESIDENTIAL: { label: "Presidential", color: "bg-rose-500/15 text-rose-400 border-rose-500/20" },
  PENTHOUSE:    { label: "Penthouse",    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
};

export default function RoomCard({ room }) {
  const badge = TYPE_BADGE[room.type] || TYPE_BADGE.STANDARD;
  const discountedPrice = room.discount > 0
    ? room.pricePerNight * (1 - room.discount / 100)
    : null;

  return (
    <div className="card-gold group overflow-hidden">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={room.images?.[0] || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80"}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${badge.color}`}>
            {badge.label}
          </span>
          {room.isFeatured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gold-500/90 text-dark-950">
              <Star className="w-3 h-3 fill-current" /> Featured
            </span>
          )}
          {room.discount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/90 text-white">
              -{room.discount}%
            </span>
          )}
        </div>

        {/* Rating */}
        {room.averageRating > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-dark-950/80 backdrop-blur-sm px-2 py-1 rounded-lg">
            <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
            <span className="text-xs font-semibold text-white">{room.averageRating}</span>
            <span className="text-xs text-dark-400">({room.reviewCount})</span>
          </div>
        )}

        {/* Room number */}
        <div className="absolute bottom-3 left-3">
          <span className="text-xs text-dark-300 font-mono">#{room.roomNumber}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-display font-semibold text-white text-lg leading-tight line-clamp-1 group-hover:text-gold-400 transition-colors">
            {room.name}
          </h3>
        </div>
        <p className="text-dark-400 text-sm line-clamp-2 mb-4 leading-relaxed">{room.description}</p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-dark-400 text-xs mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-gold-500/60" />
            <span>{room.capacity} guests</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BedDouble className="w-3.5 h-3.5 text-gold-500/60" />
            <span>{room.bedType}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-gold-500/60" />
            <span>{room.size} sq ft</span>
          </div>
        </div>

        {/* Amenities */}
        {room.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {room.amenities.slice(0, 4).map((a) => (
              <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-dark-400 border border-white/5">{a}</span>
            ))}
            {room.amenities.length > 4 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-dark-400 border border-white/5">+{room.amenities.length - 4}</span>
            )}
          </div>
        )}

        <div className="gold-divider !my-3" />

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            {discountedPrice ? (
              <div>
                <span className="text-xs text-dark-500 line-through">रू{room.pricePerNight}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-gold-400">रू{discountedPrice.toFixed(0)}</span>
                  <span className="text-xs text-dark-400">/ night</span>
                </div>
              </div>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-gold-400">रू{room.pricePerNight}</span>
                <span className="text-xs text-dark-400">/ night</span>
              </div>
            )}
          </div>
          <Link to={`/rooms/${room.id}`}
            className="flex items-center gap-2 btn-gold text-sm py-2 px-4">
            <Eye className="w-4 h-4" /> View
          </Link>
        </div>
      </div>
    </div>
  );
}