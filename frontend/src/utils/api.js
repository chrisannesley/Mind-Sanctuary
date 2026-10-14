import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// User endpoints
export const getUser = (userId = 1) => apiClient.get(`/api/user?userId=${userId}`)
export const setupUser = (name, mainConcern) => apiClient.post('/api/user/setup', { name, mainConcern })
export const updateUser = (userId, userData) => apiClient.put(`/api/user?userId=${userId}`, userData)

// Check-in endpoints
export const getCheckIns = (userId = 1) => apiClient.get(`/api/checkins?userId=${userId}`)
export const getTodayCheckIn = (userId = 1) => apiClient.get(`/api/checkins/today?userId=${userId}`)
export const createCheckIn = (userId, checkInData) => apiClient.post(`/api/checkins?userId=${userId}`, checkInData)
export const deleteCheckIn = (checkInId) => apiClient.delete(`/api/checkins/${checkInId}`)
export const getCheckInStats = (userId = 1) => apiClient.get(`/api/checkins/stats?userId=${userId}`)
export const getCheckInPatterns = (userId = 1) => apiClient.get(`/api/checkins/patterns/${userId}`)
export const getWeeklySummary = (userId = 1) => apiClient.get(`/api/checkins/weekly-summary/${userId}`)

// Journal endpoints
export const getJournalEntries = (userId = 1) => apiClient.get(`/api/journal?userId=${userId}`)
export const createJournalEntry = (userId, text) => apiClient.post(`/api/journal?userId=${userId}`, { text })
export const deleteJournalEntry = (entryId) => apiClient.delete(`/api/journal/${entryId}`)

// Trigger endpoints
export const createTrigger = (userId, reason, moodRating) => apiClient.post(`/api/triggers?userId=${userId}`, { reason, moodRating })
export const getTopTriggers = (limit = 20) => apiClient.get(`/api/triggers/top?limit=${limit}`)
export const getTriggerStats = () => apiClient.get('/api/triggers/stats')
export const getUserTriggers = (userId = 1) => apiClient.get(`/api/triggers?userId=${userId}`)

// Todo endpoints
export const getTodos = (userId = 1) => apiClient.get(`/api/todos?userId=${userId}`)
export const createTodo = (userId, text) => apiClient.post(`/api/todos?userId=${userId}`, { text })
export const updateTodo = (todoId, updates) => apiClient.put(`/api/todos/${todoId}`, updates)
export const deleteTodo = (todoId) => apiClient.delete(`/api/todos/${todoId}`)

// Habit endpoints
export const getHabits = (userId = 1) => apiClient.get(`/api/habits?userId=${userId}`)
export const createHabit = (userId, habitData) => apiClient.post(`/api/habits?userId=${userId}`, habitData)
export const updateHabit = (habitId, habitData) => apiClient.put(`/api/habits/${habitId}`, habitData)
export const deleteHabit = (habitId) => apiClient.delete(`/api/habits/${habitId}`)
export const completeHabit = (habitId) => apiClient.post(`/api/habits/${habitId}/complete`)

// Safety Plan endpoints
export const getSafetyPlan = (userId = 1) => apiClient.get(`/api/safety-plan?userId=${userId}`)
export const saveSafetyPlan = (userId = 1, planData) => apiClient.put(`/api/safety-plan?userId=${userId}`, planData)

// Assessment endpoints
export const getAssessments = () => apiClient.get('/api/assessments')
export const getAssessment = (assessmentId) => apiClient.get(`/api/assessments/${assessmentId}`)
export const submitAssessment = (userId, assessmentId, answers) => apiClient.post(`/api/assessments/${assessmentId}/submit?userId=${userId}`, { answers })
export const getAssessmentResults = (userId) => apiClient.get(`/api/assessments/results/${userId}`)
export const deleteAssessmentResult = (resultId) => apiClient.delete(`/api/assessments/results/${resultId}`)

// Articles endpoints
export const getArticles = () => apiClient.get('/api/articles')
export const getArticle = (articleId) => apiClient.get(`/api/articles/${articleId}`)
export const getArticlesByCategory = (category) => apiClient.get(`/api/articles/category/${category}`)

// Coping strategies endpoints
export const getCopingStrategies = () => apiClient.get('/api/coping-strategies')
export const getCopingStrategy = (strategyId) => apiClient.get(`/api/coping-strategies/${strategyId}`)

// Quotes endpoints
export const getQuotes = () => apiClient.get('/api/quotes')
export const getRandomQuote = () => apiClient.get('/api/quotes/random')
export const getQuoteByMood = (mood) => apiClient.get(`/api/quotes/mood/${mood}`)

// Crisis resources endpoints
export const getCrisisResources = () => apiClient.get('/api/crisis-resources')
export const getCrisisResourcesByCountry = (country) => apiClient.get(`/api/crisis-resources/${country}`)

// Feedback endpoint
export const submitFeedback = (userId, feedbackData) => apiClient.post(`/api/feedback?userId=${userId}`, feedbackData)
