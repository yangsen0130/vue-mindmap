import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_LEANCLOUD_SERVER_URL,
  headers: {
    'X-LC-Id': import.meta.env.VITE_LEANCLOUD_APP_ID,
    'X-LC-Key': import.meta.env.VITE_LEANCLOUD_APP_KEY,
    'Content-Type': 'application/json',
  },
})

export const login = (username: string, password: string) => {
  return api.post('/1.1/login', { username, password })
}

export const register = (username: string, password: string, email: string) => {
  return api.post('/1.1/users', { username, password, email })
}

export const requestEmailVerification = (email: string) => {
  return api.post('/1.1/requestEmailVerify', { email })
}

export default api