import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { RoleRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CandidateDashboard from "./pages/CandidateDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import AboutUs from "./pages/AboutUs";
import NotFound from "./pages/NotFound";
import PostJobPage from "./pages/PostJobPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import CompanyProfile from "./pages/CompanyProfile";
import CompanyOnboarding from "./pages/CompanyOnboarding";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Dashboard Routes */}
          <Route
            path="/dashboard/candidate"
            element={
              <RoleRoute allowedRole="candidate">
                <CandidateDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/employer"
            element={
              <RoleRoute allowedRole="employer">
                <EmployerDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/employer/onboarding"
            element={
              <RoleRoute allowedRole="employer">
                <CompanyOnboarding />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/employer/post-job"
            element={
              <RoleRoute allowedRole="employer">
                <PostJobPage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard/employer/post-job/:jobId"
            element={
              <RoleRoute allowedRole="employer">
                <PostJobPage />
              </RoleRoute>
            }
          />

          {/* Legal Pages */}
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<AboutUs />} />
          
          {/* Company Profile */}
          <Route path="/company/:companyId" element={<CompanyProfile />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
