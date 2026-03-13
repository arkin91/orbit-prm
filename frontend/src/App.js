import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import { initializeData } from "@/lib/data";
import Dashboard from "@/pages/Dashboard";
import MyNetwork from "@/pages/MyNetwork";
import ContactDetail from "@/pages/ContactDetail";
import AddContact from "@/pages/AddContact";
import LinkedApps from "@/pages/LinkedApps";
import ImportReview from "@/pages/ImportReview";
import ManualReview from "@/pages/ManualReview";
import Activity from "@/pages/Activity";
import Profile from "@/pages/Profile";

function App() {
  useEffect(() => {
    initializeData();
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/network" element={<MyNetwork />} />
            <Route path="/contact/:id" element={<ContactDetail />} />
            <Route path="/add-contact" element={<AddContact />} />
            <Route path="/linked-apps" element={<LinkedApps />} />
            <Route path="/import-review" element={<ImportReview />} />
            <Route path="/manual-review" element={<ManualReview />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" richColors />
    </TooltipProvider>
  );
}

export default App;
