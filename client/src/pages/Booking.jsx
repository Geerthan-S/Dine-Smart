import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  CalendarCheck, Clock, Star, UsersRound, Utensils,
  MapPin, ChefHat, Leaf, ArrowRight, CheckCircle2, Table2,
} from 'lucide-react';

const timeSlots = [
  { label: '12:00', period: 'Lunch' },
  { label: '13:00', period: 'Lunch' },
  { label: '14:00', period: 'Afternoon' },
  { label: '18:00', period: 'Dinner' },
  { label: '19:00', period: 'Dinner' },
  { label: '20:00', period: 'Dinner' },
  { label: '21:00', period: 'Evening' },
  { label: '22:00', period: 'Late' },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.46, ease: [0.16, 1, 0.3, 1] } },
};

export default function Booking() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({ date: '', time: '', numberOfPeople: 2, tableId: '' });
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [loadingTables, setLoadingTables] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const { data } = await api.get(`/restaurants/${restaurantId}`);
        setRestaurant(data);
      } catch {
        toast.error('Restaurant not found');
        navigate('/restaurants');
      } finally {
        setLoadingRestaurant(false);
      }
    };
    fetchRestaurant();
  }, [restaurantId, navigate]);

  const fetchAvailableTables = async () => {
    if (!form.date || !form.time || !form.numberOfPeople) return;
    setLoadingTables(true);
    setForm((prev) => ({ ...prev, tableId: '' }));
    try {
      const { data } = await api.get(`/tables/available/${restaurantId}`, {
        params: { date: form.date, time: form.time, numberOfPeople: form.numberOfPeople },
      });
      setTables(data);
      if (data.length === 0) toast('No tables available for this slot', { icon: 'ℹ️' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch available tables');
    } finally {
      setLoadingTables(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCheckAvailability = (e) => {
    e.preventDefault();
    if (!form.date || !form.time || !form.numberOfPeople) {
      toast.error('Please fill date, time, and number of people first');
      return;
    }
    fetchAvailableTables();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tableId) { toast.error('Please select a table'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post('/bookings', {
        restaurantId,
        tableId: form.tableId,
        date: form.date,
        time: form.time,
        numberOfPeople: Number(form.numberOfPeople),
      });
      toast.success('Table booked successfully!');
      navigate(`/booking-confirmation/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const cuisineList = Array.isArray(restaurant?.cuisine) ? restaurant.cuisine : [];
  const menuPreview = Array.isArray(restaurant?.menu) ? restaurant.menu.slice(0, 8) : [];
  const tableCapacity = useMemo(() => {
    if (!restaurant?.tables) return { total: 0, max: 0 };
    return restaurant.tables.reduce(
      (s, t) => ({ total: s.total + (Number(t.count) || 0), max: Math.max(s.max, Number(t.capacity) || 0) }),
      { total: 0, max: 0 }
    );
  }, [restaurant]);

  // Step tracking
  const step1Done = !!form.date && !!form.time && !!form.numberOfPeople;
  const step2Done = tables.length > 0;
  const step3Done = !!form.tableId;

  if (loadingRestaurant) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner text="Loading restaurant..." />
      </div>
    );
  }

  return (
    <div className="page-shell max-w-6xl">
      {/* ── Restaurant Overview ──────────────────────────────── */}
      {restaurant && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]"
        >
          {/* Main info */}
          <motion.section variants={fadeUp} className="luxury-card-3d animated-border p-6 sm:p-8">
            {/* Top row */}
            <div className="mb-5 flex flex-wrap items-start gap-3">
              <span className="eyebrow">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {restaurant.area}, {restaurant.city}
              </span>
              <span
                className={`ml-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                  restaurant.isVeg
                    ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-rose-400/30 bg-rose-500/10 text-rose-300'
                }`}
              >
                <Leaf className="h-3 w-3" aria-hidden="true" />
                {restaurant.isVeg ? 'Pure Veg' : 'Non-Veg'}
              </span>
            </div>

            <h1 className="gradient-title text-4xl font-black leading-tight sm:text-5xl">
              {restaurant.name}
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7" style={{ color: 'rgb(var(--muted))' }}>
              {restaurant.description}
            </p>

            {/* Cuisine tags */}
            {cuisineList.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {cuisineList.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      borderColor: 'rgba(255,255,255,0.10)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'rgb(var(--muted))',
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}

            {/* Stats grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Rating', value: Number(restaurant.rating || 0).toFixed(1), icon: Star, accent: true },
                { label: 'Reviews', value: Number(restaurant.numReviews || 0).toLocaleString(), icon: UsersRound },
                { label: 'Cost for two', value: `₹${restaurant.avgCostForTwo || 0}`, icon: Utensils },
                { label: 'Tables', value: tableCapacity.total || '—', icon: CalendarCheck },
              ].map(({ label, value, icon: Icon, accent }) => (
                <div key={label} className="metric-tile text-center">
                  <p className="mb-1.5 flex items-center justify-center gap-1 text-xs" style={{ color: 'rgb(var(--faint))' }}>
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {label}
                  </p>
                  <p
                    className="text-lg font-black"
                    style={{ color: accent ? 'rgb(var(--accent))' : 'rgb(var(--text))' }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Address / hours */}
            <div className="mt-5 space-y-1.5 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <p className="flex items-center gap-1.5 text-xs" style={{ color: 'rgb(var(--faint))' }}>
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                {restaurant.address}
              </p>
              <p className="flex items-center gap-1.5 text-xs" style={{ color: 'rgb(var(--faint))' }}>
                <Clock className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                {restaurant.openingHours}
              </p>
            </div>
          </motion.section>

          {/* Menu highlights */}
          <motion.aside variants={fadeUp} className="luxury-card-3d p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black" style={{ color: 'rgb(var(--text))' }}>
              <ChefHat className="h-5 w-5" style={{ color: 'rgb(var(--accent))' }} aria-hidden="true" />
              Menu highlights
            </h2>
            <div className="space-y-1">
              {menuPreview.length === 0 && (
                <p className="text-sm" style={{ color: 'rgb(var(--faint))' }}>Menu details not available.</p>
              )}
              {menuPreview.map((item, i) => (
                <motion.div
                  key={`${item.name}-${item.price}`}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.36, delay: 0.15 + i * 0.04 }}
                  className="flex items-start justify-between gap-4 rounded-xl px-3 py-2.5 transition-colors duration-200"
                  style={{
                    borderBottom: i < menuPreview.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(var(--surface-raised),0.5)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'rgb(var(--text))' }}>{item.name}</p>
                    <p className="text-[11px]" style={{ color: 'rgb(var(--faint))' }}>
                      {item.category} · {item.isVeg ? 'Veg' : 'Non-veg'}
                    </p>
                  </div>
                  <p className="flex-shrink-0 text-sm font-bold" style={{ color: 'rgb(var(--accent))' }}>
                    ₹{item.price}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.aside>
        </motion.div>
      )}

      {/* ── Booking Form ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.56, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="luxury-card-3d animated-border mx-auto max-w-3xl"
      >
        {/* Header */}
        <div className="border-b px-6 pb-5 pt-6 sm:px-8" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black" style={{ color: 'rgb(var(--text))' }}>
                Reserve a table
              </h2>
              <p className="mt-1 text-sm" style={{ color: 'rgb(var(--muted))' }}>
                {tableCapacity.max
                  ? `Groups up to ${tableCapacity.max} guests supported.`
                  : 'Check live availability for your slot.'}
              </p>
            </div>

            {/* Step indicators */}
            <div className="flex flex-wrap items-center gap-3">
              {[
                { n: 1, label: 'Details', done: step1Done },
                { n: 2, label: 'Tables', done: step2Done },
                { n: 3, label: 'Confirm', done: step3Done },
              ].map(({ n, label, done }, i, arr) => (
                <div key={n} className="flex items-center gap-2">
                  <div
                    className={`booking-step ${done ? 'booking-step-active' : ''}`}
                  >
                    <span className="booking-step-dot" />
                    <span>
                      {n}. {label}
                    </span>
                    {done && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
                  </div>
                  {i < arr.length - 1 && (
                    <span className="hidden text-xs sm:inline" style={{ color: 'rgba(var(--faint),0.5)' }}>›</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7 p-6 sm:p-8">
          {/* Date + Guests */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Date */}
            <div>
              <label className="label" htmlFor="date">Dining date</label>
              <input
                id="date"
                name="date"
                type="date"
                min={today}
                className="input-3d w-full"
                value={form.date}
                onChange={handleChange}
                required
                aria-required="true"
              />
            </div>

            {/* Guests */}
            <div>
              <label className="label" htmlFor="numberOfPeople">Number of guests</label>
              <input
                id="numberOfPeople"
                name="numberOfPeople"
                type="number"
                min="1"
                max="20"
                className="input-3d w-full"
                value={form.numberOfPeople}
                onChange={handleChange}
                required
                aria-required="true"
              />
            </div>
          </div>

          {/* Time slots */}
          <div>
            <label className="label">Dining timeline</label>
            <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
              {timeSlots.map(({ label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setForm({ ...form, time: label })}
                  aria-pressed={form.time === label}
                  className={`time-slot ${form.time === label ? 'time-slot-active' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {form.time && (
              <p className="mt-2 text-xs" style={{ color: 'rgb(var(--accent))' }}>
                ✓ Selected: {form.time} · {timeSlots.find((t) => t.label === form.time)?.period}
              </p>
            )}
          </div>

          {/* Check availability */}
          <button
            id="check-availability-btn"
            type="button"
            onClick={handleCheckAvailability}
            disabled={loadingTables || !form.date || !form.time}
            className="btn-secondary w-full"
            aria-busy={loadingTables}
          >
            {loadingTables ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Table2 className="h-4 w-4" aria-hidden="true" />
                Check Available Tables
              </>
            )}
          </button>

          {/* Table selector */}
          <AnimatePresence>
            {tables.length > 0 && (
              <motion.div
                key="tables"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
              >
                <label className="label mb-3">Select a table</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {tables.map((table) => (
                    <button
                      key={table._id}
                      type="button"
                      onClick={() => setForm({ ...form, tableId: table._id })}
                      aria-pressed={form.tableId === table._id}
                      className={`table-seat-card ${form.tableId === table._id ? 'table-seat-card-active' : ''}`}
                    >
                      <Table2
                        className="h-5 w-5"
                        aria-hidden="true"
                        style={{
                          color: form.tableId === table._id
                            ? 'rgb(var(--accent))'
                            : 'rgba(var(--muted),0.7)',
                        }}
                      />
                      <span className="mt-1 font-black" style={{ color: form.tableId === table._id ? 'rgb(var(--accent))' : 'rgb(var(--text))' }}>
                        Table {table.tableNumber}
                      </span>
                      <span className="text-[11px]" style={{ color: 'rgb(var(--faint))' }}>
                        Seats {table.capacity}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirm */}
          <button
            id="confirm-booking-btn"
            type="submit"
            disabled={submitting || !form.tableId}
            className="btn-primary-3d w-full py-3.5 text-base flex items-center justify-center gap-2"
            aria-busy={submitting}
          >
            {submitting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <span>Confirm Reservation</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>

          {form.tableId && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs"
              style={{ color: 'rgb(var(--faint))' }}
            >
              By confirming you agree to the restaurant's cancellation policy.
            </motion.p>
          )}
        </form>
      </motion.div>
    </div>
  );
}
