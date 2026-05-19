import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";

// Fix leaflet default marker icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const goldIcon = new L.DivIcon({
  className: "",
  html: `<div style="background:linear-gradient(135deg,#D4AF37,#f5e060);width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #0a0a0a;box-shadow:0 4px 15px rgba(212,175,55,0.5)">
    <div style="transform:rotate(45deg);width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:16px">🏨</div>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -40],
});

const NEARBY_PLACES = [
  { name: "Pashupatinath Temple", lat: 27.7105, lng: 85.3487, type: "🛕" },
  { name: "Swayambhunath Stupa",  lat: 27.7149, lng: 85.2903, type: "☸️" },
  { name: "Thamel Market",        lat: 27.7172, lng: 85.3131, type: "🛍️" },
  { name: "Garden of Dreams",     lat: 27.7136, lng: 85.3128, type: "🌸" },
];

export default function HotelMap({ lat = 27.7136, lng = 85.3128, height = "400px" }) {
  return (
    <div style={{ height, borderRadius: "16px", overflow: "hidden" }} className="border border-gold-500/20">
      <MapContainer center={[lat, lng]} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={true}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* 1km radius highlight */}
        <Circle center={[lat, lng]} radius={800} pathOptions={{ color: "#D4AF37", fillColor: "#D4AF37", fillOpacity: 0.05, weight: 1, dashArray: "6" }} />

        {/* Hotel marker */}
        <Marker position={[lat, lng]} icon={goldIcon}>
          <Popup>
            <div style={{ background: "#1a1a1a", color: "#f5f5f5", borderRadius: "8px", padding: "8px", minWidth: "150px" }}>
              <strong style={{ color: "#D4AF37" }}>🏨 HamroStay</strong>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#aaa" }}>Luxury Hotel · Kathmandu</p>
            </div>
          </Popup>
        </Marker>

        {/* Nearby places */}
        {NEARBY_PLACES.map((p) => (
          <Marker key={p.name} position={[p.lat, p.lng]}>
            <Popup>
              <div style={{ background: "#1a1a1a", color: "#f5f5f5", borderRadius: "8px", padding: "8px" }}>
                <strong style={{ color: "#f5f5f5" }}>{p.type} {p.name}</strong>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}