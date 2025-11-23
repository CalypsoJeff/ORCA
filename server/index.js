import express from 'express';
import path from 'path';
import session from 'express-session';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import paymentRoutes from "./routes/paymentRoutes.js";
import { dbConnect } from './config/DB.js'; // Assuming DB.js has a named export `dbConnect`
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


dotenv.config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);
const app = express();
const PORT = process.env.PORT || 3030;

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://orca-dusky.vercel.app"],
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

// Serve static React build
app.use(express.static(path.join(__dirname, "client/build")));

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


// React SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);

});

// Connect to DB
dbConnect();

await ensureSuperAdminExists();

