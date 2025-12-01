import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Routes, Route } from "react-router-dom";
import { RoleRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
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

export function render(url: string) {
  // Create a new QueryClient for each SSR request
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });

  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <StaticRouter location={url}>
                <AuthProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
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
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/company/:companyId" element={<CompanyProfile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </StaticRouter>
          </TooltipProvider>
        </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
  
  return { html };
}
