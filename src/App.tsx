import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Bookings } from './pages/Bookings';
import { Guests } from './pages/Guests';
import { Properties } from './pages/Properties';
import { Rooms } from './pages/Rooms';
import { Payments } from './pages/Payments';
import { Reviews } from './pages/Reviews';
import { RatePlans } from './pages/RatePlans';
import { Reports } from './pages/Reports';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors theme="dark" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="guests" element={<Guests />} />
          <Route path="properties" element={<Properties />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="rate-plans" element={<RatePlans />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
