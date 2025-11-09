import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try both local path (for development) and Render secret path (for production)
const localPath = path.join(__dirname, "../config/orca-1234-firebase-adminsdk-fbsvc-cf69f06048.json");
const renderPath = "/etc/secrets/orca-1234-firebase-adminsdk-fbsvc-cf69f06048.json";

let serviceAccountPath = fs.existsSync(localPath) ? localPath : renderPath;

console.log("🔥 Using Firebase credentials from:", serviceAccountPath);

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
