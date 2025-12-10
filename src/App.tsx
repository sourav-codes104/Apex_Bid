import { useEffect } from "react";
import axios from "@/lib/axios";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Auctions from "./pages/Auctions";
import LiveAuction from "./pages/LiveAuction";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AddProperty from "./pages/AddProperty";
import PaymentSuccess from "./pages/PaymentSuccess";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";

const queryClient = new QueryClient();

function App() {
  const loadUserFromStorage = useAuthStore((state) => state.loadUserFromStorage);

  useEffect(() => {
    loadUserFromStorage();

    axios
      .get("/api/health")
      .then((res) => console.log("Flask Backend Response:", res.data))
      .catch((err) => console.error("Error connecting to Flask:", err));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Index />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/auctions" element={<Auctions />} />

            {/* LIVE AUCTION ROUTE */}
            <Route path="/auction/live/:id" element={<LiveAuction />} />

            {/* PAYMENT SUCCESS */}
            <Route path="/payment-success" element={<PaymentSuccess />} />

            {/* PROTECTED ROUTES */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-property"
              element={
                <ProtectedRoute>
                  <AddProperty />
                </ProtectedRoute>
              }
            />

            {/* AUTH */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* NOT FOUND */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
