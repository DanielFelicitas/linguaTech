import express from 'express'
import { checkGrammar, createReadingQuiz, getReadingQuizzes } from '../controllers/activityController.js'
import { adminOnly, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/grammar-check', checkGrammar)
router.get('/reading-quizzes', getReadingQuizzes)
router.post('/reading-quizzes', protect, adminOnly, createReadingQuiz)

export default router
