import { Box, Button, Container, Paper, Stack, TextField, Typography, Alert, Divider } from '@mui/material'
import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { api, authHeaders } from '../lib/http'

export default function CardFunctionsPage() {
  const { token, user, logout } = useAuth()
  const [cardno, setCardno] = useState('')
  const [status, setStatus] = useState<any>(null)
  const [txs, setTxs] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  async function fetchStatus() {
    setError(null)
    try {
      const res = await api.get(`/cards/${cardno}/status`, { headers: authHeaders(token) })
      if (!res.data?.success) throw new Error(res.data?.message || 'Failed')
      setStatus(res.data.data)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message)
      setStatus(null)
    }
  }

  async function fetchTxs() {
    setError(null)
    try {
      const res = await api.get(`/cards/${cardno}/transactions`, { headers: authHeaders(token) })
      if (!res.data?.success && !res.data?.transactions) throw new Error(res.data?.message || 'Failed')
      // Backend older route returns {transactions: []} without wrapper; normalize
      const list = res.data?.data?.transactions || res.data?.transactions || []
      setTxs(list)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message)
      setTxs([])
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Welcome {user?.username} ({user?.role})</Typography>
          <Button onClick={logout}>Logout</Button>
        </Stack>
        <Divider sx={{ my: 2 }} />
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Card Number" value={cardno} onChange={e => setCardno(e.target.value)} fullWidth />
          <Button variant="contained" onClick={fetchStatus}>View Status</Button>
          <Button variant="outlined" onClick={fetchTxs}>List Transactions</Button>
        </Stack>
        {status && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1">Status</Typography>
            <pre>{JSON.stringify(status, null, 2)}</pre>
          </Box>
        )}
        {!!txs.length && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1">Recent Transactions</Typography>
            <pre>{JSON.stringify(txs, null, 2)}</pre>
          </Box>
        )}
      </Paper>
    </Container>
  )
}


