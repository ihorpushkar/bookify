import { format } from 'date-fns';
import type { Booking } from '../types';
import { StatusBadge } from './StatusBadge';
import { buttonSecondaryClass } from '../utils/formStyles';

type BookingCardProps = {
  booking: Booking;
  view: 'client' | 'provider';
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
  loadingId?: string | null;
};

export function BookingCard({
  booking,
  view,
  onConfirm,
  onCancel,
  onComplete,
  loadingId,
}: BookingCardProps) {
  const isLoading = loadingId === booking.id;
  const canCancel =
    booking.status === 'PENDING' || booking.status === 'CONFIRMED';

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-100">{booking.service.name}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {format(new Date(booking.startTime), 'PPP p')} – {format(new Date(booking.endTime), 'p')}
          </p>
          <p className="mt-2 text-sm text-slate-300">
            {view === 'client'
              ? `Provider: ${booking.provider.user.name}`
              : `Client: ${booking.client.name}`}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {view === 'provider' && booking.status === 'PENDING' && onConfirm && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onConfirm(booking.id)}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            Confirm
          </button>
        )}
        {view === 'provider' && booking.status === 'CONFIRMED' && onComplete && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onComplete(booking.id)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Mark completed
          </button>
        )}
        {canCancel && onCancel && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onCancel(booking.id)}
            className={`${buttonSecondaryClass} text-sm`}
          >
            Cancel
          </button>
        )}
      </div>
    </article>
  );
}
