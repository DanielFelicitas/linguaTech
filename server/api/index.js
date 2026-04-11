import dotenv from 'dotenv'
import mongoose from 'mongoose'
import app from '../src/app.js'
import { connectDB } from '../src/config/db.js'

dotenv.config()

export default async function handler(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB()
    }
    return app(req, res)
  } catch (error) {
    console.error('Function boot error:', error.message)
    return res.status(500).json({ message: 'Server initialization failed.' })
  }
}

/** Vercel Node serverless: max execution time (seconds). Also set in vercel.json. */
export const maxDuration = 60
