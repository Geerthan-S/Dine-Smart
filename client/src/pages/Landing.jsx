import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  ArrowRight, Bot, CalendarCheck, LockKeyhole,
  MapPinned, Search, Sparkles, Star, Utensils,
  ChefHat, Wine, Clock,
} from 'lucide-react';
import { isAuthenticated } from '../services/auth';

const features = [
  {
    icon: Bot,
    title: 'AI Concierge',
    desc: 'Describe the mood, craving, or budget — get curated matches in seconds.',
    color: 'from-violet-500/20 to-violet-500/5',
    iconColor: 'text-violet-300',
  },
  {
    icon: CalendarCheck,
    title: 'Instant Booking',
    desc: 'Real-time table availability. Reserve without a single phone call.',
    color: 'from-amber-500/20 to-amber-500/5',
    iconColor: 'text-amber-300',
  },
  {
    icon: LockKeyhole,
    title: 'Conflict-Free',
    desc: 'Smart reservation logic prevents overlapping bookings automatically.',
    color: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-emerald-300',
  },
  {
    icon: MapPinned,
    title: 'Chennai-Aware',
    desc: 'Every area, every cuisine style, every price point. All in one place.',
    color: 'from-sky-500/20 to-sky-500/5',
    iconColor: 'text-sky-300',
  },
];

const stats = [
  { value: '120+', label: 'Curated restaurants', icon: ChefHat },
  { value: '40+', label: 'Cuisine styles', icon: Utensils },
  { value: '4.3★', label: 'Average rating', icon: Star },
];

const aiCards = [
  { name: 'Coastline Table', meta: 'Seafood · ECR', rating: '4.8', tags: ['Mood match', 'Budget fit'] },
  { name: 'The Bay Lantern', meta: 'Asian fusion · Besant Nagar', rating: '4.6', tags: ['Top rated', 'Romantic'] },
  { name: 'Madras Ember', meta: 'Modern Indian · Alwarpet', rating: '4.7', tags: ['Trending', 'Chef pick'] },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.16, 1, 0.3, 1] } },
};

export default function Landing() {
  const loggedIn = isAuthenticated();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="overflow-hidden">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="page-shell relative min-h-[calc(100vh-4rem)] flex items-center">

        <div className="relative z-10 grid w-full min-h-[calc(100vh-9rem)] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: Copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.span variants={itemVariants}>
              <span className="eyebrow mb-6">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                AI-powered dining concierge
              </span>
            </motion.span>

            <motion.h1
              variants={itemVariants}
              className="hero-shimmer mt-4 max-w-3xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.5rem]"
            >
              Find the right table for the night you have in mind.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 max-w-xl text-lg leading-8"
              style={{ color: 'rgb(var(--muted))' }}
            >
              DineSmart turns a natural-language craving into curated options, real table
              availability, and a polished booking flow — in seconds.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-9 flex flex-wrap gap-3">
              <Link
                to={loggedIn ? '/ai-chat' : '/signup'}
                id="hero-primary-cta"
                className="btn-primary-3d animated-border px-7 py-3 text-sm flex items-center gap-2"
              >
                <span>{loggedIn ? 'Ask AI for a match' : 'Start dining smarter'}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to={loggedIn ? '/restaurants' : '/login'}
                id="hero-secondary-cta"
                className="btn-secondary px-7 py-3 text-sm"
              >
                {loggedIn ? 'Browse restaurants' : 'Sign in'}
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="mt-12 grid max-w-lg grid-cols-3 gap-3">
              {stats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="stat-orb">
                  <Icon className="mb-1 h-4 w-4" style={{ color: 'rgb(var(--accent))' }} aria-hidden="true" />
                  <p className="text-2xl font-black" style={{ color: 'rgb(var(--text))' }}>{value}</p>
                  <p className="mt-0.5 text-[11px] font-semibold tracking-wide" style={{ color: 'rgb(var(--faint))' }}>{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: AI preview card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.82, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="relative perspective-[1200px]"
          >
            <motion.div
              className="luxury-card-3d animated-border p-5 sm:p-6"
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Search bar */}
              <motion.div
                className="flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl"
                style={{ background: 'rgba(var(--surface),0.72)', borderColor: 'rgba(255,255,255,0.10)', transform: 'translateZ(40px)' }}
              >
                <Search className="h-4 w-4 flex-shrink-0 text-[rgb(var(--accent))]" aria-hidden="true" />
                <span className="text-sm" style={{ color: 'rgb(var(--muted))' }}>
                  Romantic seafood dinner in ECR under Rs.&nbsp;2500
                </span>
                <span
                  className="ml-auto flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                  style={{ background: 'rgba(var(--accent),0.16)', color: 'rgb(var(--accent))' }}
                >
                  AI
                </span>
              </motion.div>

              {/* Result cards */}
              <motion.div className="mt-4 grid gap-3" style={{ transform: 'translateZ(20px)' }}>
                {aiCards.map(({ name, meta, rating, tags }, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.44, delay: 0.32 + i * 0.09 }}
                    className="shimmer-hover relative rounded-2xl p-4 shadow-xl"
                    style={{
                      background: 'rgba(var(--surface-raised),0.66)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black" style={{ color: 'rgb(var(--text))' }}>{name}</p>
                        <p className="mt-0.5 text-xs" style={{ color: 'rgb(var(--muted))' }}>{meta}</p>
                      </div>
                      <span
                        className="flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
                        style={{ background: 'rgba(var(--accent),0.14)', color: 'rgb(var(--accent))' }}
                      >
                        <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                        {rating}
                      </span>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span key={tag} className="match-chip rounded-full px-2 py-0.5 text-[11px] font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Bottom row */}
              <motion.div
                className="mt-4 flex items-center justify-between rounded-xl px-4 py-2.5 shadow-md"
                style={{ background: 'rgba(var(--accent),0.09)', border: '1px solid rgba(var(--accent),0.22)', transform: 'translateZ(10px)' }}
              >
                <span className="text-xs font-bold" style={{ color: 'rgb(var(--accent))' }}>
                  3 matches · Live availability
                </span>
                <span className="flex items-center gap-1 text-xs" style={{ color: 'rgb(var(--muted))' }}>
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  Updated now
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="page-shell pt-0" aria-labelledby="features-heading">
        <div className="mb-10 text-center">
          <span className="eyebrow mb-4">
            <Utensils className="h-4 w-4" aria-hidden="true" />
            Product flow
          </span>
          <h2 id="features-heading" className="mt-3 text-3xl font-black sm:text-4xl" style={{ color: 'rgb(var(--text))' }}>
            Everything feels one step away
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7" style={{ color: 'rgb(var(--muted))' }}>
            Discovery, table choice, and booking management share one calm, fast interface.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{ duration: 0.44, delay: i * 0.06 }}
              className="luxury-card-3d animated-border p-6"
            >
              <div
                className={`mb-5 inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${feature.color}`}
                aria-hidden="true"
              >
                <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
              </div>
              <h3 className="mb-2 font-black" style={{ color: 'rgb(var(--text))' }}>{feature.title}</h3>
              <p className="text-sm leading-6" style={{ color: 'rgb(var(--muted))' }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.52, delay: 0.1 }}
          className="mt-12 flex flex-col items-center gap-4 text-center"
        >
          <div
            className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold"
            style={{ background: 'rgba(var(--accent),0.1)', border: '1px solid rgba(var(--accent),0.26)', color: 'rgb(var(--accent))' }}
          >
            <Wine className="h-3.5 w-3.5" aria-hidden="true" />
            Chennai's finest dining, just a tap away
          </div>
          <Link
            to={loggedIn ? '/restaurants' : '/signup'}
            id="features-cta"
            className="btn-primary-3d px-8 py-3 text-sm flex items-center gap-2"
          >
            <span>{loggedIn ? 'Explore restaurants' : 'Get started free'}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
