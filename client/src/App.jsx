import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import About from './pages/About'
import Activities from './pages/Activities'
import AdminReadingQuizzes from './pages/AdminReadingQuizzes'
import ReadingActivity from './pages/ReadingActivity'
import SpeakingActivity from './pages/SpeakingActivity'
import Contact from './pages/Contact'
import ChatBot from './pages/ChatBot'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/activities/speaking" element={<SpeakingActivity />} />
        <Route path="/activities/reading" element={<ReadingActivity />} />
        <Route path="/admin/reading-quizzes" element={<AdminReadingQuizzes />} />
        <Route path="/chat" element={<ChatBot />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
