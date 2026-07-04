import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { bookingsAPI } from '../api/bookings';
import { providersAPI } from '../api/providers';
import { AppLayout } from '../components/Layout/AppLayout';
import { Modal } from '../components/Modal';
import { Skeleton } from '../components/Skeleton';
import { SlotPicker } from '../components/SlotPicker';
import { useAuth } from '../hooks/useAuth';
import type { ProviderDetail, Service, Slot } from '../types';
import { getErrorMessage } from '../utils/errors';
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass } from '../utils/formStyles';
import { showError, showSuccess } from '../utils/toast';

export default function ProviderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    providersAPI
      .getById(id)
      .then((res) => {
        setProvider(res.data.data);
        if (res.data.data.services[0]) {
          setSelectedService(res.data.data.services[0]);
        }
      })
      .catch((err) => showError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !selectedService || !date) {
      setSlots([]);
      return;
    }

    setSlotsLoading(true);
    setSelectedSlot(null);
    providersAPI
      .getSlots(id, date, selectedService.id)
      .then((res) => setSlots(res.data.data.slots))
      .catch((err) => showError(getErrorMessage(err)))
      .finally(() => setSlotsLoading(false));
  }, [id, selectedService, date]);

  const handleDateChange = (value: string) => {
    if (!value) {
      setDate('');
      return;
    }

    const [year] = value.split('-');
    if (year.length > 4) return;

    const yearNum = Number(year);
    if (yearNum < 1000 || yearNum > 9999) return;

    setDate(value);
  };

  const handleBook = async () => {
    if (!selectedService || !selectedSlot) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'CLIENT' && user?.role !== 'ADMIN') {
      showError('Only clients can create bookings');
      return;
    }

    setBookingLoading(true);
    try {
      await bookingsAPI.create(selectedService.id, selectedSlot.startTime);
      showSuccess('Booking request sent!');
      setConfirmOpen(false);
      navigate('/my-bookings');
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Skeleton className="h-64" />
      </AppLayout>
    );
  }

  if (!provider) {
    return (
      <AppLayout>
        <p className="text-slate-400">Provider not found.</p>
        <Link to="/services" className="mt-4 inline-block text-indigo-400 hover:underline">
          Back to services
        </Link>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Link to="/services" className="text-sm text-indigo-400 hover:underline">
        ← All services
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h1 className="text-3xl font-semibold">{provider.provider.name}</h1>
          {provider.bio && <p className="mt-3 text-slate-400">{provider.bio}</p>}

          <h2 className="mt-8 text-lg font-medium">Services</h2>
          <div className="mt-3 space-y-2">
            {provider.services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedService(service)}
                className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                  selectedService?.id === service.id
                    ? 'border-indigo-500 bg-indigo-600/10'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{service.name}</span>
                  <span className="text-indigo-300">${service.price}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{service.durationMin} min</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Book appointment</h2>
            {!selectedService ? (
              <p className="mt-4 text-slate-400">Select a service to continue.</p>
            ) : (
              <>
                <p className="mt-2 text-sm text-slate-400">
                  Selected: <span className="text-slate-200">{selectedService.name}</span>
                </p>

                <div className="mt-6">
                  <label htmlFor="date" className={labelClass}>Date</label>
                  <input
                    id="date"
                    type="date"
                    value={date}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    max="9999-12-31"
                    onChange={(e) => handleDateChange(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {date && (
                  <div className="mt-6">
                    <p className={`${labelClass} mb-3`}>Available slots</p>
                    <SlotPicker
                      slots={slots}
                      selected={selectedSlot}
                      onSelect={setSelectedSlot}
                      loading={slotsLoading}
                    />
                  </div>
                )}

                {selectedSlot && (
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    className={`${buttonPrimaryClass} mt-6`}
                  >
                    Continue
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Modal open={confirmOpen} title="Confirm booking" onClose={() => setConfirmOpen(false)}>
        {selectedService && selectedSlot && (
          <div className="space-y-4 text-sm text-slate-300">
            <p><strong className="text-slate-100">Service:</strong> {selectedService.name}</p>
            <p><strong className="text-slate-100">Provider:</strong> {provider.provider.name}</p>
            <p>
              <strong className="text-slate-100">Time:</strong>{' '}
              {format(new Date(selectedSlot.startTime), 'PPP p')}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={bookingLoading}
                onClick={handleBook}
                className={buttonPrimaryClass}
              >
                {bookingLoading ? 'Booking…' : 'Confirm booking'}
              </button>
              <button type="button" onClick={() => setConfirmOpen(false)} className={buttonSecondaryClass}>
                Back
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
