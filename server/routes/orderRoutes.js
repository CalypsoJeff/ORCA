import { Router } from "express";
import { getAllOrders, getOrderById, getAllOrdersAdmin, getOrderByIdAdmin, cancelOrder, updateOrderStatus } from "../controllers/orderController.js";
import { isLogin } from "../middleware/userAuth.js";

const router = Router();

router.get("/orders/:id", isLogin, getOrderById);
router.get("/orders", isLogin, getAllOrders);
router.patch("/orders/:id/cancel", cancelOrder);

// Order Management
router.get("/orders/admin/all", getAllOrdersAdmin);
router.get("/orders/admin/:id", getOrderByIdAdmin);
router.patch("/orders/admin/:id/status", updateOrderStatus);


export default router;
