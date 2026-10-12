import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Rune endpoints
export const getAllRunes = () => apiClient.get('/api/runes')
export const getRune = (id) => apiClient.get(`/api/runes/${id}`)

// Context endpoints
export const getContexts = () => apiClient.get('/api/contexts')

// Draw endpoints
export const drawRunes = (count, context) => apiClient.post('/api/draw', { count, context })

// Readings endpoints
export const saveReading = (context, stones, notes) => apiClient.post('/api/readings', { context, stones, notes })

export default apiClient
