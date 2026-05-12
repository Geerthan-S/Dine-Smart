import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, QrCode, CheckCircle2, Clock } from 'lucide-react';

export default function QRCodeModal({ booking, onClose }) {
  const qrRef = useRef(null);

  if (!booking) return null;

  const checkinUrl = `${window.location.origin}/checkin/${booking.qrToken}`;
  const restaurant = booking.restaurantId;

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 320, 320);
      ctx.drawImage(img, 0, 0, 320, 320);
      const a = document.createElement('a');
      a.download = `dinesmart-checkin-${booking._id}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div
      className="dialog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="premium-dialog w-full max-w-sm p-6">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <span className="mb-2 grid h-10 w-10 place-items-center rounded-2xl" style={{ background: 'rgba(var(--accent),0.14)', color: 'rgb(var(--accent))' }}>
              <QrCode className="h-5 w-5" />
            </span>
            <h2 id="qr-modal-title" className="mt-2 text-xl font-black" style={{ color: 'rgb(var(--text))' }}>Your Check-in QR</h2>
            <p className="mt-1 text-sm" style={{ color: 'rgb(var(--faint))' }}>Show this at {restaurant?.name || 'the restaurant'}</p>
          </div>
          <button className="icon-btn h-9 w-9" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* QR Code */}
        <div
          ref={qrRef}
          className="flex justify-center rounded-2xl p-5"
          style={{ background: '#ffffff' }}
        >
          {booking.checkedIn ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle2 className="h-16 w-16 text-emerald-400" />
              <p className="font-black text-emerald-600">Already Checked In</p>
              {booking.checkInTime && (
                <p className="text-xs text-slate-400">
                  {new Date(booking.checkInTime).toLocaleTimeString()}
                </p>
              )}
            </div>
          ) : (
            <QRCodeSVG
              value={checkinUrl}
              size={220}
              bgColor="#ffffff"
              fgColor="#0F1115"
              level="H"
              includeMargin={false}
            />
          )}
        </div>

        {/* Booking Details */}
        <div className="mt-4 space-y-2 rounded-2xl p-4" style={{ background: 'rgba(var(--surface),0.6)', border: '1px solid rgba(var(--line),0.1)' }}>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'rgb(var(--faint))' }}>Date</span>
            <span className="font-bold" style={{ color: 'rgb(var(--text))' }}>{booking.date}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'rgb(var(--faint))' }}>Time</span>
            <span className="font-bold" style={{ color: 'rgb(var(--text))' }}>{booking.time}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'rgb(var(--faint))' }}>Table</span>
            <span className="font-bold" style={{ color: 'rgb(var(--text))' }}>#{booking.tableId?.tableNumber} · {booking.tableId?.capacity} seats</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'rgb(var(--faint))' }}>Guests</span>
            <span className="font-bold" style={{ color: 'rgb(var(--text))' }}>{booking.numberOfPeople} people</span>
          </div>
        </div>

        {/* Status */}
        <div className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: booking.checkedIn ? 'rgba(52,211,153,0.10)' : 'rgba(var(--accent),0.08)', border: `1px solid ${booking.checkedIn ? 'rgba(52,211,153,0.24)' : 'rgba(var(--accent),0.22)'}` }}>
          {booking.checkedIn
            ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            : <Clock className="h-4 w-4" style={{ color: 'rgb(var(--accent))' }} />
          }
          <p className="text-xs font-bold" style={{ color: booking.checkedIn ? '#6ee7b7' : 'rgb(var(--accent))' }}>
            {booking.checkedIn ? `Checked in at ${new Date(booking.checkInTime).toLocaleTimeString()}` : 'Scan at the restaurant entrance to check in'}
          </p>
        </div>

        {/* Actions */}
        {!booking.checkedIn && (
          <button
            onClick={downloadQR}
            className="btn-secondary mt-4 w-full"
          >
            <Download className="h-4 w-4" />
            Download QR Code
          </button>
        )}
      </div>
    </div>
  );
}
