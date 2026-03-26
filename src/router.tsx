import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from './ui/RootLayout';
import { Home } from './views/Home';
import { Pharmacies } from './views/Pharmacies';
import { PharmacyDetail } from './views/PharmacyDetail';
import { Cart } from './views/Cart';
import { Checkout } from './views/Checkout';
import { Prescription } from './views/Prescription';
import { PharmacyDashboard } from './views/PharmacyDashboard';
import { Notifications } from './views/Notifications';
import { Login } from './views/Login';
import { Signup } from './views/Signup';
import { PharmacyLogin } from './views/PharmacyLogin';
import { PharmacySignup } from './views/PharmacySignup';
import { AdminLogin } from './views/AdminLogin';
import { AdminDashboard } from './views/AdminDashboard';
import { QuickOrder } from './views/QuickOrder';
import { Orders } from './views/Orders';
import { ErrorPage } from './views/ErrorPage';
import { useAuthStore } from './store/authStore';

// Protected route component for pharmacy dashboard
function ProtectedPharmacyRoute() {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = user !== null;
  const isPharmacy = user?.role === 'pharmacy';

  if (!isAuthenticated) {
    return <Navigate to="/pharmacy/login" replace />;
  }

  if (!isPharmacy) {
    return <Navigate to="/" replace />;
  }

  return <PharmacyDashboard />;
}

// Protected route component for user authentication (ordering)
function ProtectedUserRoute({ children }: { children: React.ReactElement }) {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = user !== null;
  const location = window.location.pathname;

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location)}`} replace />;
  }

  if (user?.role !== 'user') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ProtectedAdminRoute() {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = user !== null;

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <AdminDashboard />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
    
      {
        path: 'pharmacies',
        element: (
          <ProtectedUserRoute>
            <Pharmacies />
          </ProtectedUserRoute>
        )
      },
    
      {
        path: 'pharmacies/:id',
        element: (
          <ProtectedUserRoute>
            <PharmacyDetail />
          </ProtectedUserRoute>
        )
      },
    
      {
        path: 'order/:pharmacyId/:medicineId',
        element: (
          <ProtectedUserRoute>
            <QuickOrder />
          </ProtectedUserRoute>
        )
      },
      { 
        path: 'cart', 
        element: <ProtectedUserRoute><Cart /></ProtectedUserRoute>
      },
      { 
        path: 'checkout', 
        element: <ProtectedUserRoute><Checkout /></ProtectedUserRoute>
      },
      { 
        path: 'prescription', 
        element: <ProtectedUserRoute><Prescription /></ProtectedUserRoute>
      },
      { 
        path: 'orders',
        element: (
          <ProtectedUserRoute>
            <Orders />
          </ProtectedUserRoute>
        )
      },
      { 
        path: 'dashboard', 
        element: <ProtectedPharmacyRoute />
      },
      { 
        path: 'notifications', 
        element: (
          <ProtectedUserRoute>
            <Notifications />
          </ProtectedUserRoute>
        )
      },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'pharmacy/login', element: <PharmacyLogin /> },
      { path: 'pharmacy/signup', element: <PharmacySignup /> },
      { path: 'admin/login', element: <AdminLogin /> },
      { path: 'admin', element: <ProtectedAdminRoute /> },
      { path: '*', element: <ErrorPage /> }
    ]
  }
]);
