import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length >= 2,
        message: 'A question needs at least two options.',
      },
    },
    correctOption: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const readingQuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    article: { type: String, required: true, trim: true },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'Quiz must have at least one question.',
      },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

const ReadingQuiz = mongoose.model('ReadingQuiz', readingQuizSchema)

export default ReadingQuiz
