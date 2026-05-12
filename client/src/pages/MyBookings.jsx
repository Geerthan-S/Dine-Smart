import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, ClipboardList, QrCode, CheckCircle2, X } from 'lucide-react';
import api from '../services/api';
import BookingCard from '../components/BookingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import QRCodeModal from '../components/QRCodeModal';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [qrBooking, setQrBooking] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/bookings/my');
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleCancel = (id) => {
    setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b)));
  };

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="page-narrow">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow mb-4"><ClipboardList className="h-4 w-4" />Reservations</span>
          <h1 className="gradient-title mt-3 text-4xl font-black sm:text-5xl">My bookings</h1>
          <p className="mt-3" style={{ color: 'rgb(var(--muted))' }}>Manage every restaurant reservation in one polished queue.</p>
        </div>
        <Link to="/restaurants" className="btn-primary-3d self-start sm:self-auto">
          <CalendarPlus className="h-4 w-4" />New Booking
        </Link>
      </div>

      <div className="mb-6">
        <div className="segmented">
          {['all', 'confirmed', 'cancelled'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`segmented-btn capitalize ${filter === f ? 'segmented-btn-active' : ''}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner text="Loading bookings..." /></div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl" style={{ background: 'rgba(var(--accent),0.12)' }}>
            <ClipboardList className="h-8 w-8" style={{ color: 'rgb(var(--accent))' }} />
          </div>
          <p className="mb-2 text-lg font-black" style={{ color: 'rgb(var(--text))' }}>No bookings found</p>
          <p className="mb-6 text-sm" style={{ color: 'rgb(var(--faint))' }}>Start by reserving a table at one of our curated restaurants.</p>
          <Link to="/restaurants" className="btn-primary-3d">Browse Restaurants</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div key={b._id} className="group relative">
              <BookingCard booking={b} onCancel={handleCancel} />
              {/* QR & Check-in overlay row */}
              <div className="mt-2 flex flex-wrap items-center gap-2 px-1">
                {b.status === 'confirmed' && (
                  <button
                    onClick={() => setQrBooking(b)}
                    className="btn-secondary text-xs"
                    aria-label="Show QR code"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    Check-in QR
                  </button>
                )}
                {b.checkedIn && (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.24)', color: '#6ee7b7' }}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Checked in
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {qrBooking && <QRCodeModal booking={qrBooking} onClose={() => setQrBooking(null)} />}
    </div>
  );
}
