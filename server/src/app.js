import cors from 'cors'
import express from 'express'
import { connectDB, trimMongoUri } from './config/db.js'
import activityRoutes from './routes/activityRoutes.js'
import authRoutes from './routes/authRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'

const app = express()

app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  }),
)

/** Vercel rewrites can leave req.url as `/api`; normalize like student-commission. */
app.use((req, _res, next) => {
  if (req.url === '/api' || req.url.startsWith('/api?')) {
    req.url = req.url === '/api' ? '/' : `/${req.url.slice(4)}`
  }
  next()
})

app.use(express.json({ limit: '1mb' }))

/** Liveness — no MongoDB (uptime / cold start). Must stay above connectDB middleware. */
app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'linguatech-api', message: 'LinguaTech API is running.' })
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'linguatech-api' })
})

app.use(async (req, res, next) => {
  if (req.method === 'OPTIONS') return next()
  try {
    await connectDB()
  } catch (err) {
    console.error(err)
    const missing = !trimMongoUri(process.env.MONGO_URI)
    return res.status(503).json({
      message: missing
        ? 'Database unavailable: set MONGO_URI on the server (e.g. Vercel → Environment Variables).'
        : 'Database unavailable: check MONGO_URI and that Atlas allows your deployment (0.0.0.0/0 for Vercel).',
    })
  }
  return next()
})

app.use('/api/auth', authRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/admin', uploadRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({ message: err.message || 'Server error' })
})

export default app
