import express from 'express'
import {
  checkGrammar,
  createReadingQuiz,
  deleteReadingQuiz,
  getMyReadingAttempts,
  getReadingAttemptsForAdmin,
  getReadingQuizzes,
  submitReadingQuiz,
  updateReadingQuiz,
} from '../controllers/activityController.js'
import { adminOnly, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/grammar-check', checkGrammar)
router.get('/reading-quizzes', getReadingQuizzes)
router.post('/reading-quizzes', protect, adminOnly, createReadingQuiz)
router.put('/reading-quizzes/:quizId', protect, adminOnly, updateReadingQuiz)
router.delete('/reading-quizzes/:quizId', protect, adminOnly, deleteReadingQuiz)
router.post('/reading-quizzes/:quizId/submit', protect, submitReadingQuiz)
router.get('/reading-attempts/me', protect, getMyReadingAttempts)
router.get('/reading-attempts/admin', protect, adminOnly, getReadingAttemptsForAdmin)

export default router
