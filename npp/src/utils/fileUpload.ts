import * as fs from "fs";
import * as path from "path";
import * as multer from "multer";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// =====================
// ⚙️ CONFIGURATION
// =====================

// Local upload directory
const localDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(localDir)) {
  fs.mkdirSync(localDir, { recursive: true });
}

// Multer configuration (works for both local & S3)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, localDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });

// =====================
// ☁️ AWS S3 CONFIG
// =====================
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// =====================
// 📤 UPLOAD FUNCTION
// =====================

/**
 * Upload file (supports "local" or "s3" modes)
 * @param {object} file - Multer file object
 * @param {"local"|"s3"} mode - Storage mode
 * @returns {Promise<{ url: string, key?: string }>}
 */
export const fileUpload = async (file, mode = "local") => {
  if (!file) throw new Error("No file provided");

  if (mode === "s3") {
    const fileKey = `uploads/${Date.now()}-${file.originalname}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET,
      Key: fileKey,
      Body: fs.createReadStream(file.path),
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    // Optional: remove local temp file after upload
    fs.unlinkSync(file.path);

    const fileUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    return { url: fileUrl, key: fileKey };
  }

  // Default local storage
  const localUrl = `/uploads/${file.filename}`;
  return { url: localUrl };
};

// =====================
// 🔗 PRESIGNED URL (optional, for S3)
// =====================

/**
 * Generate presigned URL for accessing S3 file
 * @param {string} key - S3 object key
 * @param {number} expiresIn - Expiration in seconds (default: 3600)
 */
export const getPresignedUrl = async (key, expiresIn = 3600) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET,
    Key: key,
  });
  return await getSignedUrl(s3, command, { expiresIn });
};

// =====================
// 🗑️ DELETE FUNCTION
// =====================

/**
 * Delete file (supports "local" or "s3" modes)
 * @param {string} identifier - local path or S3 key
 * @param {"local"|"s3"} mode
 */
export const deleteFile = async (identifier, mode = "local") => {
  if (!identifier) throw new Error("No file identifier provided");

  if (mode === "s3") {
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET,
      Key: identifier,
    };
    await s3.send(new DeleteObjectCommand(deleteParams));
    return true;
  }

  // Local delete
  const filePath = path.join(process.cwd(), identifier.replace("/uploads/", "uploads/"));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  return true;
};
