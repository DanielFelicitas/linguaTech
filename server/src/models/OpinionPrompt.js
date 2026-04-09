import mongoose from 'mongoose'

const opinionPromptSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    instruction: { type: String, required: true, trim: true },
    example: { type: String, required: true, trim: true },
    question: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

const OpinionPrompt = mongoose.model('OpinionPrompt', opinionPromptSchema)

export default OpinionPrompt
