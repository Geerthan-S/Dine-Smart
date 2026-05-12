import { Link } from 'react-router-dom';
import {
  Clock, GitCompare, Heart, Leaf, MapPin,
  Navigation, Star, UsersRound, Utensils, ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

const priceColors = {
  low:        'bg-emerald-500/10 text-emerald-300 border-emerald-400/22',
  medium:     'bg-sky-500/10 text-sky-300 border-sky-400/22',
  high:       'bg-violet-500/10 text-violet-300 border-violet-400/22',
  budget:     'bg-emerald-500/10 text-emerald-300 border-emerald-400/22',
  'mid-range':'bg-sky-500/10 text-sky-300 border-sky-400/22',
  premium:    'bg-violet-500/10 text-violet-300 border-violet-400/22',
  luxury:     'bg-amber-500/10 text-amber-300 border-amber-400/22',
};

const priceLabels = {
  low: 'Budget', medium: 'Mid-range', high: 'Premium',
  budget: 'Budget', 'mid-range': 'Mid-range', premium: 'Premium', luxury: 'Luxury',
};

const tableSummary = (tables = []) => {
  const total = tables.reduce((s, t) => s + (Number(t.count) || 0), 0);
  const max   = tables.reduce((m, t) => Math.max(m, Number(t.capacity) || 0), 0);
  if (!total) return null;
  return `${total} tables · up to ${max} guests`;
};

export default function RestaurantCard({
  restaurant,
  onViewMap,
  onFavorite,
  isFavorite = false,
  onCompare,
  compareActive = false,
}) {
  const {
    _id, name, brand, location, area, city, cuisine, priceRange,
    rating, numReviews, description, image, isVeg, avgCostForTwo,
    tags, openingHours, isOpenNow, menu, address, tables,
  } = restaurant;

  const cuisineList    = Array.isArray(cuisine) ? cuisine : (cuisine ? [cuisine] : []);
  const displayLoc     = [area || location, city && city !== area ? city : null].filter(Boolean).join(', ');
  const featuredMenu   = Array.isArray(menu) ? menu.slice(0, 3) : [];
  const capacityText   = tableSummary(tables);
  const noRealImage    = !image || image.includes('placehold');

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
      className="luxury-card-3d animated-border shimmer-hover group flex h-full flex-col"
    >
      {/* ── Image band ─────────────────────────────────────── */}
      <div className="restaurant-visual relative mb-0 h-48 w-full overflow-hidden rounded-t-[var(--radius-lg)] bg-slate-900">
        {noRealImage ? (
          <div className="restaurant-placeholder flex h-full w-full flex-col justify-end p-5 transition-transform duration-700 group-hover:scale-108">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-100/90">
              {cuisineList[0] || 'Chennai dining'}
            </span>
            <span className="mt-2 text-xl font-black leading-tight text-white drop-shadow-sm">
              {brand || name}
            </span>
            <span className="mt-1 flex items-center gap-1 text-[11px] text-slate-100/80">
              <MapPin className="h-3 w-3" aria-hidden="true" />{displayLoc}
            </span>
          </div>
        ) : (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
          />
        )}

        {/* Gradient overlay */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
          style={{ background: 'linear-gradient(to top, rgba(10,12,16,0.88), transparent)' }}
          aria-hidden="true"
        />

        {/* Status badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span
            className={`badge backdrop-blur-md ${
              isOpenNow
                ? 'border-emerald-400/24 bg-emerald-500/18 text-emerald-200'
                : 'border-slate-600/40 bg-slate-950/68 text-slate-300'
            }`}
          >
            <Clock className="mr-1 h-3 w-3" aria-hidden="true" />
            {isOpenNow ? 'Open now' : 'Closed'}
          </span>
          <span
            className={`badge backdrop-blur-md ${
              isVeg
                ? 'border-emerald-400/24 bg-emerald-500/18 text-emerald-200'
                : 'border-rose-400/24 bg-rose-500/18 text-rose-200'
            }`}
          >
            <Leaf className="mr-1 h-3 w-3" aria-hidden="true" />
            {isVeg ? 'Veg' : 'Non-veg'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="absolute right-3 top-3 flex gap-1.5">
          {onFavorite && (
            <button
              type="button"
              onClick={() => onFavorite(restaurant)}
              className={`grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-[#0F1115]/72 text-white backdrop-blur-md transition-all duration-260 hover:scale-110 hover:text-[rgb(var(--accent))] ${
                isFavorite ? 'text-[rgb(var(--accent))]' : ''
              }`}
              aria-label={isFavorite ? 'Remove from saved' : 'Save restaurant'}
            >
              <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
          {onCompare && (
            <button
              type="button"
              onClick={() => onCompare(restaurant)}
              className={`grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-[#0F1115]/72 text-white backdrop-blur-md transition-all duration-260 hover:scale-110 hover:text-[rgb(var(--accent))] ${
                compareActive ? 'text-[rgb(var(--accent))]' : ''
              }`}
              aria-label={compareActive ? 'Remove from compare' : 'Compare restaurant'}
            >
              <GitCompare className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-5">
        {/* Name + rating */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <h3
              className="text-base font-black leading-tight transition-colors duration-260 group-hover:text-[rgb(var(--accent-hover))]"
              style={{ color: 'rgb(var(--text))' }}
            >
              {name}
            </h3>
            {brand && brand !== name && (
              <p className="mt-0.5 text-xs" style={{ color: 'rgb(var(--faint))' }}>{brand}</p>
            )}
          </div>
          <div
            className="flex-shrink-0 rounded-xl border px-2 py-1.5 text-right"
            style={{
              borderColor: 'rgba(var(--accent),0.28)',
              background: 'rgba(var(--accent),0.10)',
            }}
          >
            <div
              className="flex items-center gap-1 text-sm font-black"
              style={{ color: 'rgb(var(--accent))' }}
            >
              <Star className="h-3 w-3 fill-current" aria-hidden="true" />
              {Number(rating || 0).toFixed(1)}
            </div>
            {numReviews > 0 && (
              <div className="text-[10px]" style={{ color: 'rgb(var(--faint))' }}>
                {numReviews.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <p className="mb-1 flex items-center gap-1.5 text-xs" style={{ color: 'rgb(var(--muted))' }}>
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[rgb(var(--accent))]" aria-hidden="true" />
          {displayLoc}
        </p>
        {address && (
          <p className="mb-3 line-clamp-1 text-[11px]" style={{ color: 'rgb(var(--faint))' }}>
            {address}
          </p>
        )}

        {/* Cuisine tags */}
        {cuisineList.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {cuisineList.slice(0, 3).map((c) => (
              <span
                key={c}
                className="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                style={{ borderColor: 'rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.05)', color: 'rgb(var(--muted))' }}
              >
                {c}
              </span>
            ))}
            {cuisineList.length > 3 && (
              <span className="px-1 py-0.5 text-[11px]" style={{ color: 'rgb(var(--faint))' }}>
                +{cuisineList.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price / cost row */}
        <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
          <div className={`rounded-xl border px-2.5 py-1.5 ${priceColors[priceRange] || 'border-white/9 bg-white/5 text-slate-300'}`}>
            <p className="opacity-65">Price</p>
            <p className="font-bold">{priceLabels[priceRange] || priceRange || 'Any'}</p>
          </div>
          <div className="surface-muted px-2.5 py-1.5">
            <p style={{ color: 'rgb(var(--faint))' }}>Cost for two</p>
            <p className="font-bold" style={{ color: 'rgb(var(--text))' }}>
              {avgCostForTwo > 0 ? `₹${avgCostForTwo}` : 'On request'}
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="mb-3 space-y-1">
          {openingHours && (
            <p className="flex items-center gap-1.5 text-[11px]" style={{ color: 'rgb(var(--faint))' }}>
              <Clock className="h-3 w-3" aria-hidden="true" />{openingHours}
            </p>
          )}
          {capacityText && (
            <p className="flex items-center gap-1.5 text-[11px]" style={{ color: 'rgb(var(--faint))' }}>
              <UsersRound className="h-3 w-3" aria-hidden="true" />{capacityText}
            </p>
          )}
        </div>

        {/* Featured menu */}
        {featuredMenu.length > 0 && (
          <div
            className="mb-3 rounded-xl p-3"
            style={{ background: 'rgba(var(--surface),0.52)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p
              className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ color: 'rgb(var(--faint))' }}
            >
              <Utensils className="h-3 w-3" aria-hidden="true" />Popular menu
            </p>
            <div className="space-y-1">
              {featuredMenu.map((item) => (
                <div
                  key={`${item.name}-${item.price}`}
                  className="flex items-center justify-between gap-2 text-[11px]"
                >
                  <span className="line-clamp-1" style={{ color: 'rgb(var(--muted))' }}>{item.name}</span>
                  <span className="flex-shrink-0 font-semibold" style={{ color: 'rgb(var(--accent))' }}>
                    ₹{item.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag} className="match-chip rounded-full px-2 py-0.5 text-[10px]">{tag}</span>
            ))}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="mb-0 line-clamp-2 text-[11px] leading-relaxed" style={{ color: 'rgb(var(--faint))' }}>
            {description}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA row */}
        <div
          className="mt-4 flex gap-2 border-t pt-4"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          {onViewMap && (
            <button
              type="button"
              onClick={() => onViewMap(restaurant)}
              className="btn-secondary flex-shrink-0 px-3"
              aria-label={`View map for ${name}`}
            >
              <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
              Map
            </button>
          )}
          <Link
            to={`/restaurants/${_id}`}
            className="btn-secondary flex-1 justify-center px-3 text-center text-xs"
          >
            Details
          </Link>
          <Link
            to={`/booking/${_id}`}
            className="btn-primary-3d flex-1 justify-center px-3 text-center text-xs"
          >
            <span>Book</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
