import ReadingQuiz from '../models/ReadingQuiz.js'

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

export const createReadingQuiz = async (req, res) => {
  try {
    const { title, article, questions } = req.body

    if (!title || !title.trim() || !article || !article.trim()) {
      return res.status(400).json({ message: 'Title and article are required.' })
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'At least one question is required.' })
    }

    for (const q of questions) {
      if (!q?.question || !Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({ message: 'Each question needs text and at least two options.' })
      }

      const validIndex = Number.isInteger(q.correctOption) && q.correctOption >= 0 && q.correctOption < q.options.length
      if (!validIndex) {
        return res.status(400).json({ message: 'Each question needs a valid correct option index.' })
      }
    }

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
