import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ABTestProvider } from '@/contexts/ABTestContext';
import { DemoModeProvider } from '@/contexts/DemoModeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProtectedFamilyRoute from '@/components/ProtectedFamilyRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import SeoHead from '@/components/SeoHead';
import DemoModeBanner from '@/components/DemoModeBanner';
import DemoConversionModal from '@/components/modals/DemoConversionModal';
import UpdateNotification from '@/components/UpdateNotification';
import { Toaster } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';

// Lazy Loading Components
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const Auth = lazy(() => import('@/pages/Auth'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));
const Transparency = lazy(() => import('@/pages/legal/Transparency'));

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
const Support = lazy(() => import('@/pages/dashboard/Support'));
const SupportTicketDetail = lazy(() => import('@/pages/dashboard/SupportTicketDetail'));
const AdminSupport = lazy(() => import('@/pages/dashboard/AdminSupport'));
const SharedExpenses = lazy(() => import('@/pages/dashboard/SharedExpenses'));
const Notifications = lazy(() => import('@/pages/dashboard/Notifications'));
const SystemNotifications = lazy(() => import('@/pages/dashboard/SystemNotifications'));
const WebhookInbox = lazy(() => import('@/pages/dashboard/WebhookInbox'));
const Export = lazy(() => import('@/pages/dashboard/Export'));
const EmailPreferences = lazy(() => import('@/pages/dashboard/EmailPreferences'));
const ABTesting = lazy(() => import('@/pages/dashboard/ABTesting'));
const Billing = lazy(() => import('@/pages/dashboard/Billing'));
const AIPlanner = lazy(() => import('@/pages/dashboard/AIPlanner'));
const FutureSelf = lazy(() => import('@/pages/dashboard/FutureSelf'));
const DeepFinance = lazy(() => import('@/pages/dashboard/DeepFinance'));

const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-[#F5F7F9] dark:bg-[#0f0f11]">
    <Loader2 className="w-10 h-10 text-[#1C8FA0] animate-spin" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <ABTestProvider>
            <DemoModeProvider>
              <Router
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true
                }}
              >
                <SeoHead />
                <UpdateNotification />
                <DemoModeBanner />
                <DemoConversionModal />
                <div className="min-h-screen bg-[#F5F7F9] dark:bg-[#0f0f11] font-sans selection:bg-[#1C8FA0]/20 selection:text-[#1C8FA0] transition-colors duration-300">
                  <ErrorBoundary useRouterFallback={true}>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                          <Route path="/legal/transparencia" element={<Transparency />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/login" element={<Navigate to="/auth" replace />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
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
                    <Route path="ai-planner" element={<AIPlanner />} />
                    <Route path="future-self" element={<FutureSelf />} />
                    <Route path="budgets" element={<Budgets />} />
                    <Route path="alerts" element={<Alerts />} />
                    <Route path="family" element={
                      <ProtectedFamilyRoute featureName="Mi Familia">
                        <Family />
                      </ProtectedFamilyRoute>
                    } />
                    <Route path="analysis" element={<Analysis />} />
                    <Route path="deepfinance" element={<DeepFinance />} />
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
                    <Route path="support" element={<Support />} />
                    <Route path="support/:ticketId" element={<SupportTicketDetail />} />
                    <Route path="admin/support" element={<AdminSupport />} />
                    <Route path="admin/system-notifications" element={<SystemNotifications />} />
                    <Route path="admin/webhooks" element={<WebhookInbox />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Route>
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                  <Toaster />
                </div>
              </Router>
            </DemoModeProvider>
          </ABTestProvider>
        </AuthProvider>
      </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
