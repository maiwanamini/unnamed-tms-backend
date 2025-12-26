import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

function ensureConfigured() {
  if (isConfigured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const err = new Error(
      "Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
    err.code = "CLOUDINARY_NOT_CONFIGURED";
    throw err;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  isConfigured = true;
}

const uploadImageBuffer = (buffer, folder = "orders") => {
  return new Promise((resolve, reject) => {
    try {
      ensureConfigured();
    } catch (e) {
      return reject(e);
    }

    const upload = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    upload.end(buffer);
  });
};

const deleteImage = async (publicId) => {
  if (!publicId) return;

  try {
    ensureConfigured();
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error", error.message);
  }
};

export { uploadImageBuffer, deleteImage };
