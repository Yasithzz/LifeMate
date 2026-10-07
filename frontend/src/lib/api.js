const API_BASE_URL = '/api'
const SESSION_KEY = 'lifemate_session'

const CONNECT_RETRIES = 8
const CONNECT_RETRY_DELAYS = [250, 500, 750, 1000, 1500, 2000, 3000, 4000] // ~13s total

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function request(path, options = {}) {
  const token = getToken()
  let res
  for (let attempt = 0; ; attempt++) {
    try {
      res = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...options,
      })
      // Vite's dev proxy returns its own 503 (instead of a rejected fetch) when the backend port refuses the connection
      if (res.status === 503) {
        const proxyBody = await res.clone().json().catch(() => null)
        if (proxyBody?.message?.startsWith('Cannot connect to server')) throw new Error('proxy-down')
      }
      break
    } catch {
      if (attempt >= CONNECT_RETRIES - 1) {
        throw new Error('Cannot connect to server. Make sure the backend is running (./mvnw spring-boot:run from the backend folder).')
      }
      await sleep(CONNECT_RETRY_DELAYS[attempt])
    }
  }

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message = data?.message || Object.values(data || {})[0] || 'Something went wrong'
    throw new Error(message)
  }

  return data
}

export function registerUser({ fullName, email, password }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password }),
  })
}

export async function loginUser({ email, password }) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return saveSession(data)
}

export function getCurrentUser() {
  return request('/users/me')
}

export function changePassword({ currentPassword, newPassword }) {
  return request('/users/me/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

// Profile
export function getProfile() { return request('/users/me/profile') }
export function updateProfile(data) {
  return request('/users/me/profile', { method: 'PUT', body: JSON.stringify(data) })
}

// Lifestyle / Stress Analysis
export function submitLifestyle(data) {
  return request('/lifestyle', { method: 'POST', body: JSON.stringify(data) })
}
export function getLifestyleHistory() { return request('/lifestyle') }
export function getLifestyleToday() { return request('/lifestyle/today') }
export function getLifestyleLatest() { return request('/lifestyle/latest') }

// Weekly Schedule
export function getWeeklySchedule() { return request('/schedule') }
export function generateWeeklySchedule(stressLevel) {
  return request('/schedule/generate', { method: 'POST', body: JSON.stringify({ stressLevel: stressLevel || 'Normal' }) })
}
export function patchScheduleSlot(itemId, day, status) {
  return request(`/schedule/items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ day, status }) })
}
export function addScheduleSlot(day, slot) {
  return request('/schedule/items', { method: 'POST', body: JSON.stringify({ day, ...slot }) })
}
export function deleteScheduleSlot(itemId, day) {
  return request(`/schedule/items/${itemId}?day=${day}`, { method: 'DELETE' })
}

// Holidays / Leaves
export function getHolidays() { return request('/users/me/holidays') }
export function addHoliday(date, type = 'LEAVE', note = '') {
  return request('/users/me/holidays', { method: 'POST', body: JSON.stringify({ date, type, note }) })
}
export function removeHoliday(date) {
  return request(`/users/me/holidays/${date}`, { method: 'DELETE' })
}

// Tasks
export function getTasks() { return request('/tasks') }
export function createTask(data) {
  return request('/tasks', { method: 'POST', body: JSON.stringify(data) })
}
export function updateTask(id, data) {
  return request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}
export function completeTask(id) {
  return request(`/tasks/${id}/complete`, { method: 'PATCH' })
}
export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: 'DELETE' })
}

// Wellness
export function getWellness() { return request('/wellness') }
export function logWater(amount) {
  return request('/wellness/water', { method: 'POST', body: JSON.stringify({ amount }) })
}
export function deleteWater(id) { return request(`/wellness/water/${id}`, { method: 'DELETE' }) }
export function logWorkout(data) {
  return request('/wellness/workouts', { method: 'POST', body: JSON.stringify(data) })
}
export function deleteWorkout(id) { return request(`/wellness/workouts/${id}`, { method: 'DELETE' }) }

// Schedule
export function getSchedule() { return request('/schedule') }
export function generateSchedule(stressLevel) {
  return request('/schedule/generate', { method: 'POST', body: JSON.stringify({ stressLevel }) })
}
export function updateScheduleItem(itemId, status) {
  return request(`/schedule/items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ status }) })
}
export function addScheduleItem(data) {
  return request('/schedule/items', { method: 'POST', body: JSON.stringify(data) })
}
export function deleteScheduleItem(itemId) {
  return request(`/schedule/items/${itemId}`, { method: 'DELETE' })
}

// Security (OTP / Verification)
export function getSecurityInfo() { return request('/users/me/security') }
export function sendEmailVerificationOtp() { return request('/users/me/security/send-email-otp', { method: 'POST' }) }
export function verifyEmail(otp) { return request('/users/me/security/verify-email', { method: 'POST', body: JSON.stringify({ otp }) }) }
export function sendPhoneVerificationOtp(phoneNumber) { return request('/users/me/security/send-phone-otp', { method: 'POST', body: JSON.stringify({ phoneNumber }) }) }
export function verifyPhone(otp) { return request('/users/me/security/verify-phone', { method: 'POST', body: JSON.stringify({ otp }) }) }

// Forgot Password (public — no auth token needed)
export function forgotPasswordInitiate(email, method = 'email') {
  return request('/auth/forgot-password/initiate', { method: 'POST', body: JSON.stringify({ email, method }) })
}
export function forgotPasswordReset(email, otp, newPassword) {
  return request('/auth/forgot-password/reset', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) })
}

// Admin
export function adminGetUsers() { return request('/admin/users') }
export function adminDeleteUser(id) { return request(`/admin/users/${id}`, { method: 'DELETE' }) }
export function adminGetBestEngaged() { return request('/admin/users/best-engaged') }
export function adminGetInactiveUsers(days = 30) { return request(`/admin/users/inactive?days=${days}`) }
export function adminGetStats() { return request('/admin/stats') }
export function adminGetFeedbacks() { return request('/admin/feedbacks') }
export function adminDeleteFeedback(id) { return request(`/admin/feedbacks/${id}`, { method: 'DELETE' }) }

// Account self-deletion
export function deleteMyAccount() { return request('/users/me', { method: 'DELETE' }) }

// Feedback
export function getPublicFeedbacks() { return request('/feedback/public') }
export function getMyFeedback() { return request('/feedback/mine') }
export function submitFeedback(message, rating) {
  return request('/feedback', { method: 'POST', body: JSON.stringify({ message, rating }) })
}
export function deleteMyFeedback() { return request('/feedback/mine', { method: 'DELETE' }) }

// Notifications
export function getNotifications() { return request('/notifications') }
export function getUnreadCount() { return request('/notifications/unread-count') }
export function markNotificationRead(id) { return request(`/notifications/${id}/read`, { method: 'PATCH' }) }
export function markAllNotificationsRead() { return request('/notifications/read-all', { method: 'POST' }) }
export function deleteNotification(id) { return request(`/notifications/${id}`, { method: 'DELETE' }) }

function saveSession(auth) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(auth))
  return auth
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

export function getToken() {
  return getSession()?.token ?? null
}

export function getRole() {
  return getSession()?.role ?? null
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function patchSession(fields) {
  const session = getSession()
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, ...fields }))
}
