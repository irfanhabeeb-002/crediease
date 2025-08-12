import { Box, Button, Container, Paper, Stack, TextField, Typography, Alert } from '@mui/material'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function LoginPage() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await login(username, password)
      nav('/')
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Login failed')
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>CrediEase Login</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} required />
            <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <Button type="submit" variant="contained">Login</Button>
            <Typography variant="body2">No account? <Link to="/register">Register</Link></Typography>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}


