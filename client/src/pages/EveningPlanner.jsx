import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Wand2, Star, Utensils, RefreshCw, CalendarPlus, ChevronRight, X } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function EveningPlanner() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ area: '', occasion: 'date night', budget: '' });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [swappingId, setSwappingId] = useState(null);

  const createPlan = async (event) => {
    if (event) event.preventDefault();
    if (!form.area.trim()) return toast.error('Please enter an area');
    setLoading(true);
    try {
      const { data } = await api.get('/restaurants/itinerary/plan', { params: form });
      setPlan(data);
    } catch (err) {
      toast.error('Failed to generate evening plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async (stopIndex) => {
    // A real swap would hit an endpoint passing excluded IDs.
    // For now, we'll just simulate a quick refresh of the whole plan as a placeholder for the swap feature.
    setSwappingId(stopIndex);
    try {
      const { data } = await api.get('/restaurants/itinerary/plan', { params: { ...form, exclude: true } });
      setPlan(data);
    } finally {
      setSwappingId(null);
    }
  };

  const bookEvening = () => {
    // Navigate to a multi-booking flow or just the primary dinner booking for now
    const dinnerStop = plan.stops.find(s => s.type === 'restaurant' && s.title.toLowerCase().includes('dinner'));
    if (dinnerStop?.restaurant?._id) {
      navigate(`/booking/${dinnerStop.restaurant._id}`);
    } else {
      toast.error('No main dinner found to book.');
    }
  };

  return (
    <div className="page-narrow pb-32">
      {/* Header section — transitions to a compact sticky header when a plan exists */}
      <motion.div
        layout
        className={`relative z-20 ${plan ? 'mb-8' : 'pt-[10vh]'}`}
      >
        {!plan && (
          <div className="mb-8 text-center">
            <span className="eyebrow mb-4 inline-flex"><Wand2 className="mr-2 h-4 w-4" />AI Evening Concierge</span>
            <h1 className="gradient-title text-4xl font-black sm:text-6xl">Design the perfect evening.</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
              Not just dinner. A complete, chronologically planned experience including pre-dinner walks, the main event, and dessert spots.
            </p>
          </div>
        )}

        <form
          onSubmit={createPlan}
          className={`mx-auto grid max-w-4xl gap-4 transition-all duration-500 ${plan ? 'md:grid-cols-4' : 'luxury-card-3d p-6 md:grid-cols-2 lg:grid-cols-4'}`}
        >
          {plan && (
            <div className="col-span-full mb-2 flex items-center justify-between">
              <h2 className="text-xl font-black text-white">Your Itinerary</h2>
              <button type="button" onClick={() => setPlan(null)} className="icon-btn h-8 w-8 rounded-full border-white/10 hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="relative">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Neighborhood</label>
            <input className="input-3d w-full bg-[rgba(var(--surface),0.6)]" placeholder="e.g. Adyar" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} required />
          </div>
          <div className="relative">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Vibe / Occasion</label>
            <select className="input-3d w-full bg-[rgba(var(--surface),0.6)]" value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })}>
              <option value="evening">Casual Evening</option>
              <option value="date">Date Night</option>
              <option value="family">Family Outing</option>
            </select>
          </div>
          <div className="relative">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Price Tier</label>
            <select className="input-3d w-full bg-[rgba(var(--surface),0.6)]" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}>
              <option value="">Any Budget</option>
              <option value="budget">Budget-friendly</option>
              <option value="mid-range">Mid-range</option>
              <option value="premium">Premium</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="btn-primary-3d h-12 w-full" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : <><RefreshCw className="h-4 w-4" /> Regenerate</>}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Loading State */}
      {loading && !plan && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--accent))] opacity-20" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[rgb(var(--accent-hover))] to-[rgb(var(--accent-2))] text-[#0F1115] shadow-[0_0_30px_rgba(var(--accent),0.3)]">
              <Wand2 className="h-8 w-8 animate-pulse" />
            </div>
          </div>
          <p className="text-lg font-bold text-[rgb(var(--accent))]">Curating experiences...</p>
          <p className="mt-2 text-sm text-slate-500">Finding the perfect spots for your {form.occasion}.</p>
        </div>
      )}

      {/* Timeline Results */}
      {!loading && plan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative mx-auto mt-10 max-w-3xl"
        >
          <div className="mb-12 text-center">
            <p className="text-lg leading-relaxed text-slate-300">"{plan.summary}"</p>
          </div>

          <div className="relative">
            {/* The vertical connecting line */}
            <div className="absolute bottom-0 left-[27px] top-0 w-0.5 bg-gradient-to-b from-[rgb(var(--accent))] via-[rgba(var(--accent),0.3)] to-transparent md:left-[39px]" />

            <div className="space-y-12">
              <AnimatePresence>
                {plan.stops.map((stop, index) => (
                  <motion.div
                    key={`${stop.time}-${index}`}
                    initial={{ opacity: 0, x: -20, y: 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="relative pl-16 md:pl-24"
                  >
                    {/* Glowing Node on Timeline */}
                    <div className="absolute left-[12px] top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(18,21,28)] shadow-[0_0_0_2px_rgb(18,21,28)] md:left-[24px]">
                      <div className="h-3 w-3 rounded-full bg-[rgb(var(--accent))] shadow-[0_0_12px_rgb(var(--accent))]" />
                    </div>

                    {/* Timestamp */}
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <span className="text-xl font-black tabular-nums tracking-tight text-white">{stop.time}</span>
                      <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                      {/* Swap Button */}
                      <button
                        onClick={() => handleSwap(index)}
                        disabled={swappingId === index}
                        className="group flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-400 transition-all hover:bg-white/10 hover:text-white"
                      >
                        <RefreshCw className={`h-3 w-3 ${swappingId === index ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                        Swap
                      </button>
                    </div>

                    {/* Card Content based on type */}
                    <div className="group relative">
                      <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      
                      {stop.type === 'experience' ? (
                        <div className="relative luxury-card-3d overflow-hidden p-6">
                          <div className="absolute -right-6 -top-6 text-8xl opacity-5">{stop.icon}</div>
                          <div className="relative z-10">
                            <span className="mb-3 inline-block rounded-full bg-[rgba(var(--accent),0.12)] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[rgb(var(--accent))]">
                              Experience
                            </span>
                            <h3 className="mb-1 text-2xl font-black text-white">{stop.title}</h3>
                            <p className="mb-3 flex items-center gap-1.5 text-sm text-slate-400">
                              <MapPin className="h-4 w-4" /> {stop.place}
                            </p>
                            <p className="mb-5 text-sm leading-relaxed text-slate-300">{stop.description}</p>
                            {stop.tip && (
                              <div className="rounded-xl border border-[rgba(var(--accent),0.2)] bg-[rgba(var(--accent),0.05)] p-3">
                                <span className="font-bold text-[rgb(var(--accent))]">💡 Pro Tip:</span> <span className="text-sm text-slate-300">{stop.tip}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="relative luxury-card-3d overflow-hidden p-6 transition-transform hover:-translate-y-1">
                          <div className="flex flex-col gap-5 sm:flex-row">
                            {stop.restaurant.imageUrl ? (
                              <img src={stop.restaurant.imageUrl} alt={stop.restaurant.name} className="h-32 w-full rounded-xl object-cover shadow-lg sm:w-32" />
                            ) : (
                              <div className="flex h-32 w-full items-center justify-center rounded-xl bg-[rgba(var(--surface-raised),0.5)] sm:w-32">
                                <Utensils className="h-8 w-8 text-slate-600" />
                              </div>
                            )}
                            <div className="flex flex-1 flex-col">
                              <span className="mb-2 inline-block w-max rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                {stop.title}
                              </span>
                              <h3 className="text-2xl font-black text-white">{stop.restaurant.name}</h3>
                              <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                                <span>{Array.isArray(stop.restaurant.cuisine) ? stop.restaurant.cuisine.join(', ') : stop.restaurant.cuisine}</span>
                                <span>·</span>
                                <span className="flex items-center gap-0.5 text-amber-400 font-bold"><Star className="h-3.5 w-3.5 fill-current" />{stop.restaurant.rating}</span>
                              </p>
                              <p className="mt-3 text-sm leading-relaxed text-slate-300 line-clamp-2">{stop.reason}</p>
                              <div className="mt-auto pt-4">
                                <Link to={`/restaurants/${stop.restaurant._id}`} className="inline-flex items-center gap-1 text-sm font-bold text-[rgb(var(--accent))] hover:text-white">
                                  View details <ChevronRight className="h-4 w-4" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}

      {/* Floating Action Bar for Booking */}
      <AnimatePresence>
        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-white/10 bg-[rgba(18,21,28,0.85)] px-6 py-4 shadow-2xl backdrop-blur-xl"
            style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset' }}
          >
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ready to go?</p>
              <p className="text-sm font-black text-white">Reserve the main event</p>
            </div>
            <button onClick={bookEvening} className="btn-primary-3d px-8 py-3 ml-auto shadow-[0_0_20px_rgba(var(--accent),0.3)]">
              <CalendarPlus className="mr-2 h-5 w-5" />
              Book Evening
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
