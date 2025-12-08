import bcrypt from 'bcrypt';
import { generateOTP, sendOTP } from "../helper/twiloOtp.js";
import User from '../models/userModel.js';
import Competition from '../models/competitionsModel.js';
import Trekking from '../models/trekkingModel.js';
import products from '../models/productModel.js';
import Cart from '../models/cartModel.js';
import { generateResetToken, generateToken, validateResetToken } from '../helper/jwtHelper.js';
import Product from '../models/productModel.js';
import admin from "../config/firebaseAdmin.js";
import Exercise from "../models/exerciseModel.js";
import Challenge from "../models/challengeModel.js";
import TempUser from "../models/tempUser.js";
import TempCompetitionRegistration from "../models/tempCompetitionRegistration.js";


const loginUser = async (req, res) => {
  try {
    console.log("User login started");
    const { phone, password } = req.body;
    // Validate input
    if (!phone || !password) {
      return res.status(400).json({ error: "Phone and password are required." });
    }

    // Find user by phone and select the password explicitly
    const user = await User.findOne({ phone }).select('+password');

    if (!user) {
      return res.status(401).json({ error: "User not found. Please register first." });
    }

    // Check if the user is banned
    if (user.status === 'Banned') {
      return res.status(403).json({ message: "Your account is banned. Please contact support." });
    }

    // Ensure user has a password before comparing
    if (!user.password) {
      return res.status(500).json({ error: "Password not found. Try resetting your password." });
    }

    // Compare hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Invalid credentials. Please try again." });
    }

    // Generate JWT tokens
    const { token, refreshToken } = generateToken(user._id, user.phone, "user");

    console.log("User login successful");

    // Convert Mongoose document to plain object
    const userData = user.toObject();

    // Remove password field
    delete userData.password;

    // Send response
    res.status(200).json({
      message: "Login successful!",
      token,
      refreshToken,
      user: userData,
    });

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "An error occurred during login. Please try again later." });
  }
};
// Register User and Send OTP
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone)
      return res.status(400).json({ error: "All fields required" });

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser)
      return res.status(400).json({ error: "Email or Phone already registered." });

    const otp = generateOTP();

    await TempUser.findOneAndUpdate(
      { phone },
      {
        name,
        email,
        phone,
        password,
        otp,
        otpExpiresAt: Date.now() + 5 * 60 * 1000
      },
      { upsert: true }
    );

    await sendOTP(phone, otp);

    return res.status(200).json({ message: "OTP sent successfully." });

  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "Missing Google ID token" });

    // ✅ Verify the token using Firebase Admin
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decoded;

    if (!email) {
      return res.status(400).json({ error: "Email not available from Google" });
    }

    // 🔍 Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: null,
        phone: "",
        provider: "google",
        avatar: picture,
        status: "Active",
      });
    } else if (user.status === "Banned") {
      return res.status(403).json({ message: "Your account is banned. Please contact support." });
    }

    // 🪙 Generate JWT tokens for your app
    const { token, refreshToken } = generateToken(user._id, user.phone, "user");

    res.status(200).json({
      message: "Google Auth successful",
      token,
      refreshToken,
      user,
    });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ error: "Invalid or expired Firebase ID token" });
  }
};
const verifyOtpAndRegister = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const temp = await TempUser.findOne({ phone });

    if (!temp)
      return res.status(400).json({ error: "OTP expired. Please register again." });

    if (temp.otp !== otp)
      return res.status(400).json({ error: "Invalid OTP" });

    if (temp.otpExpiresAt < Date.now())
      return res.status(400).json({ error: "OTP expired. Try again" });

    const hashedPassword = await bcrypt.hash(temp.password, 10);

    const newUser = await User.create({
      name: temp.name,
      email: temp.email,
      password: hashedPassword,
      phone: temp.phone,
    });

    await TempUser.deleteOne({ phone });

    const { token, refreshToken } = generateToken(newUser._id, newUser.phone, "user");

    return res.status(201).json({
      message: "Registration successful",
      token,
      refreshToken,
      newUser,
    });

  } catch (error) {
    console.error("OTP verification failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Resend OTP
const resendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    const temp = await TempUser.findOne({ phone });

    if (!temp)
      return res.status(400).json({ error: "Data expired. Register again." });

    const otp = generateOTP();

    temp.otp = otp;
    temp.otpExpiresAt = Date.now() + 5 * 60 * 1000;
    await temp.save();

    await sendOTP(phone, otp);

    return res.status(200).json({ message: "OTP resent successfully." });

  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const loadHomePage = async (req, res) => {
  try {
    // Get logged-in user details from the request (assuming token is validated elsewhere)
    const user = req.user;  // Assuming user is attached to the request after token verification
    if (!user) {
      return res.status(401).json({ error: 'User not logged in' });
    }
    // Fetch all products, sorted by creation date (latest first)
    const allProducts = await products.find().sort({ createdAt: -1 });
    // Fetch all competitions, sorted by creation date (latest first)
    const allCompetitions = await competitions.find().sort({ createdAt: -1 });
    // Send the response with products, competitions, and logged-in user details
    res.status(200).json({
      message: 'Welcome to the Home Page!',
      user,
      products: allProducts,
      competitions: allCompetitions,
    });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.status(500).json({ error: 'An error occurred while loading the home page.' });
  }
};

const loadCompetitionsPage = async (req, res) => {
  try {
    const competitions = await Competition.find({ status: 'active' }).sort({ date: -1 });
    if (!competitions || competitions.length === 0) {
      return res.status(200).json({
        message: 'No competitions available at the moment.',
        competitions: [],
      });
    }
    return res.status(200).json({
      message: 'Competitions loaded successfully.',
      competitions,
    });
  } catch (error) {
    console.error('Error loading competitions page:', error);
    return res.status(500).json({
      message: 'An error occurred while loading competitions.',
      error: error.message,
    });
  }
};

const loadCompetitionDetailsPage = async (req, res) => {
  try {
    const { competitionId } = req.params; // Get competition ID from URL parameters
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({
        message: 'Competition not found.',
      });
    }
    return res.status(200).json({
      message: 'Competition details loaded successfully.',
      competition,
    });
  } catch (error) {
    console.error('Error loading competition details:', error);
    return res.status(500).json({
      message: 'An error occurred while loading competition details.',
      error: error.message,
    });
  }
};

const registerForCompetition = async (req, res) => {
  try {
    const { competitionId, name, email, phone, userId } = req.body;

    const competition = await Competition.findById(competitionId);
    if (!competition || competition.status !== "active")
      return res.status(404).json({ error: "Competition not found or inactive" });

    await TempCompetitionRegistration.findOneAndUpdate(
      { userId, competitionId },
      { userId, competitionId, name, email, phone },
      { upsert: true }
    );

    return res.status(200).json({ message: "Proceed to payment", competition });

  } catch (error) {
    console.error("Competition registration failed:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const showPaymentConfirmation = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { userId } = req.body;

    const reg = await TempCompetitionRegistration.findOne({ userId, competitionId });

    if (!reg)
      return res.status(400).json({ error: "Registration expired" });

    const competition = await Competition.findById(competitionId);

    return res.status(200).json({
      message: "Payment details",
      competition,
      cost: competition.cost,
      registrationDetails: reg
    });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};


const createRazorpayCompetition = async (req, res) => {
  try {
    const { competitionId, userId } = req.body;

    const registrationDetails = await TempCompetitionRegistration.findOne({
      competitionId,
      userId,
    });

    if (!registrationDetails) {
      return res.status(400).json({
        error: "Registration details not found or expired.",
      });
    }

    // Verify competition exists
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ error: "Competition not found." });
    }

    const amount = competition.cost;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    };

    razorpayInstance.orders.create(options, async (err, order) => {
      if (err) {
        console.error("Error creating Razorpay order:", err);
        return res.status(500).json({ error: "Failed to create Razorpay order." });
      }

      // If order payment already marked as paid
      if (order.status === "paid") {
        try {
          // Update user registration
          await User.findByIdAndUpdate(
            registrationDetails.userId,
            {
              $push: {
                registeredCompetitions: { competitionId },
              },
            },
            { new: true }
          );

          // Add participant to competition
          await Competition.findByIdAndUpdate(
            competitionId,
            {
              $push: {
                registeredParticipants: {
                  name: registrationDetails.name,
                  email: registrationDetails.email,
                  phone: registrationDetails.phone,
                },
              },
            },
            { new: true }
          );

          // Delete temporary registration from MongoDB
          await TempCompetitionRegistration.deleteOne({
            competitionId,
            userId,
          });

          return res.status(200).json({
            message: "Order created successfully.",
            order,
          });
        } catch (error) {
          console.error("Error updating user or competition:", error);
          return res.status(500).json({ error: "Failed to update user or competition." });
        }
      }

      return res.status(200).json({
        message: "Order created successfully.",
        order,
      });
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const loadProducts = async (req, res) => {
  try {
    const allProducts = await products.find().sort({ createdAt: -1 }).limit(3);
    return res.status(200).json({
      message: "Products loaded successfully",
      products: allProducts
    });
  } catch (error) {
    console.error('Error loading products:', error);
    return null;
  }
}

const loadShopProducts = async (req, res) => {
  try {
    const allProducts = await products.find().sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Products loaded successfully",
      products: allProducts
    });
  } catch (error) {
    console.error('Error loading products:', error);
    return null;
  }
}
const loadProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await products.findById(id);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found.',
      });
    }
    return res.status(200).json({
      message: 'Product details loaded successfully.',
      product,
    });
  } catch (error) {
    console.error('Error loading product details:', error);
    return res.status(500).json({
      message: 'An error occurred while loading product details.',
      error: error.message,
    });
  }
}

const addToCart = async (req, res) => {
  try {
    const { productId, size, color, quantity } = req.body;
    console.log("Add to cart request:", req.body);
    const userId = req.user._id;
    console.log("User ID:", userId);
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    // ✅ Find the size entry
    const sizeEntry = product.sizes.find((s) => s.size === size);
    if (!sizeEntry) return res.status(400).json({ message: "Invalid size selected" });
    // ✅ Find the color entry under that size
    const colorEntry = sizeEntry.colors.find((c) => c.color === color);
    if (!colorEntry) return res.status(400).json({ message: "Invalid color selected for this size" });
    // ✅ Check stock availability
    if (colorEntry.stock < quantity) {
      return res.status(400).json({ message: `Only ${colorEntry.stock} items available in stock` });
    }
    const price =
      product.discount > 0
        ? product.price - (product.price * product.discount) / 100
        : product.price;
    // ✅ Check if cart exists
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, size, color, quantity, price }],
      });
    }
    else {
      const existingItem = cart.items.find(
        (item) =>
          item.productId.toString() === productId &&
          item.size === size &&
          item.color === color
      );
      if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        if (newQty > colorEntry.stock) {
          return res
            .status(400)
            .json({ message: `Only ${colorEntry.stock} items available in stock` });
        }
        existingItem.quantity = newQty;
      } else {
        cart.items.push({ productId, size, color, quantity, price });
      }
    }
    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    console.error("Add to cart failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loadCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error loading cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export const updateCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { cartId, quantity } = req.body;

    if (!cartId || typeof quantity !== "number") {
      return res.status(400).json({ message: "cartId and quantity are required" });
    }

    // Find the user's cart that contains this cart item
    const cart = await Cart.findOne({ userId, "items._id": cartId });

    if (!cart) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const item = cart.items.id(cartId); // Mongoose subdoc accessor

    if (!item) {
      return res.status(404).json({ message: "Cart item not found in items" });
    }

    if (quantity <= 0) {
      cart.items.pull(cartId); // Correct way to remove a subdocument by _id
    } else {
      item.quantity = quantity;
    }
    await cart.save(); // triggers `pre('save')` to update totalPrice
    return res.status(200).json(cart);
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loadTrekking = async (req, res) => {
  try {
    const allTrekking = await Trekking.find().sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Trekking loaded successfully",
      trekking: allTrekking
    });
  } catch (error) {
    console.error('Error loading trekking:', error);
    return null;
  }
}

const updateUserProfile = async (req, res) => {
  try {
    const { userId, name, email, phone, addresses, profilePic } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const updateData = { name, email, phone, profilePic };

    // Only update addresses if provided in the request
    if (addresses && Array.isArray(addresses)) {
      updateData.addresses = addresses;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


const getMemberExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find({
      gymOwnerId: req.gymOwnerId,
      isActive: true
    });

    res.json(exercises);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMemberChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({
      gymOwnerId: req.gymOwnerId
    }).populate("exercises");

    res.json(challenges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export default {
  loginUser,
  registerUser,
  verifyOtpAndRegister,
  resendOtp,
  googleAuth,
  loadHomePage,
  loadCompetitionsPage,
  loadCompetitionDetailsPage,
  registerForCompetition,
  showPaymentConfirmation,
  loadProducts,
  loadShopProducts,
  loadProductDetails,
  loadTrekking,
  createRazorpayCompetition,
  updateUserProfile,
  addToCart,
  loadCart,
  updateCart,
  getMemberExercises,
  getMemberChallenges
};
