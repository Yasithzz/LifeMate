const API_BASE_URL = 'http://localhost:8080/api'
const SESSION_KEY = 'lifemate_session'

async function request(path, options = {}) {
  const token = getToken()
  let res
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    })
  } catch {
    throw new Error('Cannot connect to server. Make sure the backend is running (./mvnw spring-boot:run from the backend folder).')
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

export function loginUser({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }).then(saveSession)
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
