import express from 'express';
import multer from 'multer';
import adminController from '../controllers/adminController.js';
import categoryController from '../controllers/categoryController.js';
import productController from '../controllers/productController.js';
import competitionController from '../controllers/competitionController.js';
import trekkingController from '../controllers/trekkingController.js';
import fitnessController from '../controllers/fitnessController.js';
import gymOwnerController from '../controllers/gymOwnerController.js';
import { verifyAdmin } from '../middleware/adminAuth.js';

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

// ---------------------- Gym Owner Management ----------------------
router.get('/gym-owners/pending', verifyAdmin, gymOwnerController.getPendingGymOwners);
router.get('/gym-owners/:id', verifyAdmin, gymOwnerController.getGymOwnerById);
router.patch('/gym-owners/:id/approve', verifyAdmin, gymOwnerController.approveGymOwner);
router.patch('/gym-owners/:id/reject', verifyAdmin, gymOwnerController.rejectGymOwner);

// Competitions
router.get('/competitions', competitionController.loadCompetitionsPage);
router.post('/add-Competitions', uploads, competitionController.addCompetition);
router.put('/edit-competition/:id', uploads, competitionController.editCompetition);
router.delete('/delete-competition/:id', competitionController.deleteCompetition);

// Trekking
router.get('/trekking', trekkingController.loadTrekkingPage);
router.post('/add-trekking', upload, trekkingController.addTrekking);
router.put('/edit-trekking/:id', upload, trekkingController.editTrekking);
router.delete('/delete-trekking/:id', trekkingController.deleteTrekking);
//Product-Category Management
router.post('/add-product-category', categoryController.addProductCategory);
router.get('/product-categories', categoryController.getAllProductCategories);
router.put('/edit-product-categories/:categoryId', categoryController.editProductCategory);
router.patch('/product-categories-toggle/:categoryId/status', categoryController.toggleProductCategoryStatus);

// Product Management
router.get('/products', productController.loadProductsPage);
router.post('/add-product', uploads, productController.addProduct);
router.put('/edit-product/:id', uploads, productController.editProduct);
router.put('/product/:productId/status', productController.changeProductStatus);

// User Management
router.get('/users', adminController.getUsers);
router.patch('/user/block', adminController.blockUser);
router.patch('/user/unblock', adminController.unblockUser);

// Fitness
router.post('/add-fitness', fitnessController.addFitness);
router.post('/add-fitness-category', fitnessController.addFitnessCategory);


export default router;
