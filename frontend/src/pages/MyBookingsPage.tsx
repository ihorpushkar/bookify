import { isPast } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { bookingsAPI } from '../api/bookings';
import { AppLayout } from '../components/Layout/AppLayout';
import { BookingCard } from '../components/BookingCard';
import { EmptyState } from '../components/EmptyState';
import { Skeleton } from '../components/Skeleton';
import type { Booking } from '../types';
import { getErrorMessage } from '../utils/errors';
import { showError, showSuccess } from '../utils/toast';

type Tab = 'upcoming' | 'past';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('upcoming');
  const [actionId, setActionId] = useState<string | null>(null);

  const loadBookings = () => {
    setLoading(true);
    bookingsAPI
      .getMine()
      .then((res) => setBookings(res.data.data))
      .catch((err) => showError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filtered = useMemo(() => {
    return bookings.filter((booking) => {
      const upcoming =
        !isPast(new Date(booking.endTime)) &&
        (booking.status === 'PENDING' || booking.status === 'CONFIRMED');
      return tab === 'upcoming' ? upcoming : !upcoming;
    });
  }, [bookings, tab]);

  const handleCancel = async (id: string) => {
    setActionId(id);
    try {
      await bookingsAPI.updateStatus(id, 'CANCELLED');
      showSuccess('Booking cancelled');
      loadBookings();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  return (
    <AppLayout>
      <h1 className="text-3xl font-semibold">My bookings</h1>
      <p className="mt-2 text-slate-400">Track upcoming and past appointments</p>

      <div className="mt-6 flex gap-2">
        {(['upcoming', 'past'] as Tab[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
              tab === value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : filtered.length === 0 ? (
          <EmptyState
            title={tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            description={tab === 'upcoming' ? 'Browse services to book your next appointment.' : undefined}
          />
        ) : (
          filtered.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              view="client"
              loadingId={actionId}
              onCancel={handleCancel}
            />
          ))
        )}
      </div>
    </AppLayout>
  );
}
