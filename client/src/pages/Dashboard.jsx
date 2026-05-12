import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, CalendarCheck, CalendarDays, CheckCircle2, Shield, Store, XCircle, TrendingUp, Clock } from 'lucide-react';
import api from '../services/api';
import { getUser, isAdmin } from '../services/auth';
import LoadingSpinner from '../components/LoadingSpinner';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.42, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] } }),
};

export default function Dashboard() {
  const user = getUser();
  const [stats, setStats] = useState({ bookings: 0, confirmed: 0, cancelled: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/bookings/my');
        const confirmed = data.filter((b) => b.status === 'confirmed').length;
        const cancelled = data.filter((b) => b.status === 'cancelled').length;
        setStats({ bookings: data.length, confirmed, cancelled });
        setRecentBookings(data.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: 'Total Bookings',
      value: stats.bookings,
      icon: CalendarDays,
      gradient: 'from-amber-500/20 to-amber-500/5',
      iconColor: 'text-amber-300',
      glow: 'rgba(251,191,36,0.18)',
    },
    {
      label: 'Confirmed',
      value: stats.confirmed,
      icon: CheckCircle2,
      gradient: 'from-emerald-500/20 to-emerald-500/5',
      iconColor: 'text-emerald-300',
      glow: 'rgba(52,211,153,0.18)',
    },
    {
      label: 'Cancelled',
      value: stats.cancelled,
      icon: XCircle,
      gradient: 'from-rose-500/20 to-rose-500/5',
      iconColor: 'text-rose-300',
      glow: 'rgba(251,113,133,0.18)',
    },
  ];

  const quickLinks = [
    {
      label: 'Ask AI',
      desc: 'Get personalized dining suggestions',
      to: '/ai-chat',
      icon: Bot,
      accent: 'text-violet-300',
      bg: 'from-violet-500/20 to-violet-500/5',
    },
    {
      label: 'Restaurants',
      desc: 'Browse the full Chennai catalog',
      to: '/restaurants',
      icon: Store,
      accent: 'text-sky-300',
      bg: 'from-sky-500/20 to-sky-500/5',
    },
    {
      label: 'My Bookings',
      desc: 'View and manage all reservations',
      to: '/my-bookings',
      icon: CalendarCheck,
      accent: 'text-amber-300',
      bg: 'from-amber-500/20 to-amber-500/5',
    },
    ...(isAdmin()
      ? [{
          label: 'Admin Panel',
          desc: 'Manage restaurants and data',
          to: '/admin',
          icon: Shield,
          accent: 'text-rose-300',
          bg: 'from-rose-500/20 to-rose-500/5',
        }]
      : []),
  ];

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-shell">
      {/* ── Header ── */}
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="eyebrow mb-4">
            <Clock className="h-3.5 w-3.5" />
            Dining command center
          </span>
          <h1 className="gradient-title mt-3 text-4xl font-black sm:text-5xl">
            {greeting}, {firstName} 👋
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7" style={{ color: 'rgb(var(--muted))' }}>
            Your reservations, AI recommendations, and next dining move — all in one place.
          </p>
        </div>
        <Link
          to="/ai-chat"
          id="dashboard-ai-cta"
          className="btn-primary-3d self-start lg:self-auto"
          aria-label="Find a table with AI"
        >
          <Bot className="h-4 w-4" aria-hidden="true" />
          Find a table
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      {loading ? (
        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {statCards.map((c, i) => (
            <motion.div
              key={c.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="show"
              className="luxury-card-3d hover-lift relative overflow-hidden p-6"
            >
              {/* Background gradient accent */}
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-60`} aria-hidden="true" />
              <div className="relative flex items-center gap-4">
                <span
                  className={`grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-white/8 ${c.iconColor}`}
                  style={{ boxShadow: `0 8px 24px ${c.glow}` }}
                >
                  <c.icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--faint))' }}>{c.label}</p>
                  <p className="mt-1 text-4xl font-black tabular-nums" style={{ color: 'rgb(var(--text))' }}>{c.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-black" style={{ color: 'rgb(var(--text))' }}>Quick actions</h2>
      </div>
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((q, i) => (
          <motion.div
            key={q.to}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="show"
          >
            <Link
              to={q.to}
              id={`quick-link-${q.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="luxury-card-3d hover-lift group relative block h-full overflow-hidden p-5 sm:p-6"
              aria-label={q.label}
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${q.bg} opacity-50 transition-opacity duration-300 group-hover:opacity-80`} aria-hidden="true" />
              <div className="relative">
                <span className={`mb-4 inline-grid h-12 w-12 place-items-center rounded-2xl bg-white/8 ${q.accent}`}>
                  <q.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="mb-1 text-base font-black" style={{ color: 'rgb(var(--text))' }}>{q.label}</p>
                <p className="text-sm leading-6" style={{ color: 'rgb(var(--faint))' }}>{q.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── Recent Bookings ── */}
      {recentBookings.length > 0 && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black" style={{ color: 'rgb(var(--text))' }}>Recent bookings</h2>
            <Link
              to="/my-bookings"
              id="view-all-bookings-link"
              className="text-sm font-bold transition-colors"
              style={{ color: 'rgb(var(--accent))' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(var(--accent-hover))'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(var(--accent))'}
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentBookings.map((b, i) => (
              <motion.div
                key={b._id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="show"
                className="surface-muted flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl" style={{ background: 'rgba(var(--accent),0.12)' }}>
                    <CalendarDays className="h-5 w-5" style={{ color: 'rgb(var(--accent))' }} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-bold" style={{ color: 'rgb(var(--text))' }}>{b.restaurantId?.name || 'Restaurant'}</p>
                    <p className="mt-0.5 text-xs" style={{ color: 'rgb(var(--faint))' }}>
                      {b.date} · {b.time} · {b.numberOfPeople} {b.numberOfPeople === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                </div>
                <span
                  className={`badge self-start sm:self-auto ${
                    b.status === 'confirmed'
                      ? 'border-emerald-400/24 bg-emerald-500/12 text-emerald-200'
                      : b.status === 'cancelled'
                      ? 'border-rose-400/24 bg-rose-500/12 text-rose-200'
                      : 'border-amber-400/24 bg-amber-500/12 text-amber-200'
                  }`}
                >
                  {b.status}
                </span>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* ── Empty state when no bookings ── */}
      {!loading && recentBookings.length === 0 && (
        <div className="luxury-card-3d flex flex-col items-center py-16 text-center">
          <span className="mb-4 grid h-16 w-16 place-items-center rounded-3xl" style={{ background: 'rgba(var(--accent),0.12)' }}>
            <CalendarCheck className="h-8 w-8" style={{ color: 'rgb(var(--accent))' }} aria-hidden="true" />
          </span>
          <h3 className="mb-2 text-lg font-black" style={{ color: 'rgb(var(--text))' }}>No bookings yet</h3>
          <p className="mb-6 max-w-xs text-sm" style={{ color: 'rgb(var(--faint))' }}>
            Discover Chennai's best restaurants and make your first reservation.
          </p>
          <Link to="/restaurants" id="empty-browse-btn" className="btn-primary-3d">
            <Store className="h-4 w-4" aria-hidden="true" />
            Browse restaurants
          </Link>
        </div>
      )}
    </div>
  );
}
