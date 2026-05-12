import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  Store, CalendarDays, CheckCircle2, XCircle, TrendingUp, MessageSquare,
  Utensils, Tag, Star, Clock, ChevronLeft, QrCode, Users,
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import MenuCMSPanel from '../components/MenuCMSPanel';
import DynamicPricingPanel from '../components/DynamicPricingPanel';
import toast from 'react-hot-toast';

const TABS = [
  ['overview', 'Overview', TrendingUp],
  ['calendar', 'Calendar', CalendarDays],
  ['menu', 'Menu CMS', Utensils],
  ['pricing', 'Dynamic Pricing', Tag],
  ['reviews', 'Reviews', MessageSquare],
  ['checkins', 'Check-ins', QrCode],
];

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] } }),
};

export default function RestaurantOwnerDashboard() {
  const { restaurantId } = useParams();
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingMenu, setSavingMenu] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);
  const [replyDraft, setReplyDraft] = useState({});
  const [replyingId, setReplyingId] = useState(null);

  const fetchDashboard = async () => {
    try {
      const { data: d } = await api.get(`/owner/dashboard/${restaurantId}`);
      setData(d);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, [restaurantId]);

  const saveMenu = async (menu) => {
    setSavingMenu(true);
    try {
      await api.put(`/owner/restaurants/${restaurantId}/menu`, { menu });
      toast.success('Menu saved successfully!');
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save menu');
    } finally {
      setSavingMenu(false);
    }
  };

  const savePricing = async (rules) => {
    setSavingPricing(true);
    try {
      await api.patch(`/owner/restaurants/${restaurantId}/dynamic-pricing`, { rules });
      toast.success('Pricing rules saved!');
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save pricing');
    } finally {
      setSavingPricing(false);
    }
  };

  const submitReply = async (reviewId) => {
    const text = replyDraft[reviewId];
    if (!text?.trim()) return toast.error('Reply cannot be empty');
    try {
      await api.post(`/owner/restaurants/${restaurantId}/reviews/${reviewId}/reply`, { text });
      toast.success('Reply posted!');
      setReplyingId(null);
      setReplyDraft((prev) => ({ ...prev, [reviewId]: '' }));
      fetchDashboard();
    } catch (err) {
      toast.error('Failed to post reply');
    }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoadingSpinner text="Loading dashboard..." /></div>;
  if (!data) return null;

  const { restaurant, stats, peakHours, calendarData, todayBookings, recentBookings, ratingBreakdown } = data;

  // Build calendar grid for current month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = Array.from({ length: firstDay }, () => null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const dateKey = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const todayKey = today.toISOString().split('T')[0];

  const maxBookings = Math.max(...Object.values(calendarData), 1);

  const statCards = [
    { label: 'Total Bookings', value: stats.totalBookings, icon: CalendarDays, color: 'text-amber-300', bg: 'from-amber-500/20 to-amber-500/5' },
    { label: 'Confirmed', value: stats.confirmedBookings, icon: CheckCircle2, color: 'text-emerald-300', bg: 'from-emerald-500/20 to-emerald-500/5' },
    { label: 'Cancelled', value: stats.cancelledBookings, icon: XCircle, color: 'text-rose-300', bg: 'from-rose-500/20 to-rose-500/5' },
    { label: 'Checked In', value: stats.checkedInCount, icon: QrCode, color: 'text-sky-300', bg: 'from-sky-500/20 to-sky-500/5' },
    { label: "Today's Bookings", value: stats.todayBookingCount, icon: Clock, color: 'text-violet-300', bg: 'from-violet-500/20 to-violet-500/5' },
    { label: 'Revenue (Est.)', value: `₹${stats.revenueProxy.toLocaleString()}`, icon: TrendingUp, color: 'text-amber-300', bg: 'from-amber-500/20 to-amber-500/5' },
  ];

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="mb-8">
        <Link to="/dashboard" className="btn-secondary mb-4 inline-flex text-xs">
          <ChevronLeft className="h-3.5 w-3.5" />Back to dashboard
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow mb-3"><Store className="h-3.5 w-3.5" />Restaurant dashboard</span>
            <h1 className="gradient-title mt-3 text-4xl font-black sm:text-5xl">{restaurant.name}</h1>
            <p className="mt-2 text-sm" style={{ color: 'rgb(var(--faint))' }}>{restaurant.area} · {restaurant.priceRange} · ⭐ {restaurant.rating}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 overflow-x-auto">
        <div className="segmented w-max">
          {TABS.map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)} className={`segmented-btn ${tab === id ? 'segmented-btn-active' : ''}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="grid gap-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {statCards.map((c, i) => (
              <motion.div key={c.label} custom={i} variants={cardVariants} initial="hidden" animate="show"
                className="luxury-card-3d relative overflow-hidden p-5">
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${c.bg} opacity-60`} />
                <div className="relative">
                  <c.icon className={`mb-3 h-6 w-6 ${c.color}`} />
                  <p className="text-2xl font-black tabular-nums" style={{ color: 'rgb(var(--text))' }}>{c.value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgb(var(--faint))' }}>{c.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Peak hours chart */}
          <div className="luxury-card-3d p-6">
            <h2 className="mb-5 text-lg font-black" style={{ color: 'rgb(var(--text))' }}>Peak booking hours</h2>
            {peakHours.length === 0 ? (
              <p className="py-8 text-center text-sm" style={{ color: 'rgb(var(--faint))' }}>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={peakHours} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'rgb(18,21,28)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white', fontSize: 12 }}
                    cursor={{ fill: 'rgba(255,181,71,0.08)' }}
                  />
                  <Bar dataKey="count" name="Bookings" fill="rgb(255,181,71)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent bookings */}
          <div className="luxury-card-3d p-6">
            <h2 className="mb-4 text-lg font-black" style={{ color: 'rgb(var(--text))' }}>Recent bookings</h2>
            {recentBookings.length === 0 ? (
              <p className="py-6 text-center text-sm" style={{ color: 'rgb(var(--faint))' }}>No bookings yet</p>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((b) => (
                  <div key={b._id} className="surface-muted flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl" style={{ background: 'rgba(var(--accent),0.12)' }}>
                        <Users className="h-4 w-4" style={{ color: 'rgb(var(--accent))' }} />
                      </span>
                      <div>
                        <p className="font-bold" style={{ color: 'rgb(var(--text))' }}>{b.userId?.name || 'Guest'}</p>
                        <p className="text-xs" style={{ color: 'rgb(var(--faint))' }}>{b.date} · {b.time} · {b.numberOfPeople} pax</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {b.checkedIn && <span className="badge bg-emerald-500/12 text-emerald-200 text-xs">✅ Checked in</span>}
                      <span className={`badge text-xs ${b.status === 'confirmed' ? 'bg-emerald-500/12 text-emerald-200' : b.status === 'cancelled' ? 'bg-rose-500/12 text-rose-200' : 'bg-sky-500/12 text-sky-200'}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Calendar ── */}
      {tab === 'calendar' && (
        <div className="luxury-card-3d p-6">
          <h2 className="mb-2 text-lg font-black" style={{ color: 'rgb(var(--text))' }}>
            {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <p className="mb-6 text-sm" style={{ color: 'rgb(var(--faint))' }}>Booking density for this month. Darker = more bookings.</p>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="pb-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--faint))' }}>{d}</div>
            ))}
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const key = dateKey(day);
              const count = calendarData[key] || 0;
              const intensity = count / maxBookings;
              const isToday = key === todayKey;
              return (
                <div
                  key={key}
                  className="relative flex h-10 items-center justify-center rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: count > 0 ? `rgba(255,181,71,${0.12 + intensity * 0.5})` : 'rgba(var(--surface),0.4)',
                    color: count > 0 ? 'rgb(255,181,71)' : 'rgb(var(--muted))',
                    border: isToday ? '2px solid rgb(255,181,71)' : '1px solid rgba(var(--line),0.06)',
                  }}
                  title={count > 0 ? `${count} booking${count !== 1 ? 's' : ''}` : 'No bookings'}
                >
                  {day}
                  {count > 0 && (
                    <span className="absolute bottom-1 right-1 text-[8px] font-black" style={{ color: 'rgb(255,181,71)' }}>{count}</span>
                  )}
                </div>
              );
            })}
          </div>
          {/* Today's bookings */}
          {todayBookings.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 font-black" style={{ color: 'rgb(var(--text))' }}>Today's bookings ({todayBookings.length})</h3>
              <div className="space-y-2">
                {todayBookings.map((b) => (
                  <div key={b._id} className="surface-muted flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'rgb(var(--text))' }}>{b.userId?.name || 'Guest'}</p>
                      <p className="text-xs" style={{ color: 'rgb(var(--faint))' }}>{b.time} · {b.numberOfPeople} pax · Table #{b.tableId?.tableNumber}</p>
                    </div>
                    <div className="flex gap-2">
                      {b.checkedIn && <span className="badge bg-emerald-500/12 text-emerald-200 text-xs">✅ In</span>}
                      <span className={`badge text-xs ${b.status === 'confirmed' ? 'bg-emerald-500/12 text-emerald-200' : 'bg-rose-500/12 text-rose-200'}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Menu CMS ── */}
      {tab === 'menu' && (
        <div className="luxury-card-3d p-6">
          <h2 className="mb-2 text-lg font-black" style={{ color: 'rgb(var(--text))' }}>Menu management</h2>
          <p className="mb-6 text-sm" style={{ color: 'rgb(var(--faint))' }}>Add, edit, or remove items. Changes apply instantly after saving.</p>
          <MenuCMSPanel menu={restaurant.menu || []} onSave={saveMenu} saving={savingMenu} />
        </div>
      )}

      {/* ── Dynamic Pricing ── */}
      {tab === 'pricing' && (
        <div className="luxury-card-3d p-6">
          <h2 className="mb-2 text-lg font-black" style={{ color: 'rgb(var(--text))' }}>Dynamic pricing rules</h2>
          <p className="mb-6 text-sm" style={{ color: 'rgb(var(--faint))' }}>
            Set time-based discounts or surcharges. These will be shown to customers when browsing your restaurant.
          </p>
          <DynamicPricingPanel
            rules={restaurant.dynamicPricing || []}
            basePrice={restaurant.avgCostForTwo || 0}
            onSave={savePricing}
            saving={savingPricing}
          />
        </div>
      )}

      {/* ── Reviews ── */}
      {tab === 'reviews' && (
        <div className="luxury-card-3d p-6">
          <h2 className="mb-2 text-lg font-black" style={{ color: 'rgb(var(--text))' }}>Customer reviews</h2>
          <div className="mb-6 flex flex-wrap gap-4">
            {Object.entries(ratingBreakdown).sort(([a], [b]) => Number(b) - Number(a)).map(([rating, count]) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: 'rgb(var(--accent))' }}>{'⭐'.repeat(Number(rating))}</span>
                <span className="text-sm" style={{ color: 'rgb(var(--muted))' }}>{count}</span>
              </div>
            ))}
          </div>
          {(restaurant.reviews || []).length === 0 ? (
            <p className="py-10 text-center text-sm" style={{ color: 'rgb(var(--faint))' }}>No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {(restaurant.reviews || []).map((review) => (
                <div key={review._id} className="surface-muted p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black" style={{ color: 'rgb(var(--text))' }}>{review.userName}</p>
                      <div className="mt-0.5 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                        ))}
                        <span className="ml-1 text-xs" style={{ color: 'rgb(var(--faint))' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className="text-lg font-black" style={{ color: 'rgb(var(--accent))' }}>{review.rating}/5</span>
                  </div>
                  {review.comment && <p className="mt-3 text-sm leading-6" style={{ color: 'rgb(var(--muted))' }}>{review.comment}</p>}

                  {/* Existing reply */}
                  {review.reply?.text && (
                    <div className="mt-4 rounded-xl p-4" style={{ background: 'rgba(var(--accent),0.07)', borderLeft: '3px solid rgb(255,181,71)' }}>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--accent))' }}>
                        Owner reply · {new Date(review.reply.repliedAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm" style={{ color: 'rgb(var(--text))' }}>{review.reply.text}</p>
                    </div>
                  )}

                  {/* Reply form */}
                  {replyingId === review._id ? (
                    <div className="mt-4">
                      <textarea
                        className="input"
                        rows={3}
                        placeholder="Write your reply to this review..."
                        value={replyDraft[review._id] || ''}
                        onChange={(e) => setReplyDraft((prev) => ({ ...prev, [review._id]: e.target.value }))}
                      />
                      <div className="mt-2 flex gap-2">
                        <button type="button" onClick={() => setReplyingId(null)} className="btn-secondary flex-1 text-xs">Cancel</button>
                        <button type="button" onClick={() => submitReply(review._id)} className="btn-primary flex-1 text-xs">Post reply</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setReplyingId(review._id)}
                      className="btn-secondary mt-3 text-xs"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {review.reply?.text ? 'Edit reply' : 'Reply to review'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Check-ins ── */}
      {tab === 'checkins' && (
        <div className="luxury-card-3d p-6">
          <h2 className="mb-2 text-lg font-black" style={{ color: 'rgb(var(--text))' }}>Check-in tracker</h2>
          <p className="mb-6 text-sm" style={{ color: 'rgb(var(--faint))' }}>All bookings with their check-in status. Customers scan their QR code at arrival.</p>
          {recentBookings.length === 0 ? (
            <p className="py-10 text-center text-sm" style={{ color: 'rgb(var(--faint))' }}>No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b) => (
                <div key={b._id} className="surface-muted flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ${b.checkedIn ? 'bg-emerald-500/12 text-emerald-300' : 'bg-amber-500/12 text-amber-300'}`}>
                      {b.checkedIn ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    </span>
                    <div>
                      <p className="font-bold" style={{ color: 'rgb(var(--text))' }}>{b.userId?.name || 'Guest'}</p>
                      <p className="text-xs" style={{ color: 'rgb(var(--faint))' }}>{b.date} · {b.time} · {b.numberOfPeople} pax</p>
                      {b.checkedIn && b.checkInTime && (
                        <p className="text-xs text-emerald-400">Checked in at {new Date(b.checkInTime).toLocaleTimeString()}</p>
                      )}
                    </div>
                  </div>
                  <span className={`badge text-xs ${b.checkedIn ? 'bg-emerald-500/12 text-emerald-200' : 'bg-amber-500/12 text-amber-200'}`}>
                    {b.checkedIn ? '✅ Arrived' : '⏳ Expected'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
