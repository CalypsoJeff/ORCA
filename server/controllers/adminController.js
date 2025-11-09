import bcrypt from 'bcrypt';
import redis from '../helper/redisClient.js';
import { sendEmailWithOTP, generateOTP } from '../helper/nodeMailer.js';
import { generateResetToken, generateToken, validateResetToken } from '../helper/jwtHelper.js';
import Admin from '../models/adminModel.js';
import Users from '../models/userModel.js';


export const ensureSuperAdminExists = async () => {
  const exists = await Admin.findOne({ isMainAdmin: true });
  if (!exists) {
    const hashed = await bcrypt.hash("Super@123", 10);
    await Admin.create({
      name: "Super Admin",
      email: "superadmin@gmail.com",
      password: hashed,
      isMainAdmin: true,
      status: "approved",
    });
    console.log("✅ Super Admin Created");
  } else {
    console.log("ℹ️ Super Admin already exists.");
  }
};


const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Admin Login Request:", req.body);
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ error: "Admin not found." });
    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    if (!isPasswordMatch)
      return res.status(400).json({ error: "Invalid credentials." });

    if (admin.status !== "approved") {
      return res.status(403).json({ error: "Your account is pending approval by super admin." });
    }

    const role = admin.isMainAdmin ? "superadmin" : "admin";
    const { token, refreshToken } = generateToken(admin._id, admin.email, role);

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      refreshToken,
      admin,
    });
  } catch (error) {
    console.error("Error during admin login:", error);
    return res.status(500).json({ error: "An error occurred during login." });
  }
};


const getPendingAdmins = async (req, res) => {
  try {
    const pendingAdmins = await Admin.find({ status: "pending" });
    return res.status(200).json({ pendingAdmins });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch pending admins." });
  }
};
const updateAdminStatus = async (req, res) => {
  const { adminId, action } = req.body;
  if (!["approved", "rejected"].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }

  const admin = await Admin.findById(adminId);
  if (!admin) return res.status(404).json({ error: "Admin not found" });

  admin.status = action;
  await admin.save();

  return res.status(200).json({ message: `Admin ${action}` });
};

const getApprovedAdmins = async (req, res) => {
  try {
    const approvedAdmins = await Admin.find({ status: "approved" });
    return res.status(200).json({ approvedAdmins });
  } catch (err) {
    console.error("Error fetching approved admins:", err);
    return res.status(500).json({ error: "Failed to fetch approved admins." });
  }
};


// Register Admin and Send OTP
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already exists" });
    }
    // Temporarily store admin data in Redis for verification later
    await redis.set(
      `tempAdmin:${email}`,
      JSON.stringify({ name, email, password }),
      "EX",
      600
    );
    // Generate OTP
    const otp = generateOTP();
    console.log("Generated OTP:", otp);
    // Store OTP in Redis with expiration of 5 minutes
    await redis.set(`otp:${email}`, otp, "EX", 300);
    // Send OTP via email
    await sendEmailWithOTP(email, otp, password, name);
    return res.status(200).json({ message: "OTP sent to your email for verification." });
  } catch (error) {
    console.error("Error in registration:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Verify OTP and Create Admin
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const storedOtp = await redis.get(`otp:${email}`);
    console.log("Stored OTP from Redis:", storedOtp);
    const userData = await redis.get(`tempAdmin:${email}`);
    console.log("Retrieved userData:", userData);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    if (!userData) {
      return res.status(400).json({ error: "User data expired. Please register again." });
    }
    let parsedData;
    try {
      parsedData = JSON.parse(userData);
    } catch (err) {
      console.error("Failed to parse userData:", err);
      return res.status(500).json({ error: "Invalid user data stored. Please register again." });
    }
    const { name, email: userEmail, password } = parsedData;
    console.log("Parsed Data:", name, userEmail, password);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ name, email: userEmail, password: hashedPassword });
    await newAdmin.save();
    await redis.del(`otp:${email}`);
    await redis.del(`tempAdmin:${email}`);
    return res.status(201).json({ message: "Admin registered successfully", newAdmin });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email is provided
    if (!email) {
      return res.status(400).json({ error: "Email is required to resend OTP" });
    }

    // Check if the admin is already registered
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already exists. Cannot resend OTP." });
    }

    // Generate a new OTP
    const otp = generateOTP();

    // Store the new OTP in Redis with a 5-minute expiry
    await redis.setex(email, 300, otp);

    // Send the new OTP via email
    await sendEmailWithOTP(email, otp);

    return res.status(200).json({ message: "OTP has been resent to your email." });
  } catch (error) {
    console.error("Error resending OTP:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const getUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await Users.find({}).select('name email phone status');

    if (!users || users.length === 0) {
      return res.status(404).json({
        message: 'No users found.',
      });
    }

    return res.status(200).json({
      message: 'Users fetched successfully.',
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      message: 'Failed to fetch users.',
      error: error.message,
    });
  }
};
const blockUser = async (req, res) => {
  try {
    const { phone } = req.body;

    // Find the user by email
    const user = await Users.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    // Check if the user is already banned
    if (user.status === 'Banned') {
      return res.status(400).json({
        message: 'User is already banned.',
      });
    }

    // Update the user's status to 'Banned'
    user.status = 'Banned';

    // Save the updated user status
    await user.save();

    return res.status(200).json({
      message: 'User blocked (banned) successfully.',
      user,
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    return res.status(500).json({
      message: 'Failed to block user.',
      error: error.message,
    });
  }
};




const unblockUser = async (req, res) => {
  try {
    const { phone } = req.body;

    // Find the user by email
    const user = await Users.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }
    // Check if the user is already active
    if (user.status === 'Active') {
      return res.status(400).json({
        message: 'User is already active.',
      });
    }
    // Update the user's status to 'Active'
    user.status = 'Active';

    // Save the updated user status
    await user.save();

    return res.status(200).json({
      message: 'User unblocked (activated) successfully.',
      user,
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return res.status(500).json({
      message: 'Failed to unblock user.',
      error: error.message,
    });
  }
};
const getPendingAdminRequests = async (req, res) => {
  try {
    const pendingAdmins = await Admin.find({ status: "pending" });
    return res.status(200).json({ pendingAdmins });
  } catch (err) {
    console.error("Error fetching pending admin requests:", err);
    return res.status(500).json({ error: "Failed to fetch pending admin requests." });
  }
}
// Approve Admin
export const approveAdminRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Admin ID is required" });
    }
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    admin.status = "approved";
    await admin.save();
    return res.status(200).json({ message: "Admin request approved successfully", admin });
  } catch (err) {
    console.error("Error approving admin request:", err);
    return res.status(500).json({ error: "Failed to approve admin request." });
  }
};

// Reject Admin
export const rejectAdminRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Admin ID is required" });
    }
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    await Admin.deleteOne({ _id: id });
    return res.status(200).json({ message: "Admin request rejected and deleted successfully" });
  } catch (err) {
    console.error("Error rejecting admin request:", err);
    return res.status(500).json({ error: "Failed to reject admin request." });
  }
};




export default {
  adminLogin,
  registerAdmin,
  verifyOtp,
  resendOTP,
  getPendingAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
  getUsers,
  blockUser,
  unblockUser,
};

