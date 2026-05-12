import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import LoadingSpinner from '../components/LoadingSpinner';
import MapView from '../components/MapView';
import PremiumSelect from '../components/PremiumSelect';
import toast from 'react-hot-toast';
import { GitCompare, Leaf, Map, Rows3, Search, SlidersHorizontal, SplitSquareHorizontal, X } from 'lucide-react';

const PRICE_LABELS = {
  low: 'Budget',
  medium: 'Mid-range',
  high: 'Premium',
  budget: 'Budget',
  'mid-range': 'Mid-range',
  premium: 'Premium',
  luxury: 'Luxury',
};

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [meta, setMeta] = useState({ areas: [], cuisines: [], priceRanges: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', cuisine: '', location: '', priceRange: '', isVeg: false });
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [viewMode, setViewMode] = useState('split');
  const [favorites, setFavorites] = useState([]);
  const [compare, setCompare] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchMeta = async () => {
    try {
      const { data } = await api.get('/restaurants/meta');
      setMeta(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRestaurants = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (nextFilters.search) params.search = nextFilters.search;
      if (nextFilters.cuisine) params.cuisine = nextFilters.cuisine;
      if (nextFilters.location) params.location = nextFilters.location;
      if (nextFilters.priceRange) params.priceRange = nextFilters.priceRange;
      if (nextFilters.isVeg) params.isVeg = 'true';

      const { data } = await api.get('/restaurants', { params });

      setRestaurants(data);
      setSelectedRestaurant(null);
    } catch (err) {
      toast.error('Failed to load restaurants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
    fetchRestaurants();
    api.get('/restaurants/favorites/my').then(({ data }) => setFavorites(data.map((item) => item._id))).catch(() => {});
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchRestaurants();
  };

  const handleReset = () => {
    const nextFilters = { search: '', cuisine: '', location: '', priceRange: '', isVeg: false };
    setFilters(nextFilters);
    fetchRestaurants(nextFilters);
  };

  const filteredWithCoords = restaurants.filter((restaurant) => restaurant.lat && restaurant.lng);
  const avgRating = Number(meta.stats?.avgRating || 0).toFixed(1);
  const avgCost = Math.round(meta.stats?.avgCostForTwo || 0);

  const stats = useMemo(() => ([
    { label: 'Curated restaurants', value: meta.stats?.count || restaurants.length },
    { label: 'Chennai areas', value: meta.areas?.length || 0 },
    { label: 'Cuisine styles', value: meta.cuisines?.length || 0 },
    { label: 'Average rating', value: avgRating },
  ]), [meta, restaurants.length, avgRating]);

  const cuisineOptions = useMemo(() => [
    { value: '', label: 'All cuisines' },
    ...meta.cuisines.map((cuisine) => ({ value: cuisine, label: cuisine })),
  ], [meta.cuisines]);

  const areaOptions = useMemo(() => [
    { value: '', label: 'All areas' },
    ...meta.areas.map((area) => ({ value: area, label: area })),
  ], [meta.areas]);

  const priceOptions = useMemo(() => [
    { value: '', label: 'Any price' },
    ...meta.priceRanges.map((price) => ({ value: price, label: PRICE_LABELS[price] || price })),
  ], [meta.priceRanges]);

  const toggleFavorite = async (restaurant) => {
    try {
      const { data } = await api.post(`/restaurants/${restaurant._id}/favorite`);
      setFavorites(data.favorites.map((item) => item._id || item));
      toast.success(data.favorite ? 'Saved restaurant' : 'Removed from saved');
    } catch {
      toast.error('Could not update saved restaurants');
    }
  };

  const toggleCompare = (restaurant) => {
    setCompare((current) => {
      if (current.some((item) => item._id === restaurant._id)) return current.filter((item) => item._id !== restaurant._id);
      if (current.length >= 3) {
        toast('Compare supports up to 3 restaurants at a time');
        return current;
      }
      return [...current, restaurant];
    });
  };

  const filterForm = (
    <form onSubmit={handleFilter} className="luxury-card-3d p-5 sm:p-6 filter-panel mb-8">
      <div className="filter-grid grid grid-cols-1 gap-4 md:grid-cols-3 mb-5">
        <PremiumSelect label="Cuisine" value={filters.cuisine} onChange={(cuisine) => setFilters({ ...filters, cuisine })} options={cuisineOptions} />
        <PremiumSelect label="Area" value={filters.location} onChange={(location) => setFilters({ ...filters, location })} options={areaOptions} />
        <PremiumSelect label="Price" value={filters.priceRange} onChange={(priceRange) => setFilters({ ...filters, priceRange })} options={priceOptions} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setFilters({ ...filters, isVeg: !filters.isVeg })}
          className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition-all ${
            filters.isVeg ? 'border-emerald-300/30 bg-emerald-500/14 text-emerald-100' : 'border-white/10 bg-white/5 text-slate-300 hover:text-white'
          }`}
        >
          <Leaf className="h-4 w-4" />
          Veg only
        </button>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <button id="apply-filter-btn" type="submit" className="btn-primary-3d" onClick={() => setShowMobileFilters(false)}><Search className="h-4 w-4" />Search</button>
          <button type="button" onClick={handleReset} className="btn-secondary">Reset</button>
        </div>
      </div>
    </form>
  );

  return (
    <div className="page-shell">
      <div className="mb-8">
        <span className="eyebrow mb-4"><SlidersHorizontal className="h-4 w-4" />Complete Chennai restaurant guide</span>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="gradient-title mb-3 text-4xl font-black sm:text-5xl">Restaurants in Chennai</h1>
            <p className="max-w-2xl text-slate-400">
              Explore the full curated dataset with menus, table capacity, reviews, prices, cuisine filters, and map-ready locations.
            </p>
          </div>
          <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-400">
            {loading ? 'Loading restaurants...' : `${restaurants.length} matching restaurants`}
            {avgCost > 0 ? ` - Avg. Rs. ${avgCost} for two` : ''}
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38 }}
            className="metric-tile"
          >
            <p className="text-2xl font-black tabular-nums" style={{ color: 'rgb(var(--text))' }}>{item.value}</p>
            <p className="mt-0.5 text-xs font-semibold" style={{ color: 'rgb(var(--faint))' }}>{item.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="hidden md:block">{filterForm}</div>
      <button type="button" onClick={() => setShowMobileFilters(true)} className="btn-secondary mb-6 w-full md:hidden">
        <SlidersHorizontal className="h-4 w-4" /> Advanced filters
      </button>
      {showMobileFilters && (
        <div className="fixed inset-0 z-[100] bg-black/70 p-4 backdrop-blur-xl md:hidden">
          <div className="mb-3 flex justify-end">
            <button className="btn-secondary h-10 w-10 p-0" onClick={() => setShowMobileFilters(false)}><X className="h-5 w-5" /></button>
          </div>
          {filterForm}
        </div>
      )}

      {compare.length > 0 && (
        <div className="luxury-card-3d p-5 sm:p-6 mb-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-black text-white"><GitCompare className="h-5 w-5 text-[rgb(var(--accent))]" />Compare shortlist</h2>
            <button className="btn-secondary" onClick={() => setCompare([])}>Clear</button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {compare.map((item) => (
              <div key={item._id} className="surface-muted p-4">
                <p className="font-black text-white">{item.name}</p>
                <p className="text-sm text-slate-400">{item.area} - {item.cuisine?.slice?.(0, 2).join(', ')}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <span>Rating <b className="block text-white">{Number(item.rating || 0).toFixed(1)}</b></span>
                  <span>Cost <b className="block text-white">Rs. {item.avgCostForTwo || 0}</b></span>
                  <span>Tags <b className="block text-white">{item.tags?.length || 0}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && restaurants.length > 0 && (
        <div className="mb-4 flex justify-end">
          <div className="segmented">
          {[
            ['split', 'Split', SplitSquareHorizontal],
            ['list', 'List', Rows3],
            ['map', 'Map', Map],
          ].map(([mode, label, Icon]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`segmented-btn ${viewMode === mode ? 'segmented-btn-active' : ''}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="skeleton h-[28rem]" />)}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="luxury-card-3d flex flex-col items-center gap-3 py-20 text-center">
          <span className="mb-1 grid h-16 w-16 place-items-center rounded-3xl" style={{ background: 'rgba(var(--accent),0.10)' }}>
            <SlidersHorizontal className="h-8 w-8" style={{ color: 'rgb(var(--accent))' }} />
          </span>
          <p className="text-lg font-black" style={{ color: 'rgb(var(--text))' }}>No restaurants found</p>
          <p className="max-w-xs text-sm" style={{ color: 'rgb(var(--faint))' }}>Try broader filters — adjust your cuisine, area, or price range.</p>
          <button type="button" onClick={handleReset} className="btn-secondary mt-2">Reset filters</button>
        </div>
      ) : (
        <div className={viewMode === 'split' ? 'flex flex-col lg:flex-row gap-6' : ''}>
          {viewMode !== 'map' && (
            <div className={viewMode === 'split' ? 'flex-1 overflow-y-auto max-h-[780px] pr-1 scroll-fade' : ''}>
              <div className={`grid gap-5 ${viewMode === 'list' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {restaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant._id}
                    restaurant={restaurant}
                    isFavorite={favorites.includes(restaurant._id)}
                    onFavorite={toggleFavorite}
                    onCompare={toggleCompare}
                    compareActive={compare.some((item) => item._id === restaurant._id)}
                    onViewMap={filteredWithCoords.length > 0 ? (selected) => {
                      setSelectedRestaurant(selected);
                      if (viewMode === 'list') setViewMode('split');
                    } : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {(viewMode === 'split' || viewMode === 'map') && (
            <div className={viewMode === 'map' ? 'h-[min(720px,75vh)]' : 'h-[620px] flex-1 lg:sticky lg:top-24 lg:h-[780px]'}>
              <MapView
                restaurants={filteredWithCoords}
                selectedRestaurant={selectedRestaurant}
                setSelectedRestaurant={setSelectedRestaurant}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
