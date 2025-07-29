import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button"; // Adjust the path as needed

const PendingApproval = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white shadow-lg p-8 rounded-lg text-center max-w-md">
        <h2 className="text-2xl font-semibold text-yellow-600 mb-4">
          Pending Approval
        </h2>
        <p className="mb-6 text-gray-700">
          Your admin account is awaiting approval by the super admin. You will
          be notified once approved.
        </p>
        <Button variant="outline" onClick={() => navigate("/admin/login")}>
          Back to Login
        </Button>
      </div>
    </div>
  );
};

export default PendingApproval;
