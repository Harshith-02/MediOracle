import React, { useEffect, useState } from 'react';
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('medioracle_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('medioracle_sidebar_collapsed', String(next));
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/25 animate-pulse">
            M
          </div>
          <span className="text-xs text-cyan-400 font-medium">Initializing MediOracle Platform...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-950 text-slate-100 antialiased">
      {/* 1. SEPARATE FULL-HEIGHT NAVIGATION SIDEBAR */}
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* 2. MAIN WEBSITE & WORKSPACE CONTAINER */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#070b14] relative">
        {/* Main Website Header */}
        <Header isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

        {/* Scrollable Main Website Canvas */}
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.06),rgba(2,6,23,0))]">
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