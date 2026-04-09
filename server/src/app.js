import cors from 'cors'
import express from 'express'
import activityRoutes from './routes/activityRoutes.js'
import authRoutes from './routes/authRoutes.js'
import chatRoutes from './routes/chatRoutes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'LinguaTech API is running.' })
})

app.use('/api/auth', authRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/chat', chatRoutes)

export default app
