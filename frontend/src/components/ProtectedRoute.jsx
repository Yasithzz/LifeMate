import { Navigate } from 'react-router-dom'
import { getToken, getRole } from '../lib/api'

export default function ProtectedRoute({ requiredRole, children }) {
  const token = getToken()
  const role = getRole()

  if (!token) return <Navigate to="/login" replace />
  if (requiredRole && role !== requiredRole) return <Navigate to="/login" replace />

  return children
}
