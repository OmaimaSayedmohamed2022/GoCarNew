import cloudinary from "../utils/cloudinary.js";

const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) {
          console.error(`Cloudinary upload failed: ${file.originalname}`, error);
          reject(new Error('File upload failed. Please try again.'));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    try {
      const buffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
      
      uploadStream.end(buffer);
    } catch (error) {
      console.error("Error processing file before upload:", error);
      reject(new Error("Error processing file before upload."));
    }
  });
};

export default uploadToCloudinary;