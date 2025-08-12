import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000'

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
})

// Attach token helper used by pages
export function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Interceptor to handle 401s could be added here if we persist token globally


