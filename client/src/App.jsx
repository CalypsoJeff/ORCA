import "./App.css";
import { Routes, Route } from "react-router-dom";
import UserRoutes from "./routes/userRoutes/UserRoutes";
import AdminRoutes from "./routes/adminRoutes/AdminRoutes";

function App() {
  return (
    <div className="min-h-screen overflow-x-hidden overflow-y-auto">
      <Routes>
        <Route path="/*" element={<UserRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </div>
  );
}

export default App;
