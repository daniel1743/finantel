
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ABTestProvider } from '@/contexts/ABTestContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProtectedFamilyRoute from '@/components/ProtectedFamilyRoute';
import SeoHead from '@/components/SeoHead';
import { Toaster } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';

// Lazy Loading Components
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const Auth = lazy(() => import('@/pages/Auth'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));

const DashboardLayout = lazy(() => import('@/pages/Dashboard'));
const DashboardHome = lazy(() => import('@/pages/dashboard/DashboardHome'));
const Overview = lazy(() => import('@/pages/dashboard/Overview'));
const Transactions = lazy(() => import('@/pages/dashboard/Transactions'));
const Categories = lazy(() => import('@/pages/dashboard/Categories'));
const Goals = lazy(() => import('@/pages/dashboard/Goals'));
const Predictions = lazy(() => import('@/pages/dashboard/Predictions'));
const Profile = lazy(() => import('@/pages/dashboard/Profile'));
const AIAssistant = lazy(() => import('@/pages/dashboard/AIAssistant'));
const Budgets = lazy(() => import('@/pages/dashboard/Budgets'));
const Alerts = lazy(() => import('@/pages/dashboard/Alerts'));
const Family = lazy(() => import('@/pages/dashboard/Family'));
const Analysis = lazy(() => import('@/pages/dashboard/Analysis'));
const SharedExpenses = lazy(() => import('@/pages/dashboard/SharedExpenses'));
const Notifications = lazy(() => import('@/pages/dashboard/Notifications'));
const Export = lazy(() => import('@/pages/dashboard/Export'));
const EmailPreferences = lazy(() => import('@/pages/dashboard/EmailPreferences'));
const ABTesting = lazy(() => import('@/pages/dashboard/ABTesting'));
const Billing = lazy(() => import('@/pages/dashboard/Billing'));

const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-[#F5F7F9] dark:bg-[#0f0f11]">
    <Loader2 className="w-10 h-10 text-[#1C8FA0] animate-spin" />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ABTestProvider>
          <Router>
            <SeoHead />
            <div className="min-h-screen bg-[#F5F7F9] dark:bg-[#0f0f11] font-sans selection:bg-[#1C8FA0]/20 selection:text-[#1C8FA0] transition-colors duration-300">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  
                  {/* Protected Dashboard Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<DashboardHome />} />
                    <Route path="overview" element={<Overview />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="goals" element={<Goals />} />
                    <Route path="predictions" element={<Predictions />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="billing" element={<Billing />} />
                    <Route path="ai-assistant" element={<AIAssistant />} />
                    <Route path="budgets" element={<Budgets />} />
                    <Route path="alerts" element={<Alerts />} />
                    <Route path="family" element={
                      <ProtectedFamilyRoute featureName="Mi Familia">
                        <Family />
                      </ProtectedFamilyRoute>
                    } />
                    <Route path="analysis" element={<Analysis />} />
                    <Route path="shared" element={
                      <ProtectedFamilyRoute featureName="Gastos Compartidos">
                        <SharedExpenses />
                      </ProtectedFamilyRoute>
                    } />
                    <Route path="debts" element={
                      <ProtectedFamilyRoute featureName="Gestión de Deudas">
                        <div>Deudas - Próximamente</div>
                      </ProtectedFamilyRoute>
                    } />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="export" element={<Export />} />
                    <Route path="email-preferences" element={<EmailPreferences />} />
                    <Route path="ab-testing" element={<ABTesting />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Route>
                </Routes>
              </Suspense>
              <Toaster />
            </div>
          </Router>
        </ABTestProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
