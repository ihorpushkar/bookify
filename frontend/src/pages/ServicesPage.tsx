import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { servicesAPI } from '../api/services';
import { AppLayout } from '../components/Layout/AppLayout';
import { EmptyState } from '../components/EmptyState';
import { Skeleton } from '../components/Skeleton';
import type { Service } from '../types';
import { getErrorMessage } from '../utils/errors';
import { showError } from '../utils/toast';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    servicesAPI
      .list(1, 20)
      .then((res) => {
        setServices(res.data.data);
        setLoadError(null);
      })
      .catch((err) => {
        const message = getErrorMessage(err);
        setLoadError(message);
        showError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Services</h1>
        <p className="mt-2 text-slate-400">Browse providers and book an appointment</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : loadError ? (
        <EmptyState
          title="Could not load services"
          description={`${loadError}. Check DATABASE_URL in backend/.env and run: cd backend && npm run dev`}
        />
      ) : services.length === 0 ? (
        <EmptyState title="No services yet" description="Check back later or register as a provider." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-indigo-500/40"
            >
              <h2 className="text-lg font-semibold">{service.name}</h2>
              {service.description && (
                <p className="mt-2 line-clamp-2 text-sm text-slate-400">{service.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-300">{service.provider?.name}</span>
                <span className="font-medium text-indigo-300">${service.price}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{service.durationMin} min</p>
              {service.provider?.id && (
                <Link
                  to={`/providers/${service.provider.id}`}
                  className="mt-4 inline-block text-sm font-medium text-indigo-400 hover:underline"
                >
                  Book now →
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
