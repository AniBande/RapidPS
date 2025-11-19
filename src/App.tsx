// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ComplaintForm from "./pages/complaint/ComplaintForm";
import TrackCase from "./pages/complaint/TrackCase";
import EmergencySOS from "./pages/EmergencySOS";
import LawLearning from "./pages/LawLearning";
import SafetyMap from "./pages/SafetyMap";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/complaint/new" element={<ComplaintForm />} />
          <Route path="/complaint/track" element={<TrackCase />} />
          <Route path="/sos" element={<EmergencySOS />} />
          {/* <Route path="/learn" element={<LawLearning />} /> */}

          {/* canonical safety map route */}
          <Route path="/safety-map" element={<SafetyMap />} />

          {/* keep the existing heatmap path but redirect to /safety-map for compatibility */}
          <Route path="/heatmap" element={<Navigate to="/safety-map" replace />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
