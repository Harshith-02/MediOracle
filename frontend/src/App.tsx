import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

import { Login } from './pages/auth/Login';
import { FacilityDashboard } from './pages/facility/FacilityDashboard';
import { ShiftCreator } from './pages/facility/ShiftCreator';
import { ShiftDetail } from './pages/facility/ShiftDetail';
import { ProfessionalDashboard } from './pages/professional/ProfessionalDashboard';
import { TimesheetManager } from './pages/timekeeping/TimesheetManager';
import { BillingLedger } from './pages/finance/BillingLedger';
import { OperationalAnalytics } from './pages/admin/OperationalAnalytics';
import { AuditTrail } from './pages/admin/AuditTrail';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading, activeRole } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono">
        Initializing MediOracle Platform...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <Routes>
            {/* Facility Routes */}
            <Route path="/facility/dashboard" element={<FacilityDashboard />} />
            <Route path="/facility/wards" element={<FacilityDashboard />} />
            <Route path="/facility/shifts" element={<FacilityDashboard />} />
            <Route path="/facility/shifts/new" element={<ShiftCreator />} />
            <Route path="/facility/shifts/:id" element={<ShiftDetail />} />
            <Route path="/facility/matching" element={<ShiftDetail />} />
            <Route path="/facility/timesheets" element={<TimesheetManager />} />
            <Route path="/facility/invoices" element={<BillingLedger />} />
            <Route path="/facility/budgets" element={<OperationalAnalytics />} />

            {/* Professional Routes */}
            <Route path="/professional/dashboard" element={<ProfessionalDashboard />} />
            <Route path="/professional/shifts" element={<ProfessionalDashboard />} />
            <Route path="/professional/bookings" element={<ProfessionalDashboard />} />
            <Route path="/professional/credentials" element={<ProfessionalDashboard />} />
            <Route path="/professional/earnings" element={<BillingLedger />} />

            {/* Admin Routes */}
            <Route path="/admin/analytics" element={<OperationalAnalytics />} />
            <Route path="/admin/forecast" element={<OperationalAnalytics />} />
            <Route path="/admin/what-if" element={<OperationalAnalytics />} />
            <Route path="/admin/audit" element={<AuditTrail />} />
            <Route path="/admin/integrations" element={<OperationalAnalytics />} />

            {/* Compliance Routes */}
            <Route path="/compliance/dashboard" element={<OperationalAnalytics />} />
            <Route path="/compliance/credentials" element={<TimesheetManager />} />
            <Route path="/compliance/verifications" element={<AuditTrail />} />

            {/* Payroll Routes */}
            <Route path="/payroll/timesheets" element={<TimesheetManager />} />
            <Route path="/payroll/payments" element={<BillingLedger />} />
            <Route path="/payroll/reconciliation" element={<BillingLedger />} />

            {/* Support Routes */}
            <Route path="/support/cases" element={<OperationalAnalytics />} />
            <Route path="/support/kb" element={<OperationalAnalytics />} />

            {/* Default Fallback Redirect */}
            <Route
              path="*"
              element={
                activeRole === 'PROFESSIONAL' ? (
                  <Navigate to="/professional/dashboard" replace />
                ) : activeRole === 'ADMIN' ? (
                  <Navigate to="/admin/analytics" replace />
                ) : (
                  <Navigate to="/facility/dashboard" replace />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </BrowserRouter>
  );
};
