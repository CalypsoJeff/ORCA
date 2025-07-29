import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file buffer to Cloudinary
 * @param {Object} file - File object with buffer and originalname
 * @param {Buffer} file.buffer - File buffer
 * @param {string} file.originalname - Original filename
 * @param {string} folder - Optional Cloudinary folder (default: 'services')
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
export const uploadToCloudinary = (file, folder = "services") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "auto",
                public_id: file.originalname.split(".")[0],
                overwrite: true,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id,
                });
            }
        );

        stream.end(file.buffer);
    });
};
