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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
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
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <Layout userRole="admin" userName="Admin User">
              <Dashboard />
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
