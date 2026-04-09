import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({ message: 'User already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
    const role = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'student'

    await User.create({ name, email, password: hashedPassword, role })

    return res.status(201).json({ message: 'Sign up successful.' })
  } catch (error) {
    return res.status(500).json({ message: 'Server error while signing up.' })
  }
}

export const login = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server auth config missing (JWT_SECRET).' })
    }

    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    return res.json({
      message: 'Login successful.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error('Login error:', error.message)
    return res.status(500).json({ message: 'Server error while logging in.' })
  }
}

export const setUserRole = async (req, res) => {
  try {
    const { email, role } = req.body

    if (!email || !role) {
      return res.status(400).json({ message: 'Email and role are required.' })
    }

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be student or admin.' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    user.role = role
    await user.save()

    return res.json({
      message: `Role updated to ${role}.`,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user role.' })
  }
}
