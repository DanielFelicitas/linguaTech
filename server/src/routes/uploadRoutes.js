import express from 'express'
import multer from 'multer'
import { protect, adminOnly } from '../middleware/authMiddleware.js'
import { cloudinary, ensureConfigured } from '../lib/cloudinary.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

/** Admin image/file upload — memory → Cloudinary (Vercel-safe, same as student-commission). */
router.post('/upload', protect, adminOnly, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large (max 5MB)' })
      }
      return next(err)
    }
    ;(async () => {
      try {
        ensureConfigured()
        if (!req.file?.buffer) {
          return res.status(400).json({ message: 'file is required (multipart field name: file)' })
        }
        const folder = (process.env.CLOUDINARY_FOLDER || 'linguatech').replace(/^\/+|\/+$/g, '')
        const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
        const result = await cloudinary.uploader.upload(dataUrl, {
          folder,
          resource_type: 'auto',
        })
        return res.json({ url: result.secure_url })
      } catch (e) {
        return next(e)
      }
    })()
  })
})

export default router
