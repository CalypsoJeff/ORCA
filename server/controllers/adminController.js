import bcrypt from 'bcrypt';
import { sendEmailWithOTP, generateOTP } from '../helper/nodeMailer.js';
import { generateResetToken, generateToken, validateResetToken } from '../helper/jwtHelper.js';
import Admin from '../models/adminModel.js';
import Users from '../models/userModel.js';
import TempAdmin from '../models/tempAdmin.js';


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

const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res.status(400).json({ error: "Admin already exists" });
    const otp = generateOTP();
    await TempAdmin.findOneAndUpdate(
      { email },
      {
        name,
        email,
        password,
        otp,
        otpExpiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      },
      { upsert: true }
    );
    await sendEmailWithOTP(email, otp, password, name);
    return res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Verify OTP and Create Admin
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const temp = await TempAdmin.findOne({ email });
    if (!temp)
      return res.status(400).json({ error: "Data expired. Please register again." });
    if (temp.otp !== otp)
      return res.status(400).json({ error: "Invalid OTP" });
    if (temp.otpExpiresAt < Date.now())
      return res.status(400).json({ error: "OTP expired" });
    const hashedPassword = await bcrypt.hash(temp.password, 10);
    const newAdmin = await Admin.create({
      name: temp.name,
      email: temp.email,
      password: hashedPassword,
    });
    await TempAdmin.deleteOne({ email });
    return res.status(201).json({
      message: "Admin registered successfully",
      newAdmin,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res.status(400).json({ error: "Admin already exists." });
    const otp = generateOTP();
    await TempAdmin.findOneAndUpdate(
      { email },
      {
        otp,
        otpExpiresAt: Date.now() + 5 * 60 * 1000,
      },
      { upsert: true }
    );
    await sendEmailWithOTP(email, otp);
    return res.status(200).json({ message: "OTP resent successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const getUsers = async (req, res) => {
  try {
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
    const user = await Users.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }
    if (user.status === 'Banned') {
      return res.status(400).json({
        message: 'User is already banned.',
      });
    }
    user.status = 'Banned';
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
    const user = await Users.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }
    if (user.status === 'Active') {
      return res.status(400).json({
        message: 'User is already active.',
      });
    }
    user.status = 'Active';
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

