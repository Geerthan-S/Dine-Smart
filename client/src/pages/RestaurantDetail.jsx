import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, Heart, MapPin, Star, Utensils,
  ChefHat, Clock, Leaf, MessageSquare, ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import RestaurantCard from '../components/RestaurantCard';

const RATING_FIELDS = ['rating', 'ambience', 'food', 'service', 'value'];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] } },
};

function StarRating({ value, onChange, field }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(field, n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className="p-0.5 transition-transform duration-150 hover:scale-125"
        >
          <Star
            className="h-5 w-5 transition-colors duration-180"
            style={{
              color: n <= value ? 'rgb(var(--accent))' : 'rgba(var(--faint),0.35)',
              fill: n <= value ? 'rgb(var(--accent))' : 'none',
            }}
          />
        </button>
      ))}
    </div>
  );
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState({ rating: 5, ambience: 5, food: 5, service: 5, value: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/restaurants/${id}`);
        setRestaurant(data);
        const cuisine = Array.isArray(data.cuisine) ? data.cuisine[0] : data.cuisine;
        const related = await api.get('/restaurants', { params: { cuisine } });
        setSimilar(related.data.filter((r) => r._id !== id).slice(0, 3));
        const viewed = JSON.parse(localStorage.getItem('recentRestaurants') || '[]').filter((r) => r._id !== data._id);
        localStorage.setItem(
          'recentRestaurants',
          JSON.stringify([{ _id: data._id, name: data.name, area: data.area, rating: data.rating }, ...viewed].slice(0, 6))
        );
      } catch {
        toast.error('Could not load restaurant');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const cuisineText = useMemo(
    () => (Array.isArray(restaurant?.cuisine) ? restaurant.cuisine.join(' · ') : restaurant?.cuisine),
    [restaurant]
  );

  const handleRatingChange = (field, val) => setReview((prev) => ({ ...prev, [field]: val }));

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const { data } = await api.post(`/restaurants/${id}/reviews`, review);
      setRestaurant(data);
      setReview({ rating: 5, ambience: 5, food: 5, service: 5, value: 5, comment: '' });
      toast.success('Review posted!');
    } catch {
      toast.error('Could not add review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      await api.post(`/restaurants/${id}/favorite`);
      toast.success('Saved preference updated');
    } catch {
      toast.error('Could not update saved restaurant');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner text="Loading restaurant..." />
      </div>
    );
  }
  if (!restaurant) return null;

  const cuisineList = Array.isArray(restaurant.cuisine) ? restaurant.cuisine : [];

  return (
    <div className="page-shell">
      {/* ── Hero Card ────────────────────────────────────────── */}
      <motion.section
        variants={stagger}
        initial="hidden"
        animate="show"
        className="luxury-card-3d animated-border mb-8 overflow-hidden"
      >
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_0.82fr]">
          {/* Left: Info */}
          <motion.div variants={fadeUp}>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="eyebrow">
                {restaurant.featured ? '✦ Featured' : 'Restaurant profile'}
              </span>
              {restaurant.isVeg !== undefined && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                    restaurant.isVeg
                      ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-rose-400/30 bg-rose-500/10 text-rose-300'
                  }`}
                >
                  <Leaf className="h-3 w-3" aria-hidden="true" />
                  {restaurant.isVeg ? 'Pure Veg' : 'Non-Veg'}
                </span>
              )}
            </div>

            <h1 className="gradient-title text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              {restaurant.name}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: 'rgb(var(--muted))' }}>
              {restaurant.description || 'Curated restaurant profile with booking-ready dining information.'}
            </p>

            {/* Ambience / tag pills */}
            {((restaurant.ambienceTags?.length ? restaurant.ambienceTags : restaurant.tags) || []).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {((restaurant.ambienceTags?.length ? restaurant.ambienceTags : restaurant.tags) || [])
                  .slice(0, 8)
                  .map((tag) => (
                    <span key={tag} className="match-chip rounded-full px-3 py-1 text-xs font-bold">
                      {tag}
                    </span>
                  ))}
              </div>
            )}

            {/* Cuisine */}
            {cuisineList.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {cuisineList.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                    style={{ borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.05)', color: 'rgb(var(--muted))' }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}

            {/* Meta row */}
            <div className="mt-5 space-y-1.5">
              {restaurant.address && (
                <p className="flex items-center gap-1.5 text-xs" style={{ color: 'rgb(var(--faint))' }}>
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {restaurant.address}
                </p>
              )}
              {restaurant.openingHours && (
                <p className="flex items-center gap-1.5 text-xs" style={{ color: 'rgb(var(--faint))' }}>
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {restaurant.openingHours}
                </p>
              )}
            </div>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to={`/booking/${restaurant._id}`}
                id="detail-reserve-btn"
                className="btn-primary-3d px-6"
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                Reserve table
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={toggleFavorite}
                className="btn-secondary px-5"
              >
                <Heart className="h-4 w-4" aria-hidden="true" />
                Save
              </button>
            </div>
          </motion.div>

          {/* Right: Decorative image panel */}
          <motion.div
            variants={fadeUp}
            className="restaurant-placeholder relative min-h-[260px] overflow-hidden rounded-[1.25rem]"
            style={{ minHeight: '280px' }}
          >
            {/* Glow */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background: 'radial-gradient(circle at 30% 70%, rgba(255,181,71,0.38), transparent 60%)',
              }}
              aria-hidden="true"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'rgb(var(--accent))' }}>
                {cuisineText}
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {restaurant.area}, {restaurant.city}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── Info + Reviews ────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        {/* Dining intelligence */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.46, delay: 0.12 }}
          className="luxury-card-3d p-5 sm:p-6"
        >
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black" style={{ color: 'rgb(var(--text))' }}>
            <ChefHat className="h-5 w-5" style={{ color: 'rgb(var(--accent))' }} aria-hidden="true" />
            Dining intelligence
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Rating',      value: Number(restaurant.rating || 0).toFixed(1), accent: true },
              { label: 'Reviews',     value: Number(restaurant.numReviews || 0).toLocaleString() },
              { label: 'Cost for two',value: `₹${restaurant.avgCostForTwo || 0}` },
              { label: 'Price range', value: restaurant.priceRange || '—' },
            ].map(({ label, value, accent }) => (
              <div key={label} className="metric-tile">
                <p className="mb-1 text-[11px]" style={{ color: 'rgb(var(--faint))' }}>{label}</p>
                <p
                  className="text-lg font-black"
                  style={{ color: accent ? 'rgb(var(--accent))' : 'rgb(var(--text))' }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Menu */}
          <h3 className="mb-3 mt-6 flex items-center gap-2 text-sm font-black" style={{ color: 'rgb(var(--text))' }}>
            <Utensils className="h-4 w-4" style={{ color: 'rgb(var(--accent))' }} aria-hidden="true" />
            Menu highlights
          </h3>
          <div className="space-y-1.5">
            {(restaurant.menu || []).slice(0, 8).map((item, i) => (
              <motion.div
                key={`${item.name}-${item.price}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.32, delay: 0.24 + i * 0.04 }}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs"
                style={{
                  background: 'rgba(var(--surface),0.5)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span style={{ color: 'rgb(var(--muted))' }}>{item.name}</span>
                <b style={{ color: 'rgb(var(--accent))' }}>₹{item.price}</b>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Reviews */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.46, delay: 0.18 }}
          className="luxury-card-3d p-5 sm:p-6"
        >
          <h2 className="mb-5 flex items-center gap-2 text-lg font-black" style={{ color: 'rgb(var(--text))' }}>
            <MessageSquare className="h-5 w-5" style={{ color: 'rgb(var(--accent))' }} aria-hidden="true" />
            Reviews
          </h2>

          {/* Review form */}
          <form onSubmit={submitReview} className="mb-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {RATING_FIELDS.slice(0, 3).map((field) => (
                <div key={field}>
                  <label
                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.13em]"
                    style={{ color: 'rgb(var(--faint))' }}
                  >
                    {field}
                  </label>
                  <StarRating
                    value={review[field]}
                    onChange={handleRatingChange}
                    field={field}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {RATING_FIELDS.slice(3).map((field) => (
                <div key={field}>
                  <label
                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.13em]"
                    style={{ color: 'rgb(var(--faint))' }}
                  >
                    {field}
                  </label>
                  <StarRating
                    value={review[field]}
                    onChange={handleRatingChange}
                    field={field}
                  />
                </div>
              ))}
            </div>

            <textarea
              className="input-3d w-full min-h-[80px] resize-none"
              rows={3}
              placeholder="Share a useful note for other diners..."
              value={review.comment}
              onChange={(e) => setReview({ ...review, comment: e.target.value })}
              aria-label="Review comment"
            />

            <button
              type="submit"
              disabled={submittingReview}
              className="btn-primary-3d px-6"
              aria-busy={submittingReview}
            >
              {submittingReview ? <LoadingSpinner size="sm" /> : (
                <>
                  <Star className="h-4 w-4" aria-hidden="true" />
                  Post review
                </>
              )}
            </button>
          </form>

          {/* Review list */}
          <div className="space-y-3">
            <AnimatePresence>
              {(restaurant.reviews || []).slice().reverse().slice(0, 6).map((item, i) => (
                <motion.div
                  key={item._id || item.createdAt}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.36, delay: i * 0.05 }}
                  className="surface-muted rounded-xl p-4"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-black" style={{ color: 'rgb(var(--text))' }}>
                      {item.userName}
                    </p>
                    <span
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
                      style={{ background: 'rgba(var(--accent),0.14)', color: 'rgb(var(--accent))' }}
                    >
                      <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                      {item.rating}/5
                    </span>
                  </div>
                  <p className="text-xs leading-6" style={{ color: 'rgb(var(--muted))' }}>
                    {item.comment || 'No written comment.'}
                  </p>

                  {/* Owner reply block */}
                  {item.reply?.text && (
                    <div
                      className="mt-3 rounded-xl p-3"
                      style={{
                        background: 'rgba(var(--accent),0.07)',
                        borderLeft: '3px solid rgb(255,181,71)',
                      }}
                    >
                      <p
                        className="mb-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: 'rgb(var(--accent))' }}
                      >
                        🏷️ {item.reply.repliedBy || 'Owner'} replied
                        {item.reply.repliedAt && (
                          <span className="ml-2 font-normal normal-case" style={{ color: 'rgb(var(--faint))' }}>
                            · {new Date(item.reply.repliedAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                      <p className="text-xs leading-5" style={{ color: 'rgb(var(--text))' }}>
                        {item.reply.text}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {(restaurant.reviews || []).length === 0 && (
              <p className="text-sm" style={{ color: 'rgb(var(--faint))' }}>
                No reviews yet. Be the first to share your experience!
              </p>
            )}
          </div>
        </motion.section>
      </div>

      {/* ── Similar Restaurants ───────────────────────────── */}
      {similar.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.48 }}
          className="mt-10"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-black" style={{ color: 'rgb(var(--text))' }}>Similar restaurants</h2>
            <Link to="/restaurants" className="btn-secondary px-4 text-xs">
              View all
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {similar.map((r) => (
              <RestaurantCard key={r._id} restaurant={r} />
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
