import axios from 'axios'

const configuredApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')
const apiBaseUrl = configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' }
})

let authToken = null

export function setAuthToken(token) {
  authToken = token || null
  if (authToken) {
    api.defaults.headers.common.Authorization = `Bearer ${authToken}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`
  return config
})

export default api
