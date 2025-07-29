import express from "express";
import userController from "../controllers/userController.js";
import { isLogin } from "../middleware/userAuth.js";
import addressController from "../controllers/addressController.js";
const router = express.Router();

router.post("/login", userController.loginUser);
router.post("/register", userController.registerUser);
router.post("/verify-otp", userController.verifyOtpAndRegister);
router.post("/resend-otp", userController.resendOtp);
router.get("/addresses", isLogin, addressController.loadAddressPage);
router.post("/add-address", isLogin, addressController.addAddress);
router.post("/delete-address", isLogin, addressController.deleteAddress);
router.post("/edit-address", isLogin, addressController.editAddress);

// Competitions
router.get("/competitions", userController.loadCompetitionsPage);
router.get("/competition-Details/:competitionId", userController.loadCompetitionDetailsPage);
router.post("/registerForCompetition", userController.registerForCompetition);
router.get("/showPaymentConfirmation/:competitionId", userController.showPaymentConfirmation);
router.post("/create-order", userController.createRazorpayCompetition);

// Products
router.get("/products", userController.loadProducts);
router.get("/shop-products", userController.loadShopProducts);
router.get("/products/:id", userController.loadProductDetails);
router.post("/cart", isLogin, userController.addToCart);
router.get("/cart", isLogin, userController.loadCart);
router.put('/cart', isLogin, userController.updateCart);

// Trekking
router.get("/trekkings", userController.loadTrekking);

// User Profile
router.put("/updateProfile", userController.updateUserProfile);

export default router;
