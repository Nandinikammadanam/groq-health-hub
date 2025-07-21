import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import SymptomChecker from "./pages/SymptomChecker";
import MentalHealth from "./pages/MentalHealth";
import Appointments from "./pages/Appointments";
import HealthRecords from "./pages/HealthRecords";
import EducationHub from "./pages/EducationHub";
import NotFound from "./pages/NotFound";
import Vitals from "./pages/Vitals";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DoctorSchedule from "./pages/DoctorSchedule";
import AdminUsers from "./pages/AdminUsers";
import AdminLogs from "./pages/AdminLogs";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, profile, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-health-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const { initialize } = useAuth();
  
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Patient Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <Layout userRole="patient" userName="Patient">
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/symptom-checker" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <Layout userRole="patient" userName="Patient">
                  <SymptomChecker />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/mental-health" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <Layout userRole="patient" userName="Patient">
                  <MentalHealth />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/appointments" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <Layout userRole="patient" userName="Patient">
                  <Appointments />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/records" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <Layout userRole="patient" userName="Patient">
                  <HealthRecords />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/education" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <Layout userRole="patient" userName="Patient">
                  <EducationHub />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/vitals" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <Layout userRole="patient" userName="Patient">
                  <Vitals />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Doctor Routes */}
            <Route path="/doctor" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <Layout userRole="doctor" userName="Doctor">
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/doctor/schedule" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <Layout userRole="doctor" userName="Doctor">
                  <DoctorSchedule />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/doctor/patients" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <Layout userRole="doctor" userName="Doctor">
                  <HealthRecords />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout userRole="admin" userName="Admin">
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout userRole="admin" userName="Admin">
                  <AdminUsers />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/logs" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout userRole="admin" userName="Admin">
                  <AdminLogs />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Settings Routes for all authenticated users */}
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout userRole="patient" userName="User">
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;