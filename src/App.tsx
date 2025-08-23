import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Auth } from "./pages/Auth";
import HostDashboard from "./pages/HostDashboard";
import CreateListing from "./pages/CreateListing";
import GuestDashboard from "./pages/GuestDashboard";
import PropertyDetails from "./pages/PropertyDetails";
import AdminDashboard from "./pages/AdminDashboard";
import ProfileManagement from "./pages/ProfileManagement";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PropertyGuidelines from "./pages/PropertyGuidelines";
import ContactUs from "./pages/ContactUs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/host-dashboard" element={<HostDashboard />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/guest-dashboard" element={<GuestDashboard />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/profile" element={<ProfileManagement />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/guidelines" element={<PropertyGuidelines />} />
            <Route path="/contact" element={<ContactUs />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
