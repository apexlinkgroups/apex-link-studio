const cloudinary   = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const allowedImageFormats = ['jpg','jpeg','png','gif','webp','tif','tiff','psd','raw','cr2','nef'];
const allowedVideoFormats = ['mp4','mov','avi','mkv','webm'];

const storage = {
  _handleFile(req, file, cb) {
    const isVideo = file.mimetype.startsWith('video/');
    const stream = cloudinary.uploader.upload_stream({
      folder: `apex-studio/${isVideo ? 'videos' : 'images'}`,
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo ? allowedVideoFormats : allowedImageFormats,
      transformation: isVideo ? [] : [{ quality: 'auto', fetch_format: 'auto' }],
    }, (error, result) => {
      if (error) return cb(error);
      cb(null, {
        path: result.secure_url,
        filename: result.public_id,
        size: result.bytes,
      });
    });

    file.stream.pipe(stream);
  },
  _removeFile(req, file, cb) {
    if (!file.filename) return cb(null);
    cloudinary.uploader.destroy(file.filename, { resource_type: file.mimetype?.startsWith('video/') ? 'video' : 'image' }, cb);
  },
};

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
});

module.exports = { upload, cloudinary };
