import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={
            <Layout userRole="patient" userName="nandini">
              <Dashboard />
            </Layout>
          } />
          <Route path="/symptom-checker" element={
            <Layout userRole="patient" userName="nandini">
              <SymptomChecker />
            </Layout>
          } />
          <Route path="/mental-health" element={
            <Layout userRole="patient" userName="nandini">
              <MentalHealth />
            </Layout>
          } />
          <Route path="/appointments" element={
            <Layout userRole="patient" userName="nandini">
              <Appointments />
            </Layout>
          } />
          <Route path="/records" element={
            <Layout userRole="patient" userName="nandini">
              <HealthRecords />
            </Layout>
          } />
          <Route path="/education" element={
            <Layout userRole="patient" userName="nandini">
              <EducationHub />
            </Layout>
          } />
          <Route path="/vitals" element={
            <Layout userRole="patient" userName="nandini">
              <Vitals />
            </Layout>
          } />
          
          {/* Doctor Routes */}
          <Route path="/doctor" element={
            <Layout userRole="doctor" userName="Dr. Sarah Johnson">
              <Dashboard />
            </Layout>
          } />
          <Route path="/doctor/consultations" element={
            <Layout userRole="doctor" userName="Dr. Sarah Johnson">
              <Appointments />
            </Layout>
          } />
          <Route path="/doctor/patients" element={
            <Layout userRole="doctor" userName="Dr. Sarah Johnson">
              <HealthRecords />
            </Layout>
          } />
          <Route path="/doctor/schedule" element={
            <Layout userRole="doctor" userName="Dr. Sarah Johnson">
              <DoctorSchedule />
            </Layout>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <Layout userRole="admin" userName="Admin User">
              <Dashboard />
            </Layout>
          } />
          <Route path="/admin/users" element={
            <Layout userRole="admin" userName="Admin User">
              <AdminUsers />
            </Layout>
          } />
          <Route path="/admin/logs" element={
            <Layout userRole="admin" userName="Admin User">
              <AdminLogs />
            </Layout>
          } />

          {/* Settings Routes for all roles */}
          <Route path="/settings" element={
            <Layout userRole="patient" userName="nandini">
              <Settings />
            </Layout>
          } />
          <Route path="/doctor/settings" element={
            <Layout userRole="doctor" userName="Dr. Sarah Johnson">
              <Settings />
            </Layout>
          } />
          <Route path="/admin/settings" element={
            <Layout userRole="admin" userName="Admin User">
              <Settings />
            </Layout>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
