import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navigation from './components/Navigation'
import SplashLanding from './pages/SplashLanding'
import Home from './pages/Home'
import CheckIn from './pages/CheckIn'
import CheckInHistory from './pages/CheckInHistory'
import HabitTracker from './pages/HabitTracker'
import Reflection from './pages/Reflection'
import Assessments from './pages/Assessments'
import AssessmentDetail from './pages/AssessmentDetail'
import AssessmentHistory from './pages/AssessmentHistory'
import Articles from './pages/Articles'
import CopingStrategies from './pages/CopingStrategies'
import Inspiration from './pages/Inspiration'
import CrisisResources from './pages/CrisisResources'
import Profile from './pages/Profile'
import TodoList from './pages/TodoList'
import AvatarChat from './pages/AvatarChat'
import Journal from './pages/Journal'
import Beasts from './pages/Beasts'
import VoiceSettings from './pages/VoiceSettings'
import MedicationTracker from './pages/MedicationTracker'
import BreathingTimer from './pages/BreathingTimer'
import MoodCalendar from './pages/MoodCalendar'
import Dashboard from './pages/Dashboard'
import MyJourney from './pages/MyJourney'
import ShareReport from './pages/ShareReport'
import CrisisSafetyPlan from './pages/CrisisSafetyPlan'
import SleepTracker from './pages/SleepTracker'
import WellnessTrends from './pages/WellnessTrends'
import { getUser } from './utils/api'
import { recordVisit } from './utils/pageVisits'
import * as NotificationService from './services/NotificationService'
import UserSetup from './pages/UserSetup'
import Login from './pages/Login'

// Records every route change to localStorage for the "unvisited" Dashboard indicator
function RouteTracker() {
  const location = useLocation()
  useEffect(() => { recordVisit(location.pathname) }, [location.pathname])
  return null
}

function App() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  // Persist userId in localStorage so each device/tester has their own account
  const [userId, setUserId] = useState(() => {
    const saved = localStorage.getItem('mw_userId')
    return saved ? parseInt(saved) : null
  })

  const handleSetup = (newUser) => {
    setUser(newUser)
    setUserId(newUser.id)
  }

  const handleLogin = (existingUser) => {
    setUser(existingUser)
    setUserId(existingUser.id)
  }

  useEffect(() => {
    if (!userId) { setLoading(false); return }   // no user yet — show setup
    const loadUser = async () => {
      try {
        const response = await getUser(userId)
        setUser(response.data)
        await NotificationService.init()
      } catch (error) {
        console.error('Error loading user:', error)
        // If user not found, clear localStorage so they can set up again
        if (error?.response?.status === 404) {
          localStorage.removeItem('mw_userId')
          setUserId(null)
        }
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-mindwell-50 to-mindwell-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mindwell-600 mx-auto mb-4"></div>
          <p className="text-mindwell-600 font-semibold">Loading Mind Sanctuary...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <RouteTracker />
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)' }}>
        <Routes>
          <Route path="/" element={<SplashLanding hasAccount={!!userId} />} />
          <Route path="/setup" element={<UserSetup onSetup={handleSetup} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/home" element={<><Navigation user={user} /><Home user={user} setUser={setUser} userId={userId} setUserId={setUserId} /></>} />
          <Route path="/checkin" element={<><Navigation user={user} /><main className="container mx-auto px-4 py-8"><CheckIn user={user} userId={userId} /></main></>} />
          <Route path="/checkin-history" element={<><Navigation user={user} /><CheckInHistory userId={userId} /></>} />
          <Route path="/medications" element={<><Navigation user={user} /><MedicationTracker /></>} />
          <Route path="/breathing" element={<><Navigation user={user} /><BreathingTimer /></>} />
          <Route path="/dashboard" element={<><Navigation user={user} /><Dashboard userId={userId} /></>} />
          <Route path="/mood-calendar" element={<><Navigation user={user} /><MoodCalendar userId={userId} /></>} />
          <Route path="/journey" element={<><Navigation user={user} /><MyJourney userId={userId} /></>} />
          <Route path="/share-report" element={<><Navigation user={user} /><ShareReport userId={userId} user={user} /></>} />
          <Route path="/safety-plan" element={<><Navigation user={user} /><CrisisSafetyPlan userId={userId} /></>} />
          <Route path="/sleep" element={<><Navigation user={user} /><SleepTracker userId={userId} /></>} />
          <Route path="/trends" element={<><Navigation user={user} /><WellnessTrends userId={userId} /></>} />
          <Route path="/habits" element={<><Navigation user={user} /><HabitTracker userId={userId} /></>} />
          <Route path="/reflection" element={<><Navigation user={user} /><main className="container mx-auto px-4 py-8"><Reflection /></main></>} />
          <Route path="/assessments" element={<><Navigation user={user} /><main className="container mx-auto px-4 py-8"><Assessments userId={userId} /></main></>} />
          <Route path="/assessments/:id" element={<><Navigation user={user} /><main className="container mx-auto px-4 py-8"><AssessmentDetail userId={userId} /></main></>} />
          <Route path="/assessment-history" element={<><Navigation user={user} /><main className="container mx-auto px-4 py-8"><AssessmentHistory userId={userId} /></main></>} />
          <Route path="/articles" element={<><Navigation user={user} /><main className="container mx-auto px-4 py-8"><Articles /></main></>} />
          <Route path="/coping" element={<><Navigation user={user} /><main className="container mx-auto px-4 py-8"><CopingStrategies /></main></>} />
          <Route path="/inspiration" element={<><Navigation user={user} /><main className="container mx-auto px-4 py-8"><Inspiration userId={userId} /></main></>} />
          <Route path="/crisis" element={<><Navigation user={user} /><main className="container mx-auto px-4 py-8"><CrisisResources /></main></>} />
          <Route path="/profile" element={<><Navigation user={user} /><main className="container mx-auto px-4 py-8"><Profile user={user} setUser={setUser} userId={userId} /></main></>} />
          <Route path="/todos" element={<><Navigation user={user} /><main className="container mx-auto px-4 py-8"><TodoList userId={userId} /></main></>} />
          <Route path="/journal" element={<><Navigation user={user} /><main className="container mx-auto px-4 py-8"><Journal user={user} userId={userId} /></main></>} />
          <Route path="/beasts" element={<><Navigation user={user} /><main className="container mx-auto px-4 py-8"><Beasts userId={userId} /></main></>} />
          <Route path="/voice-settings" element={<><Navigation user={user} /><main className="container mx-auto px-4 py-8"><VoiceSettings user={user} userId={userId} /></main></>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
