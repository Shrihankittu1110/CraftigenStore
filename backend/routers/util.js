const multer = require('multer');
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, uploadsDir);
   },
   filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeBaseName = path
         .basename(file.originalname, ext)
         .replace(/[^a-z0-9_-]/gi, '-')
         .replace(/-+/g, '-')
         .slice(0, 50) || 'upload';

      cb(null, `${Date.now()}-${safeBaseName}${ext}`);
   }
});

const uploader = multer({
   storage,
   limits: {
      fileSize: 2 * 1024 * 1024
   },
   fileFilter: (req, file, cb) => {
      if (!allowedMimeTypes.has(file.mimetype)) {
         return cb(new Error('Only image files are allowed'));
      }

      return cb(null, true);
   }
});

router.post('/uploadfile', (req, res) => {
   uploader.single('myfile')(req, res, (err) => {
      if (err) {
         return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
         return res.status(400).json({ message: 'No file uploaded' });
      }

      return res.json({
         message: 'File uploaded successfully',
         fileName: `uploads/${req.file.filename}`,
         originalName: req.file.originalname,
         size: req.file.size
      });
   });
});

module.exports = router;
