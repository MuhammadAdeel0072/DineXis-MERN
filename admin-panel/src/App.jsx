import React from 'react';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
import OrderManagement from './pages/OrderManagement';
import ReservationManagement from './pages/ReservationManagement';
import PaymentManagement from './pages/PaymentManagement';
import UserManagement from './pages/UserManagement';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || !CLERK_PUBLISHABLE_KEY;

function App() {
  // Development mode: bypass Clerk authentication
  if (DEV_MODE) {
    return (
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/menu" element={<MenuManagement />} />
              <Route path="/orders" element={<OrderManagement />} />
              <Route path="/reservations" element={<ReservationManagement />} />
              <Route path="/payments" element={<PaymentManagement />} />
              <Route path="/users" element={<UserManagement />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    );
  }

  // Production mode: use Clerk authentication
  if (!CLERK_PUBLISHABLE_KEY) {
    return <div className="text-center p-10 text-red-500">Missing Clerk Publishable Key</div>;
  }

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <BrowserRouter>
          <SignedIn>
            <Routes>
              <Route element={<AdminLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/menu" element={<MenuManagement />} />
                <Route path="/orders" element={<OrderManagement />} />
                <Route path="/reservations" element={<ReservationManagement />} />
                <Route path="/payments" element={<PaymentManagement />} />
                <Route path="/users" element={<UserManagement />} />
              </Route>
            </Routes>
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </BrowserRouter>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

export default App;
