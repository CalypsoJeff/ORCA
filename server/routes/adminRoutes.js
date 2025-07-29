import express from 'express';
import multer from 'multer';
import adminController from '../controllers/adminController.js';
const router = express.Router();
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

const uploads = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 },
}).array("images", 5);

// Auth routes
router.post('/login', adminController.adminLogin);
router.post('/register', adminController.registerAdmin);
router.post('/verify-otp', adminController.verifyOtp);
router.post('/resend-otp', adminController.resendOTP);
router.get('/pending-admin-requests', adminController.getPendingAdminRequests);
router.patch('/approve-admin-request/:id', adminController.approveAdminRequest);
router.patch('/reject-admin-request/:id', adminController.rejectAdminRequest);

// Competitions
router.get('/competitions', adminController.loadCompetitionsPage);
router.post('/add-Competitions', uploads, adminController.addCompetition);
router.put('/edit-competition/:id', uploads, adminController.editCompetition);
router.delete('/delete-competition/:id', adminController.deleteCompetition);

// Trekking
router.get('/trekking', adminController.loadTrekkingPage);
router.post('/add-trekking', upload, adminController.addTrekking);
router.put('/edit-trekking/:id', upload, adminController.editTrekking);
router.delete('/delete-trekking/:id', adminController.deleteTrekking);

// Product Management
router.get('/products', adminController.loadProductsPage);
router.post('/add-product-category', adminController.addProductCategory);
router.get('/product-categories', adminController.getAllProductCategories);
router.put('/edit-product-categories/:categoryId', adminController.editProductCategory);
router.patch('/product-categories-toggle/:categoryId/status', adminController.toggleProductCategoryStatus);
router.post('/add-product', uploads, adminController.addProduct);
router.put('/edit-product/:id', uploads, adminController.editProduct);
router.put('/product/:productId/status', adminController.changeProductStatus);

// User Management
router.get('/users', adminController.getUsers);
router.patch('/user/block', adminController.blockUser);
router.patch('/user/unblock', adminController.unblockUser);

// Fitness
router.post('/add-fitness', adminController.addFitness);
router.post('/add-fitness-category', adminController.addFitnessCategory);

export default router;
