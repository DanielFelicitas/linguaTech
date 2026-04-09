import dotenv from 'dotenv'
import app from '../src/app.js'
import { connectDB } from '../src/config/db.js'

dotenv.config()

export default async function handler(req, res) {
  try {
    await connectDB()
    return app(req, res)
  } catch (error) {
    console.error('Function boot error:', error.message)
    return res.status(500).json({ message: 'Server initialization failed.' })
  }
}
