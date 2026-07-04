import { useEffect, useState } from 'react';
import { bookingsAPI } from '../api/bookings';
import { providersAPI } from '../api/providers';
import { servicesAPI } from '../api/services';
import { AppLayout } from '../components/Layout/AppLayout';
import { BookingCard } from '../components/BookingCard';
import { EmptyState } from '../components/EmptyState';
import { ServiceForm } from '../components/ServiceForm';
import { Skeleton } from '../components/Skeleton';
import { useAuth } from '../hooks/useAuth';
import type { Booking, Service, WorkingHours } from '../types';
import { getErrorMessage } from '../utils/errors';
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass } from '../utils/formStyles';
import { showError, showSuccess } from '../utils/toast';

type Tab = 'bookings' | 'services' | 'hours';

const WEEKDAYS: (keyof WorkingHours)[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [bio, setBio] = useState('');
  const [hours, setHours] = useState<WorkingHours | null>(null);
  const [savingHours, setSavingHours] = useState(false);

  const profileId = user?.providerProfile?.id;

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        bookingsAPI.getIncoming(),
        servicesAPI.list(1, 50),
      ]);
      setBookings(bookingsRes.data.data);
      const mine = servicesRes.data.data.filter((s) => s.provider?.id === profileId);
      setServices(mine);
      setBio(user?.providerProfile?.bio ?? '');
      setHours(user?.providerProfile?.workingHours ?? null);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) loadData();
  }, [profileId]);

  const handleConfirm = async (id: string) => {
    setActionId(id);
    try {
      await bookingsAPI.updateStatus(id, 'CONFIRMED');
      showSuccess('Booking confirmed');
      loadData();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = async (id: string) => {
    setActionId(id);
    try {
      await bookingsAPI.updateStatus(id, 'CANCELLED');
      showSuccess('Booking cancelled');
      loadData();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const handleComplete = async (id: string) => {
    setActionId(id);
    try {
      await bookingsAPI.updateStatus(id, 'COMPLETED');
      showSuccess('Booking marked as completed');
      loadData();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const handleSaveService = async (data: {
    name: string;
    description?: string;
    durationMin: number;
    price: number;
  }) => {
    try {
      if (editingService) {
        await servicesAPI.update(editingService.id, data);
        showSuccess('Service updated');
      } else {
        await servicesAPI.create(data);
        showSuccess('Service created');
      }
      setShowServiceForm(false);
      setEditingService(null);
      loadData();
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try {
      await servicesAPI.remove(id);
      showSuccess('Service deleted');
      loadData();
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const handleSaveHours = async () => {
    if (!hours) return;
    setSavingHours(true);
    try {
      await providersAPI.updateMe({ bio, workingHours: hours });
      showSuccess('Profile updated');
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSavingHours(false);
    }
  };

  const updateDayHours = (day: keyof WorkingHours, start: string, end: string) => {
    if (!hours) return;
    const enabled = start && end;
    setHours({
      ...hours,
      [day]: enabled ? [{ start, end }] : [],
    });
  };

  return (
    <AppLayout>
      <h1 className="text-3xl font-semibold">Provider dashboard</h1>
      <p className="mt-2 text-slate-400">Manage bookings, services, and schedule</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {([
          ['bookings', 'Incoming bookings'],
          ['services', 'My services'],
          ['hours', 'Working hours'],
        ] as [Tab, string][]).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <Skeleton className="h-40" />
        ) : tab === 'bookings' ? (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <EmptyState title="No incoming bookings" />
            ) : (
              bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  view="provider"
                  loadingId={actionId}
                  onConfirm={handleConfirm}
                  onCancel={handleCancel}
                  onComplete={handleComplete}
                />
              ))
            )}
          </div>
        ) : tab === 'services' ? (
          <div>
            {!showServiceForm && (
              <button
                type="button"
                onClick={() => {
                  setEditingService(null);
                  setShowServiceForm(true);
                }}
                className={`${buttonPrimaryClass} mb-4`}
              >
                Add service
              </button>
            )}
            {showServiceForm && (
              <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
                <ServiceForm
                  initial={editingService ?? undefined}
                  onSubmit={handleSaveService}
                  onCancel={() => {
                    setShowServiceForm(false);
                    setEditingService(null);
                  }}
                />
              </div>
            )}
            <div className="space-y-3">
              {services.length === 0 ? (
                <EmptyState title="No services yet" description="Add your first service to get booked." />
              ) : (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4"
                  >
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <p className="text-sm text-slate-400">
                        {service.durationMin} min · ${service.price}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={buttonSecondaryClass}
                        onClick={() => {
                          setEditingService(service);
                          setShowServiceForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          hours && (
            <div className="max-w-xl space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div>
                <label className={labelClass}>Bio</label>
                <textarea
                  className={`${inputClass} min-h-24`}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              {WEEKDAYS.map((day) => {
                const range = hours[day][0];
                return (
                  <div key={day} className="grid grid-cols-3 items-end gap-3">
                    <span className="text-sm font-medium uppercase text-slate-400">{day}</span>
                    <div>
                      <label className={labelClass}>Start</label>
                      <input
                        type="time"
                        className={inputClass}
                        value={range?.start ?? ''}
                        onChange={(e) =>
                          updateDayHours(day, e.target.value, range?.end ?? '17:00')
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>End</label>
                      <input
                        type="time"
                        className={inputClass}
                        value={range?.end ?? ''}
                        onChange={(e) =>
                          updateDayHours(day, range?.start ?? '09:00', e.target.value)
                        }
                      />
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                disabled={savingHours}
                onClick={handleSaveHours}
                className={buttonPrimaryClass}
              >
                {savingHours ? 'Saving…' : 'Save profile'}
              </button>
            </div>
          )
        )}
      </div>
    </AppLayout>
  );
}
