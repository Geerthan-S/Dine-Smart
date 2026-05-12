import { useState } from 'react';
import { AlertTriangle, Calendar, Clock, MapPin, UsersRound, Utensils, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

const statusColors = {
  confirmed: 'bg-emerald-500/12 text-emerald-200 border-emerald-300/20',
  cancelled: 'bg-red-500/12 text-red-200 border-red-300/20',
  completed: 'bg-sky-500/12 text-sky-200 border-sky-300/20',
};

export default function BookingCard({ booking, onCancel }) {
  const { _id, restaurantId, tableId, date, time, numberOfPeople, status } = booking;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCancel = async () => {
    try {
      await api.patch(`/bookings/${_id}/cancel`);
      toast.success('Booking cancelled');
      onCancel(_id);
      setConfirmOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="card hover-lift"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="mb-1 text-lg font-black text-white">{restaurantId?.name || 'Restaurant'}</h3>
          <p className="flex items-center gap-1.5 text-sm text-slate-400"><MapPin className="h-4 w-4 text-[rgb(var(--accent))]" />{restaurantId?.location || 'Location unavailable'}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400"><Utensils className="h-4 w-4 text-teal-300" />{Array.isArray(restaurantId?.cuisine) ? restaurantId.cuisine.join(', ') : restaurantId?.cuisine}</p>
        </div>
        <span className={`badge shrink-0 ${statusColors[status] || 'bg-white/5 text-slate-300 border-white/10'}`}>
          {status}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Date', value: date, icon: Calendar },
          { label: 'Time', value: time, icon: Clock },
          { label: 'People', value: numberOfPeople, icon: UsersRound },
          { label: 'Table', value: tableId?.tableNumber || 'Pending', icon: Utensils },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="metric-tile">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Icon className="h-3.5 w-3.5" />{label}</p>
            <p className="text-sm font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {status === 'confirmed' && (
        <div className="mt-4">
          <button onClick={() => setConfirmOpen(true)} className="btn-danger w-full">
            Cancel Booking
          </button>
        </div>
      )}

      {confirmOpen && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby={`cancel-${_id}`}>
          <div className="premium-dialog p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <span className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-red-500/12 text-red-200">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 id={`cancel-${_id}`} className="text-xl font-black text-white">Cancel this booking?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  This will release your table at {restaurantId?.name || 'the restaurant'} for {date} at {time}.
                </p>
              </div>
              <button type="button" className="icon-btn h-10 w-10" onClick={() => setConfirmOpen(false)} aria-label="Close dialog">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" className="btn-secondary" onClick={() => setConfirmOpen(false)}>Keep booking</button>
              <button type="button" className="btn-danger" onClick={handleCancel}>Cancel booking</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
