/**
 * Vercel entry — same style as student-commission (root index.js + vercel.json builds + @vercel/node).
 * Local dev: use `npm run dev` → server/src/server.js
 */
import './src/loadEnv.js'
import app from './src/app.js'

export default app
export const maxDuration = 60
