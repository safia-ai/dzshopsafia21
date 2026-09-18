import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
