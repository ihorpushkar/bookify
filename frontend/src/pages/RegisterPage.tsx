import { AppLayout } from '../components/Layout/AppLayout';
import { RegisterForm } from '../components/Auth/RegisterForm';

export default function RegisterPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-semibold">Create account</h1>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <RegisterForm />
        </div>
      </div>
    </AppLayout>
  );
}
