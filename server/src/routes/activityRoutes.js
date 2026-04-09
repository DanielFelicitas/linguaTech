import express from 'express'
import {
  checkGrammar,
  createOpinionPrompt,
  createReadingQuiz,
  deleteOpinionPrompt,
  deleteReadingQuiz,
  getMyReadingAttempts,
  getOpinionPrompts,
  getOpinionSubmissionsForAdmin,
  getReadingAttemptsForAdmin,
  getReadingQuizzes,
  submitOpinionAnswer,
  submitReadingQuiz,
  updateOpinionPrompt,
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
router.get('/opinion-prompts', getOpinionPrompts)
router.post('/opinion-prompts', protect, adminOnly, createOpinionPrompt)
router.put('/opinion-prompts/:promptId', protect, adminOnly, updateOpinionPrompt)
router.delete('/opinion-prompts/:promptId', protect, adminOnly, deleteOpinionPrompt)
router.post('/opinion-prompts/:promptId/submit', protect, submitOpinionAnswer)
router.get('/opinion-submissions/admin', protect, adminOnly, getOpinionSubmissionsForAdmin)

export default router
