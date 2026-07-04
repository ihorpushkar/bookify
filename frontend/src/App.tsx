import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PrivateRoute } from './components/PrivateRoute';
import { RoleRoute } from './components/RoleRoute';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import MyBookingsPage from './pages/MyBookingsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';
import ProviderPage from './pages/ProviderPage';
import RegisterPage from './pages/RegisterPage';
import ServicesPage from './pages/ServicesPage';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/services" replace />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/providers/:id" element={<ProviderPage />} />

      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/services" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/services" replace /> : <RegisterPage />}
      />

      <Route element={<PrivateRoute />}>
        <Route element={<RoleRoute roles={['CLIENT', 'ADMIN']} />}>
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Route>
        <Route element={<RoleRoute roles={['PROVIDER', 'ADMIN']} />}>
          <Route path="/dashboard" element={<ProviderDashboardPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer theme="dark" position="top-right" />
    </BrowserRouter>
  );
}
