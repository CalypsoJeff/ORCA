import { Route, Routes } from "react-router-dom";
import Home from "../../pages/user/Home";
import Login from "../../pages/user/Login";
import UserPrivateRoutes from "./UserPrivateRoutes";
import Register from "../../pages/user/Register";
import AboutPage from "../../pages/user/AboutUs";
import Otp from "../../pages/user/Otp";
import Fitness from "../../pages/user/Fitness";
import LandingPage from "../../pages/user/LandingPage";
import Products from "../../pages/user/Products";
import Competitions from "../../pages/user/Competitions";
import ProductDetails from "../../pages/user/ProductDetails";
import Trekkings from "../../pages/user/Trekkings";
import Carts from "../../pages/user/Carts";
import CompetitionDetail from "../../pages/user/CompetitionDetail";
import PaymentConfirmation from "../../pages/user/PaymentConfirmation";
import UserProfile from "../../pages/user/UserProfile";
// import Rides from "../../pages/user/Rides";
import { NotFoundPage } from "../../components/ui/404-page-not-found";
import CheckoutPage from "../../pages/user/CheckOutPage";
import RidersPage from "../../pages/user/RidersPage";

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/otp" element={<Otp />} />
      <Route path="/fitness" element={<Fitness />} />

      {/* Private Routes */}
      <Route element={<UserPrivateRoutes />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/fitness" element={<Fitness />} />
        <Route path="/shop" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<CheckoutPage/>}/>
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/competition/:id" element={<CompetitionDetail />} />
        <Route
          path="/competition/:id/payment-confirmation"
          element={<PaymentConfirmation />}
        />
        <Route path="/trekking" element={<Trekkings />} />
        <Route path="/cart" element={<Carts />} />
        <Route path="/rides" element={<RidersPage/>}/>
        <Route path="*" element={<NotFoundPage />} />

      </Route>
    </Routes>
  );
};

export default UserRoutes;
