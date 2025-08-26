import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log Cloudinary configuration (without secrets)
console.log('☁️ Cloudinary configuration:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing',
  api_key: process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing'
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log(`☁️ Cloudinary storage params for file: ${file.originalname}`);
    console.log(`☁️ Request URL: ${req.url}`);
    
    try {
      // Determine folder based on the endpoint
      let folder = 'nex-ticket/general';
      let publicIdPrefix = 'file';
      
      if (req.url.includes('/venues/')) {
        folder = 'nex-ticket/venues';
        publicIdPrefix = 'venue';
      } else if (req.url.includes('/events/')) {
        folder = 'nex-ticket/events';
        publicIdPrefix = 'event';
      }
      
      const params = {
        folder: folder,
        allowed_formats: ['jpg', 'png', 'jpeg'],
        public_id: `${publicIdPrefix}-${Date.now()}-${file.originalname.split('.')[0]}`,
      };
      console.log(`☁️ Cloudinary upload params:`, params);
      return params;
    } catch (error) {
      console.error('☁️ Error creating Cloudinary params:', error);
      throw error;
    }
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (increased from 5MB)
    fieldSize: 10 * 1024 * 1024, // 10MB field limit
  },
  fileFilter: (req, file, cb) => {
    console.log('🔍 Multer fileFilter check:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype
    });
    
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      console.log('✅ File accepted by filter');
      cb(null, true);
    } else {
      console.log('❌ File rejected by filter');
      cb(null, false);
    }
  }
});

export default upload;
