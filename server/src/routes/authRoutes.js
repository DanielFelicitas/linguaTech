import express from 'express'
import { login, setUserRole, signup } from '../controllers/authController.js'
import { adminOnly, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.patch('/role', protect, adminOnly, setUserRole)

export default router
