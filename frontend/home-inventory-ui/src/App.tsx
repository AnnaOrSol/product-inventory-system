import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Settings from "@/pages/Settings";
import InventoryRequirementsPage from "./pages/InventoryRequirementsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/requirements" element={<InventoryRequirementsPage />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
