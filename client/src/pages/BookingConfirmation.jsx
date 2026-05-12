import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarCheck, Clock, MapPin, QrCode, UsersRound } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/bookings/${bookingId}`).then(({ data }) => setBooking(data)).finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner text="Loading confirmation..." /></div>;
  if (!booking) return null;

  const restaurant = booking.restaurantId;
  const checkinUrl = `${window.location.origin}/checkin/${booking.qrToken}`;
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Dinner at ${restaurant.name}`)}&details=${encodeURIComponent(`Reservation for ${booking.numberOfPeople} people.`)}&location=${encodeURIComponent(restaurant.address || restaurant.location || '')}&dates=${booking.date.replaceAll('-', '')}T${booking.time.replace(':', '')}00/${booking.date.replaceAll('-', '')}T${booking.time.replace(':', '')}00`;

  return (
    <div className="page-narrow">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
        className="card text-center"
      >
        {/* Success icon */}
        <div className="mb-4 inline-grid h-16 w-16 place-items-center rounded-3xl" style={{ background: 'rgba(52,211,153,0.14)' }}>
          <CalendarCheck className="h-8 w-8 text-emerald-400" />
        </div>

        <span className="eyebrow mb-4">Booking confirmed</span>
        <h1 className="gradient-title mt-3 text-4xl font-black">{restaurant.name}</h1>
        <p className="mt-3 text-base" style={{ color: 'rgb(var(--muted))' }}>
          Your table is reserved. Use the QR code below to check in at the restaurant.
        </p>

        {/* Booking details */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="metric-tile text-center">
            <Clock className="mx-auto mb-2 h-5 w-5" style={{ color: 'rgb(var(--accent))' }} />
            <b className="text-base" style={{ color: 'rgb(var(--text))' }}>{booking.date}</b>
            <p className="text-sm" style={{ color: 'rgb(var(--faint))' }}>{booking.time}</p>
          </div>
          <div className="metric-tile text-center">
            <UsersRound className="mx-auto mb-2 h-5 w-5" style={{ color: 'rgb(var(--accent))' }} />
            <b className="text-base" style={{ color: 'rgb(var(--text))' }}>{booking.numberOfPeople} guests</b>
            <p className="text-sm" style={{ color: 'rgb(var(--faint))' }}>Table #{booking.tableId?.tableNumber}</p>
          </div>
          <div className="metric-tile text-center">
            <MapPin className="mx-auto mb-2 h-5 w-5" style={{ color: 'rgb(var(--accent))' }} />
            <b className="text-base" style={{ color: 'rgb(var(--text))' }}>{restaurant.area}</b>
            <p className="text-sm" style={{ color: 'rgb(var(--faint))' }}>{restaurant.city}</p>
          </div>
        </div>

        {/* QR Code */}
        {booking.qrToken && (
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-center gap-2">
              <QrCode className="h-4 w-4" style={{ color: 'rgb(var(--accent))' }} />
              <span className="text-sm font-bold" style={{ color: 'rgb(var(--accent))' }}>Scan to check in</span>
            </div>
            <div className="inline-block rounded-2xl bg-white p-4 shadow-2xl">
              <QRCodeSVG
                value={checkinUrl}
                size={180}
                bgColor="#ffffff"
                fgColor="#0F1115"
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="mt-3 text-xs" style={{ color: 'rgb(var(--faint))' }}>
              Show this QR at the restaurant entrance — staff will scan it to mark you as arrived.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={calendarUrl} target="_blank" rel="noreferrer" className="btn-primary-3d">
            <CalendarCheck className="h-4 w-4" />
            Add to calendar
          </a>
          <Link to="/my-bookings" className="btn-secondary">View my bookings</Link>
        </div>
      </motion.div>
    </div>
  );
}
