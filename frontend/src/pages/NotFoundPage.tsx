import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="mt-2 text-slate-400">Page not found</p>
      <Link to="/services" className="mt-6 inline-block text-indigo-400 hover:underline">
        Back to services
      </Link>
    </div>
  );
}
