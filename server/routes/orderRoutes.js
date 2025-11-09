import { Router } from "express";
import { getAllOrders, getOrderById, getAllOrdersAdmin, getOrderByIdAdmin } from "../controllers/orderController.js";
import { isLogin } from "../middleware/userAuth.js";

const router = Router();

router.get("/orders/:id", isLogin, getOrderById);
router.get("/orders", isLogin, getAllOrders);
// Order Management
router.get("/orders/admin/all", getAllOrdersAdmin);
router.get("/orders/admin/:id", getOrderByIdAdmin);


export default router;
