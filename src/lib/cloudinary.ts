import { v2 as cloudinary } from "cloudinary";

function getConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function uploadFile(
  buffer: Buffer,
  fileName: string
): Promise<{ url: string; fileName: string }> {
  getConfig();

  return new Promise((resolve, reject) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
    const format = ext === "jpeg" ? "jpg" : ext;
    const publicId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        format,
        resource_type: "auto",
        folder: "class-portal",
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error(error?.message || "Upload failed"));
        } else {
          resolve({
            url: result.secure_url,
            fileName,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}
