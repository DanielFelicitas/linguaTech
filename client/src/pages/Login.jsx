import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginRequest } from '../services/authApi'

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const onChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    try {
      const { data } = await loginRequest(formData)
      setMessage(data.message || 'Login successful.')
      if (data.token) {
        localStorage.setItem('linguatech_token', data.token)
      }
      if (data.user) {
        localStorage.setItem('linguatech_user', JSON.stringify(data.user))
      }
      navigate('/')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to login.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:py-10">
      <section className="w-full max-w-md rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-6 shadow-sm sm:p-8">
        <h1 className="mb-6 text-3xl font-bold text-[#5A4DD5]">Login</h1>
        <form className="space-y-4" onSubmit={onSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full rounded-md border border-[#d8dbe7] bg-white px-3 py-2 text-[#1F2430] placeholder:text-[#8b90a0] outline-none focus:border-[#4ED0FF]"
            value={formData.email}
            onChange={onChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full rounded-md border border-[#d8dbe7] bg-white px-3 py-2 text-[#1F2430] placeholder:text-[#8b90a0] outline-none focus:border-[#4ED0FF]"
            value={formData.password}
            onChange={onChange}
            required
          />
          <button
            type="submit"
            className="w-full rounded-md bg-[#4ED0FF] px-4 py-2 font-semibold text-[#0a2f40] transition hover:brightness-105"
          >
            Login
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-[#6E7382]">{message}</p>}
        <p className="mt-4 text-sm text-[#6E7382]">
          No account?{' '}
          <Link to="/signup" className="font-semibold text-[#5A4DD5]">
            Create one
          </Link>
        </p>
      </section>
    </div>
  )
}

export default Login
