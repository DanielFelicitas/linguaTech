import mongoose from 'mongoose'

const opinionSubmissionSchema = new mongoose.Schema(
  {
    prompt: { type: mongoose.Schema.Types.ObjectId, ref: 'OpinionPrompt', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answerText: { type: String, required: true, trim: true },
    durationSeconds: { type: Number, required: true, min: 1 },
    feedback: { type: String, default: '', trim: true },
  },
  { timestamps: true },
)

opinionSubmissionSchema.index({ prompt: 1, student: 1 }, { unique: true })

const OpinionSubmission = mongoose.model('OpinionSubmission', opinionSubmissionSchema)

export default OpinionSubmission
