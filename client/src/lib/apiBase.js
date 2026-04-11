/** Vite injects env at build time — set VITE_API_URL in Vercel / .env for production. */
const raw = import.meta.env.VITE_API_URL || 'http://localhost:5000'
export const API_ORIGIN = String(raw).replace(/\/$/, '')
