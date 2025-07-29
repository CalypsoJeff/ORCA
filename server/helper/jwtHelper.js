import jwt from 'jsonwebtoken';

const SECRET_KEY = "YOUR_SECRET_KEY";
const REFRESH_SECRET_KEY = "REFRESH_SECRET_KEY";

/**
 * Generates an access token and a refresh token.
 * @param {string} _id - The user ID.
 * @param {string} email - The user's email.
 * @param {string} role - The user's role.
 * @returns {Object} An object containing the access token and refresh token.
 */
export const generateToken = (_id, email, role) => {
    const token = jwt.sign({ _id, email, role }, SECRET_KEY, {
        expiresIn: '2h',
    });
    const refreshToken = jwt.sign({ _id, email, role }, REFRESH_SECRET_KEY, {
        expiresIn: '5d',
    });
    return { token, refreshToken };
};

/**
 * Generates a password reset token.
 * @param {string} email - The user's email.
 * @returns {string} A reset token valid for 15 minutes.
 */
export const generateResetToken = (email) => {
    return jwt.sign({ email }, SECRET_KEY, { expiresIn: '15m' });
};

/**
 * Validates a password reset token.
 * @param {string} token - The token to validate.
 * @param {string} email - The user's email.
 * @returns {boolean} True if the token is valid and matches the email, false otherwise.
 */
export const validateResetToken = (token, email) => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        if (decoded.email !== email) {
            throw new Error("Token validation failed: Email mismatch");
        }
        return true;
    } catch (error) {
        console.error("Token validation error:", error);
        return false;
    }
};

/**
 * Verifies a general JWT token.
 * @param {string} token - The JWT token.
 * @returns {Object} Decoded token if valid.
 */
export const verifyToken = (token) => {
    return jwt.verify(token, SECRET_KEY);
};