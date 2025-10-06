import { Router } from "express";
import { getOrderById } from "../controllers/orderController.js";
import { isLogin } from "../middleware/userAuth.js";

const router = Router();

router.get("/orders/:id", isLogin, getOrderById);

export default router;
