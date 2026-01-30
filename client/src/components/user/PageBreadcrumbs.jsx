import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

const PageNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on home
  if (location.pathname === "/" || location.pathname === "/home") return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-700 hover:text-orca-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <span className="h-4 w-px bg-gray-300" />

        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-1 text-gray-700 hover:text-orca-600 transition-colors"
        >
          <Home className="h-4 w-4" />
          <span className="text-sm font-medium">Home</span>
        </button>
      </div>
    </div>
  );
};

export default PageNavBar;
