import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { roomApi } from "../../api/roomApi";
import RoomCard from "../../components/rooms/RoomCard";
import Loader from "../../components/common/Loader";
import { ROOM_TYPES } from "../../utils/constants";
import { useDebounce } from "../../hooks/useDebounce";

export default function RoomsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search,    setSearch]    = useState(searchParams.get("search") || "");
  const [type,      setType]      = useState(searchParams.get("type") || "");
  const [minPrice,  setMinPrice]  = useState(searchParams.get("minPrice") || "");
  const [maxPrice,  setMaxPrice]  = useState(searchParams.get("maxPrice") || "");
  const [capacity,  setCapacity]  = useState(searchParams.get("capacity") || "");
  const [sortBy,    setSortBy]    = useState("pricePerNight");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page,      setPage]      = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const params = {
    page, limit: 9,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(type      && { type }),
    ...(minPrice  && { minPrice }),
    ...(maxPrice  && { maxPrice }),
    ...(capacity  && { capacity }),
    sortBy, sortOrder,
    status: "AVAILABLE",
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["rooms", params],
    queryFn: () => roomApi.getRooms(params).then(r => r.data.data),
    keepPreviousData: true,
  });

  const clearFilters = () => {
    setSearch(""); setType(""); setMinPrice(""); setMaxPrice(""); setCapacity(""); setPage(1);
  };
  const hasFilters = search || type || minPrice || maxPrice || capacity;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-2">Our Collection</p>
          <h1 className="section-title">Rooms & Suites</h1>
          <p className="section-subtitle mt-2">Discover your perfect sanctuary from our curated selection of luxury accommodations.</p>
        </div>

        {/* Search + Filter bar */}
        <div className="glass border border-white/10 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input type="text" placeholder="Search rooms..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="input pl-10 text-sm" />
          </div>
          <div className="flex gap-2">
            <select value={sortBy + "_" + sortOrder} onChange={e => { const [by, order] = e.target.value.split("_"); setSortBy(by); setSortOrder(order); }}
              className="input text-sm w-auto">
              <option value="pricePerNight_asc">Price: Low to High</option>
              <option value="pricePerNight_desc">Price: High to Low</option>
              <option value="createdAt_desc">Newest First</option>
            </select>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showFilters ? "bg-gold-500/15 border-gold-500/40 text-gold-400" : "border-white/10 text-dark-300 hover:border-gold-500/30"}`}>
              <SlidersHorizontal className="w-4 h-4" /> Filters
              {hasFilters && <span className="w-2 h-2 rounded-full bg-gold-500" />}
            </button>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="card p-5 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-slide-down">
            <div>
              <label className="label text-xs">Room Type</label>
              <select value={type} onChange={e => { setType(e.target.value); setPage(1); }} className="input text-sm">
                <option value="">All Types</option>
                {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-xs">Min Price/Night</label>
              <input type="number" placeholder="$0" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1); }} className="input text-sm" />
            </div>
            <div>
              <label className="label text-xs">Max Price/Night</label>
              <input type="number" placeholder="$999" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1); }} className="input text-sm" />
            </div>
            <div>
              <label className="label text-xs">Min Capacity</label>
              <select value={capacity} onChange={e => { setCapacity(e.target.value); setPage(1); }} className="input text-sm">
                <option value="">Any</option>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}+ Guests</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader size="lg" text="Loading rooms..." /></div>
        ) : (
          <>
            <p className="text-dark-400 text-sm mb-5">
              {isFetching ? "Updating..." : `${data?.pagination?.total || 0} rooms found`}
            </p>
            {data?.rooms?.length === 0 ? (
              <div className="text-center py-20 card">
                <p className="text-4xl mb-4">🏨</p>
                <h3 className="font-display text-xl text-white mb-2">No rooms found</h3>
                <p className="text-dark-400 text-sm mb-4">Try adjusting your search or filters.</p>
                <button onClick={clearFilters} className="btn-outline-gold">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.rooms?.map(room => <RoomCard key={room.id} room={room} />)}
              </div>
            )}

            {/* Pagination */}
            {data?.pagination?.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg border border-white/10 text-dark-300 hover:border-gold-500/30 hover:text-gold-400 disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === page ? "bg-gold-500 text-dark-950 font-bold" : "border border-white/10 text-dark-300 hover:border-gold-500/30 hover:text-gold-400"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))} disabled={page === data.pagination.totalPages}
                  className="p-2 rounded-lg border border-white/10 text-dark-300 hover:border-gold-500/30 hover:text-gold-400 disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}