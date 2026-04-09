import ReadingQuiz from '../models/ReadingQuiz.js'
import ReadingAttempt from '../models/ReadingAttempt.js'
import OpinionPrompt from '../models/OpinionPrompt.js'
import OpinionSubmission from '../models/OpinionSubmission.js'

export const checkGrammar = async (req, res) => {
  try {
    const { text } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Text is required for grammar check.' })
    }

    const params = new URLSearchParams()
    params.append('text', text)
    params.append('language', 'en-US')

    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      return res.status(502).json({ message: 'LanguageTool service is unavailable.' })
    }

    const data = await response.json()
    const correctedText = buildCorrectedText(text, data.matches || [])

    return res.json({
      originalText: text,
      correctedText,
      matches: data.matches || [],
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to check grammar.' })
  }
}

const buildCorrectedText = (sourceText, matches) => {
  if (!matches.length) return sourceText

  const sorted = [...matches].sort((a, b) => b.offset - a.offset)
  let output = sourceText

  for (const match of sorted) {
    const replacement = match.replacements?.[0]?.value
    if (!replacement) continue

    const start = match.offset
    const end = match.offset + match.length
    output = `${output.slice(0, start)}${replacement}${output.slice(end)}`
  }

  return output
}

export const getReadingQuizzes = async (req, res) => {
  try {
    const quizzes = await ReadingQuiz.find({})
      .sort({ createdAt: -1 })
      .select('title article questions createdAt')

    return res.json({ quizzes })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load reading quizzes.' })
  }
}

export const submitReadingQuiz = async (req, res) => {
  try {
    const { quizId } = req.params
    const { answers } = req.body

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers array is required.' })
    }

    const quiz = await ReadingQuiz.findById(quizId)
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' })
    }

    const existingAttempt = await ReadingAttempt.findOne({
      quiz: quizId,
      student: req.user._id,
    })
    if (existingAttempt) {
      return res.status(409).json({
        message: 'You already submitted this quiz.',
        attempt: existingAttempt,
      })
    }

    const score = quiz.questions.reduce((sum, question, index) => {
      return sum + (answers[index] === question.correctOption ? 1 : 0)
    }, 0)

    const attempt = await ReadingAttempt.create({
      quiz: quizId,
      student: req.user._id,
      score,
      total: quiz.questions.length,
      submittedAnswers: answers,
    })

    return res.status(201).json({
      message: 'Quiz submitted successfully.',
      attempt: {
        id: attempt._id,
        quiz: attempt.quiz,
        student: attempt.student,
        score: attempt.score,
        total: attempt.total,
        submittedAnswers: attempt.submittedAnswers,
        createdAt: attempt.createdAt,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit quiz.' })
  }
}

export const getMyReadingAttempts = async (req, res) => {
  try {
    const attempts = await ReadingAttempt.find({ student: req.user._id })
      .select('quiz score total createdAt')
      .sort({ createdAt: -1 })

    return res.json({ attempts })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load your quiz scores.' })
  }
}

export const getReadingAttemptsForAdmin = async (req, res) => {
  try {
    const attempts = await ReadingAttempt.find({})
      .populate('student', 'name email')
      .populate('quiz', 'title')
      .sort({ createdAt: -1 })

    return res.json({
      attempts: attempts.map((attempt) => ({
        id: attempt._id,
        score: attempt.score,
        total: attempt.total,
        createdAt: attempt.createdAt,
        student: attempt.student
          ? {
              id: attempt.student._id,
              name: attempt.student.name,
              email: attempt.student.email,
            }
          : null,
        quiz: attempt.quiz
          ? {
              id: attempt.quiz._id,
              title: attempt.quiz.title,
            }
          : null,
      })),
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load student scores.' })
  }
}

export const deleteReadingAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params
    const deleted = await ReadingAttempt.findByIdAndDelete(attemptId)
    if (!deleted) {
      return res.status(404).json({ message: 'Reading submission not found.' })
    }
    return res.json({ message: 'Reading submission deleted successfully.' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete reading submission.' })
  }
}

export const getOpinionPrompts = async (req, res) => {
  try {
    const prompts = await OpinionPrompt.find({})
      .sort({ createdAt: 1, _id: 1 })
      .select('title instruction example question createdAt')
    return res.json({ prompts })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load opinion prompts.' })
  }
}

export const createOpinionPrompt = async (req, res) => {
  try {
    const { title, instruction, example, question } = req.body
    if (
      !title || !title.trim() ||
      !instruction || !instruction.trim() ||
      !example || !example.trim() ||
      !question || !question.trim()
    ) {
      return res.status(400).json({ message: 'Title, instruction, example, and question are required.' })
    }

    const created = await OpinionPrompt.create({
      title: title.trim(),
      instruction: instruction.trim(),
      example: example.trim(),
      question: question.trim(),
      createdBy: req.user._id,
    })

    return res.status(201).json({
      message: 'Opinion prompt created successfully.',
      prompt: {
        id: created._id,
        title: created.title,
        instruction: created.instruction,
        example: created.example,
        question: created.question,
        createdAt: created.createdAt,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create opinion prompt.' })
  }
}

export const updateOpinionPrompt = async (req, res) => {
  try {
    const { promptId } = req.params
    const { title, instruction, example, question } = req.body
    if (
      !title || !title.trim() ||
      !instruction || !instruction.trim() ||
      !example || !example.trim() ||
      !question || !question.trim()
    ) {
      return res.status(400).json({ message: 'Title, instruction, example, and question are required.' })
    }

    const updated = await OpinionPrompt.findByIdAndUpdate(
      promptId,
      {
        title: title.trim(),
        instruction: instruction.trim(),
        example: example.trim(),
        question: question.trim(),
      },
      { new: true },
    )
    if (!updated) {
      return res.status(404).json({ message: 'Opinion prompt not found.' })
    }

    return res.json({
      message: 'Opinion prompt updated successfully.',
      prompt: {
        id: updated._id,
        title: updated.title,
        instruction: updated.instruction,
        example: updated.example,
        question: updated.question,
        createdAt: updated.createdAt,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update opinion prompt.' })
  }
}

export const deleteOpinionPrompt = async (req, res) => {
  try {
    const { promptId } = req.params
    const deleted = await OpinionPrompt.findByIdAndDelete(promptId)
    if (!deleted) {
      return res.status(404).json({ message: 'Opinion prompt not found.' })
    }

    return res.json({ message: 'Opinion prompt deleted successfully.' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete opinion prompt.' })
  }
}

export const submitOpinionAnswer = async (req, res) => {
  try {
    const { promptId } = req.params
    const { answerText, durationSeconds } = req.body

    if (!answerText || !answerText.trim()) {
      return res.status(400).json({ message: 'Answer text is required.' })
    }

    const prompt = await OpinionPrompt.findById(promptId).select('_id')
    if (!prompt) {
      return res.status(404).json({ message: 'Opinion prompt not found.' })
    }

    const existingSubmission = await OpinionSubmission.findOne({
      prompt: prompt._id,
      student: req.user._id,
    })
    if (existingSubmission) {
      return res.status(409).json({
        message: 'You already submitted this opinion speech.',
        submission: {
          id: existingSubmission._id,
          prompt: existingSubmission.prompt,
          student: existingSubmission.student,
          answerText: existingSubmission.answerText,
          durationSeconds: existingSubmission.durationSeconds,
          feedback: existingSubmission.feedback || '',
          createdAt: existingSubmission.createdAt,
        },
      })
    }

    const submission = await OpinionSubmission.create({
      prompt: prompt._id,
      student: req.user._id,
      answerText: answerText.trim(),
      durationSeconds: Number(durationSeconds) > 0 ? Number(durationSeconds) : 60,
    })

    return res.status(201).json({
      message: 'Opinion answer submitted successfully.',
      submission: {
        id: submission._id,
        prompt: submission.prompt,
        student: submission.student,
        answerText: submission.answerText,
        durationSeconds: submission.durationSeconds,
        feedback: submission.feedback || '',
        createdAt: submission.createdAt,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit opinion answer.' })
  }
}

export const getMyOpinionSubmissionByPrompt = async (req, res) => {
  try {
    const { promptId } = req.params
    const submission = await OpinionSubmission.findOne({
      prompt: promptId,
      student: req.user._id,
    }).select('prompt answerText durationSeconds feedback createdAt')

    if (!submission) {
      return res.json({ submission: null })
    }

    return res.json({
      submission: {
        id: submission._id,
        prompt: submission.prompt,
        answerText: submission.answerText,
        durationSeconds: submission.durationSeconds,
        feedback: submission.feedback || '',
        createdAt: submission.createdAt,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load your opinion submission.' })
  }
}

export const getOpinionSubmissionsForAdmin = async (req, res) => {
  try {
    const submissions = await OpinionSubmission.find({})
      .populate('student', 'name email')
      .populate('prompt', 'title question')
      .sort({ createdAt: -1 })

    return res.json({
      submissions: submissions.map((item) => ({
        id: item._id,
        answerText: item.answerText,
        durationSeconds: item.durationSeconds,
        feedback: item.feedback || '',
        createdAt: item.createdAt,
        student: item.student
          ? { id: item.student._id, name: item.student.name, email: item.student.email }
          : null,
        prompt: item.prompt
          ? { id: item.prompt._id, title: item.prompt.title, question: item.prompt.question }
          : null,
      })),
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load opinion submissions.' })
  }
}

export const updateOpinionSubmissionFeedback = async (req, res) => {
  try {
    const { submissionId } = req.params
    const { feedback } = req.body

    const updated = await OpinionSubmission.findByIdAndUpdate(
      submissionId,
      { feedback: String(feedback || '').trim() },
      { new: true },
    )
    if (!updated) {
      return res.status(404).json({ message: 'Speech submission not found.' })
    }

    return res.json({
      message: 'Feedback updated successfully.',
      submission: {
        id: updated._id,
        feedback: updated.feedback || '',
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update feedback.' })
  }
}

export const deleteOpinionSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params
    const deleted = await OpinionSubmission.findByIdAndDelete(submissionId)
    if (!deleted) {
      return res.status(404).json({ message: 'Speech submission not found.' })
    }
    return res.json({ message: 'Speech submission deleted successfully.' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete speech submission.' })
  }
}

export const createReadingQuiz = async (req, res) => {
  try {
    const { title, article, questions } = req.body

    const validationError = validateQuizPayload({ title, article, questions })
    if (validationError) return res.status(400).json({ message: validationError })

    const quiz = await ReadingQuiz.create({
      title: title.trim(),
      article: article.trim(),
      questions: questions.map((q) => ({
        question: q.question.trim(),
        options: q.options.map((opt) => String(opt).trim()),
        correctOption: q.correctOption,
      })),
      createdBy: req.user._id,
    })

    return res.status(201).json({
      message: 'Reading quiz created successfully.',
      quiz: {
        id: quiz._id,
        title: quiz.title,
        article: quiz.article,
        questions: quiz.questions,
        createdAt: quiz.createdAt,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create reading quiz.' })
  }
}

export const updateReadingQuiz = async (req, res) => {
  try {
    const { quizId } = req.params
    const { title, article, questions } = req.body

    const validationError = validateQuizPayload({ title, article, questions })
    if (validationError) return res.status(400).json({ message: validationError })

    const quiz = await ReadingQuiz.findById(quizId)
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' })
    }

    quiz.title = title.trim()
    quiz.article = article.trim()
    quiz.questions = questions.map((q) => ({
      question: q.question.trim(),
      options: q.options.map((opt) => String(opt).trim()),
      correctOption: q.correctOption,
    }))
    await quiz.save()

    return res.json({
      message: 'Reading quiz updated successfully.',
      quiz: {
        id: quiz._id,
        title: quiz.title,
        article: quiz.article,
        questions: quiz.questions,
        createdAt: quiz.createdAt,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update reading quiz.' })
  }
}

export const deleteReadingQuiz = async (req, res) => {
  try {
    const { quizId } = req.params
    const deleted = await ReadingQuiz.findByIdAndDelete(quizId)

    if (!deleted) {
      return res.status(404).json({ message: 'Quiz not found.' })
    }

    return res.json({ message: 'Reading quiz deleted successfully.' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete reading quiz.' })
  }
}

const validateQuizPayload = ({ title, article, questions }) => {
  if (!title || !title.trim() || !article || !article.trim()) {
    return 'Title and article are required.'
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return 'At least one question is required.'
  }

  for (const q of questions) {
    if (!q?.question || !Array.isArray(q.options) || q.options.length < 2) {
      return 'Each question needs text and at least two options.'
    }

    const validIndex = Number.isInteger(q.correctOption) && q.correctOption >= 0 && q.correctOption < q.options.length
    if (!validIndex) {
      return 'Each question needs a valid correct option index.'
    }
  }

  return null
}
