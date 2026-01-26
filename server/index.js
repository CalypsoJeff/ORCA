import express from 'express';
import path from 'path';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import paymentRoutes from "./routes/paymentRoutes.js";
import { dbConnect } from './config/DB.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import gymOwnerRoutes from './routes/gymOwnerRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import memberExerciseRoutes from './routes/memberExerciseRoutes.js';
import memberChallengeRoutes from './routes/memberChallengeRoutes.js';
import { ensureSuperAdminExists } from './controllers/adminController.js';
import { startOrderCleanupJob } from './helper/orderCleanup.js';
import fs from 'fs';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3030;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(cors({
  origin: ["http://localhost:5173", "https://orca-dusky.vercel.app", "https://orcasportsclub.in", "https://www.orcasportsclub.in"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

const distPath = path.join(__dirname, "..", "client", "dist");

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  console.warn("⚠️ Frontend dist not found at:", distPath);
}

// Routes
app.use("/api/user", userRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", addressRoutes);
app.use("/api/user/exercises", memberExerciseRoutes);
app.use("/api/user/challenges", memberChallengeRoutes);
app.use("/api/gym-owner", gymOwnerRoutes);
app.use("/api/fitness/exercises", exerciseRoutes);
app.use("/api/fitness/challenges", challengeRoutes);

startOrderCleanupJob();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

dbConnect();
await ensureSuperAdminExists();

