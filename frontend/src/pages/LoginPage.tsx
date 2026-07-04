import { AppLayout } from '../components/Layout/AppLayout';
import { LoginForm } from '../components/Auth/LoginForm';

export default function LoginPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-semibold">Login</h1>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <LoginForm />
        </div>
      </div>
    </AppLayout>
  );
}
