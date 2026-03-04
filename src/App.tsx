import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "@/components/Layout";
import QAPasswordGate from "@/components/QAPasswordGate";
import GuideHome from "./pages/Index";
import BotHome from "./pages/BotHome";
import ContentPage from "./pages/ContentPage";
import QAHome from "./pages/QAHome";
import QABotPage from "./pages/QABotPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<GuideHome />} />
                <Route path="/guide/:botId" element={<BotHome />} />
                <Route path="/guide/:botId/:pageSlug" element={<ContentPage />} />
                <Route path="/qa" element={<QAHome />} />
                <Route path="/qa/:botId" element={<QABotPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
