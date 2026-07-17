import { Navigate } from 'react-router-dom'

function PrivateRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem('squadra_token')
  if (!token) {
    return <Navigate to="/Login" replace />
  }

  if (adminOnly) {
    try {
      const user = JSON.parse(localStorage.getItem('squadra_user') || '{}')
      if (user.permissaoId !== 1) {
        return <Navigate to="/" replace />
      }
    } catch {
      return <Navigate to="/Login" replace />
    }
  }

  return children
}

export default PrivateRoute
