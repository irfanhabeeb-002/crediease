import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CardFunctionsPage from './pages/CardFunctionsPage'
import CardIssuePage from './pages/CardIssuePage'
import CardManagePage from './pages/CardManagePage'
import CardUpdatePage from './pages/CardUpdatePage'
import TestingToolPage from './pages/TestingToolPage'
import { AuthProvider, useAuth } from './lib/auth'
import TopBar from './components/TopBar'

const theme = createTheme()

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <TopBar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ProtectedRoute><CardFunctionsPage /></ProtectedRoute>} />
          <Route path="/cards/issue" element={<AdminRoute><CardIssuePage /></AdminRoute>} />
          <Route path="/cards/manage" element={<AdminRoute><CardManagePage /></AdminRoute>} />
          <Route path="/cards/update/:cardno" element={<AdminRoute><CardUpdatePage /></AdminRoute>} />
          <Route path="/debug" element={<ProtectedRoute><TestingToolPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}


