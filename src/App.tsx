import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthCallback } from "./pages/AuthCallback";
import PropertyBrowse from "./pages/PropertyBrowse";
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
import PaymentSuccess from "./pages/PaymentSuccess";
import BecomeHost from "./pages/BecomeHost";
import EditListing from "./pages/EditListing";
import InteractiveMapView from "./components/InteractiveMapView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/browse" element={<PropertyBrowse />} />
            <Route path="/map" element={<InteractiveMapView />} />
            <Route path="/host-dashboard" element={<HostDashboard />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/edit-listing/:id" element={<EditListing />} />
            <Route path="/become-host" element={<BecomeHost />} />
            <Route path="/guest-dashboard" element={<GuestDashboard />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/profile" element={<ProfileManagement />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/guidelines" element={<PropertyGuidelines />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
