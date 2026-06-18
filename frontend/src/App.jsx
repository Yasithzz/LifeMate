import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ProtectedRoute from './components/ProtectedRoute'

// User pages
import DashboardHome from './pages/user/DashboardHome'
import LifestylePage from './pages/user/LifestylePage'
import SchedulePage from './pages/user/SchedulePage'
import TasksPage from './pages/user/TasksPage'
import WellnessPage from './pages/user/WellnessPage'
import NotificationsPage from './pages/user/NotificationsPage'
import ProfilePage from './pages/user/ProfilePage'
import UserSettingsPage from './pages/user/SettingsPage'
import ProductivityPage from './pages/user/ProductivityPage'

// Admin pages
import AdminDashboard from './pages/admin/DashboardHome'
import UsersPage from './pages/admin/UsersPage'
import AdminSettingsPage from './pages/admin/SettingsPage'

const U = ({ children }) => <ProtectedRoute requiredRole="USER">{children}</ProtectedRoute>
const A = ({ children }) => <ProtectedRoute requiredRole="ADMIN">{children}</ProtectedRoute>

function App() {
  useEffect(() => {
    const accent = localStorage.getItem('lm_accent') || 'violet'
    if (accent !== 'violet') {
      document.documentElement.setAttribute('data-accent', accent)
    } else {
      document.documentElement.removeAttribute('data-accent')
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* User dashboard */}
        <Route path="/dashboard" element={<U><DashboardHome /></U>} />
        <Route path="/dashboard/lifestyle" element={<U><LifestylePage /></U>} />
        <Route path="/dashboard/schedule" element={<U><SchedulePage /></U>} />
        <Route path="/dashboard/tasks" element={<U><TasksPage /></U>} />
        <Route path="/dashboard/wellness" element={<U><WellnessPage /></U>} />
        <Route path="/dashboard/notifications" element={<U><NotificationsPage /></U>} />
        <Route path="/dashboard/profile" element={<U><ProfilePage /></U>} />
        <Route path="/dashboard/settings" element={<U><UserSettingsPage /></U>} />
        <Route path="/dashboard/productivity" element={<U><ProductivityPage /></U>} />

        {/* Admin dashboard */}
        <Route path="/admin" element={<A><AdminDashboard /></A>} />
        <Route path="/admin/users" element={<A><UsersPage /></A>} />
        <Route path="/admin/settings" element={<A><AdminSettingsPage /></A>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
