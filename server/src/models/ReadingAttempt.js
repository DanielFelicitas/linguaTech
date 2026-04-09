import mongoose from 'mongoose'

const readingAttemptSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'ReadingQuiz', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 1 },
    submittedAnswers: { type: [Number], default: [] },
  },
  { timestamps: true },
)

readingAttemptSchema.index({ quiz: 1, student: 1 }, { unique: true })

const ReadingAttempt = mongoose.model('ReadingAttempt', readingAttemptSchema)

export default ReadingAttempt
