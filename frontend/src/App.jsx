import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import Spinner from './components/common/Spinner';

// Eagerly loaded components for fast initial paint
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy loaded components (Code Splitting)
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const Flats = React.lazy(() => import('./pages/admin/Flats'));
const Users = React.lazy(() => import('./pages/admin/Users'));
const Bills = React.lazy(() => import('./pages/admin/Bills'));
const Notices = React.lazy(() => import('./pages/admin/Notices'));
const Complaints = React.lazy(() => import('./pages/admin/Complaints'));

const ResidentDashboard = React.lazy(() => import('./pages/resident/ResidentDashboard'));
const MyBills = React.lazy(() => import('./pages/resident/MyBills'));
const PaymentSuccess = React.lazy(() => import('./pages/resident/PaymentSuccess'));
const PaymentHistory = React.lazy(() => import('./pages/resident/PaymentHistory'));
const Visitors = React.lazy(() => import('./pages/resident/Visitors'));
const ResidentComplaints = React.lazy(() => import('./pages/resident/Complaints'));
const ResidentNotices = React.lazy(() => import('./pages/resident/Notices'));

const GuardDashboard = React.lazy(() => import('./pages/guard/GuardDashboard'));
const Logs = React.lazy(() => import('./pages/guard/Logs'));

const Profile = React.lazy(() => import('./pages/Profile'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size="md" color="primary" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="flats" element={<Flats />} />
            <Route path="users" element={<Users />} />
            <Route path="bills" element={<Bills />} />
            <Route path="notices" element={<Notices />} />
            <Route path="complaints" element={<Complaints />} />
          </Route>

          {/* Resident Routes */}
          <Route path="/resident" element={<ProtectedRoute allowedRoles={['RESIDENT']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<ResidentDashboard />} />
            <Route path="bills" element={<MyBills />} />
            <Route path="payment-success/:billId" element={<PaymentSuccess />} />
            <Route path="payments" element={<PaymentHistory />} />
            <Route path="visitors" element={<Visitors />} />
            <Route path="complaints" element={<ResidentComplaints />} />
            <Route path="notices" element={<ResidentNotices />} />
          </Route>

          {/* Guard Routes */}
          <Route path="/guard" element={<ProtectedRoute allowedRoles={['GUARD']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<GuardDashboard />} />
            <Route path="logs" element={<Logs />} />
          </Route>

          {/* Shared Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'RESIDENT', 'GUARD']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
