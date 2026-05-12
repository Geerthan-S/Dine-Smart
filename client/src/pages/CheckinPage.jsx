import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, CalendarDays, Users, Store, QrCode } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CheckinPage() {
  const { token } = useParams();
  const [state, setState] = useState('loading'); // loading | success | already | error
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const doCheckin = async () => {
      try {
        const { data } = await api.post(`/bookings/checkin/${token}`);
        setBooking(data.booking);
        if (data.alreadyCheckedIn) {
          setState('already');
          setMessage(data.message);
        } else {
          setState('success');
          setMessage(data.message);
        }
      } catch (err) {
        setState('error');
        setMessage(err.response?.data?.message || 'Invalid or expired QR code.');
      }
    };
    doCheckin();
  }, [token]);

  const restaurant = booking?.restaurantId;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
        className="luxury-card-3d w-full max-w-md p-8 text-center"
      >
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: 'linear-gradient(135deg, rgb(255,199,106), rgb(255,181,71))' }}>
            <QrCode className="h-6 w-6 text-[#0F1115]" />
          </span>
        </div>

        {/* Loading */}
        {state === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner />
            <p className="text-sm" style={{ color: 'rgb(var(--muted))' }}>Verifying your check-in...</p>
          </div>
        )}

        {/* Success */}
        {state === 'success' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="mb-4 inline-grid h-20 w-20 place-items-center rounded-3xl" style={{ background: 'rgba(52,211,153,0.14)' }}>
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black" style={{ color: 'rgb(var(--text))' }}>Welcome in! 🎉</h1>
            <p className="mt-2 text-sm" style={{ color: 'rgb(var(--muted))' }}>{message}</p>

            {booking && restaurant && (
              <div className="mt-6 space-y-3 rounded-2xl p-4 text-left" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.22)' }}>
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-emerald-400" />
                  <span className="font-black text-sm" style={{ color: 'rgb(var(--text))' }}>{restaurant.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm" style={{ color: 'rgb(var(--muted))' }}>{booking.date} at {booking.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm" style={{ color: 'rgb(var(--muted))' }}>{booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'guest' : 'guests'} · Table #{booking.tableId?.tableNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm" style={{ color: 'rgb(var(--muted))' }}>Checked in at {new Date(booking.checkInTime).toLocaleTimeString()}</span>
                </div>
              </div>
            )}

            <div className="mt-6 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(52,211,153,0.10)', color: '#6ee7b7' }}>
              Your table is confirmed. Enjoy your meal! 🍽️
            </div>
          </motion.div>
        )}

        {/* Already checked in */}
        {state === 'already' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="mb-4 inline-grid h-20 w-20 place-items-center rounded-3xl" style={{ background: 'rgba(251,191,36,0.14)' }}>
              <CheckCircle2 className="h-10 w-10 text-amber-400" />
            </div>
            <h1 className="text-2xl font-black" style={{ color: 'rgb(var(--text))' }}>Already checked in</h1>
            <p className="mt-2 text-sm" style={{ color: 'rgb(var(--muted))' }}>This QR code was already used.</p>
            {booking && (
              <p className="mt-2 text-xs" style={{ color: 'rgb(var(--faint))' }}>
                Checked in at {new Date(booking.checkInTime).toLocaleTimeString()} on {booking.date}
              </p>
            )}
            <div className="mt-6 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(251,191,36,0.10)', color: '#fbbf24' }}>
              You're all set — enjoy your experience!
            </div>
          </motion.div>
        )}

        {/* Error */}
        {state === 'error' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="mb-4 inline-grid h-20 w-20 place-items-center rounded-3xl" style={{ background: 'rgba(251,113,133,0.14)' }}>
              <XCircle className="h-10 w-10 text-rose-400" />
            </div>
            <h1 className="text-2xl font-black" style={{ color: 'rgb(var(--text))' }}>Check-in failed</h1>
            <p className="mt-2 text-sm" style={{ color: 'rgb(var(--muted))' }}>{message}</p>
            <div className="mt-6 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(251,113,133,0.10)', color: '#fca5a5' }}>
              Please show this screen to restaurant staff for assistance.
            </div>
          </motion.div>
        )}

        <Link to="/" className="btn-secondary mt-8 inline-flex">
          Back to DineSmart
        </Link>
      </motion.div>
    </div>
  );
}
