import { Route, Routes } from "react-router-dom";
import Home from "../../pages/user/Home";
import AdminLogin from "../../pages/admin/Login";
import AdminRegister from "../../pages/admin/Register";
import VerifyOtpPage from "../../pages/admin/Otp-Verify";
import Dashboard from "../../pages/admin/Dashboard";
import Competitions from "../../pages/admin/Competitions";
import Fitness from "../../pages/admin/Fitness";
import Trekking from "../../pages/admin/Trekking";
import Category from "../../pages/admin/Category";
import Product from "../../pages/admin/Product";
import UserList from "../../pages/admin/UserList";
import { NotFoundPage } from "../../components/ui/404-page-not-found";
import PendingApproval from "../../pages/admin/PendingApproval";
import AdminRequests from "../../pages/admin/AdminRequests";
import OrdersList from "../../pages/admin/OrdersList";
import OrderDetails from "../../pages/admin/OrderDetails";
import GymRequests from "../../pages/admin/GymRequests";
// import UserPrivateRoutes from "./UserPrivateRoutes";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/pending-approval" element={<PendingApproval />} />
      <Route path="/requests" element={<AdminRequests />} />
      <Route path="/register" element={<AdminRegister />} />
      <Route path="/otp" element={<VerifyOtpPage />} />
      <Route path="*" element={<NotFoundPage />} />
      {/* Private Routes */}
      <Route path="/" element={<Home />} />
      {/* <Route path="/profile" element={<Profile />} /> */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/competitions" element={<Competitions />} />
      <Route path="/fitness" element={<Fitness />} />
      <Route path="/trekking" element={<Trekking />} />
      <Route path="/category" element={<Category />} />
      <Route path="/products" element={<Product />} />
      <Route path="/userlist" element={<UserList />} />
      <Route path="/orders" element={<OrdersList />} />
      <Route path="/orders/:id" element={<OrderDetails />} />
      <Route path="/admin/gym-requests" element={<GymRequests />} />
    </Routes>
  );
};

export default AdminRoutes;
