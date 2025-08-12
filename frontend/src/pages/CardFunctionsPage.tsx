import { Box, Button, Container, Paper, Stack, TextField, Typography, Alert, Divider, Grid, Chip, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, LinearProgress } from '@mui/material'
import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { api, authHeaders } from '../lib/http'

export default function CardFunctionsPage() {
  const { token, user, logout } = useAuth()
  const [cardno, setCardno] = useState('')
  const [status, setStatus] = useState<any>(null)
  const [txs, setTxs] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  function formatCurrency(n: number | string) {
    const num = typeof n === 'string' ? Number(n) : n
    if (Number.isNaN(num)) return String(n)
    return num.toLocaleString(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
  }

  function formatDateTime(iso: string) {
    const d = new Date(iso)
    return isNaN(d.getTime()) ? iso : d.toLocaleString()
  }

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
            <Typography variant="subtitle1" gutterBottom>Card Overview</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="overline">Status</Typography>
                    <Box>
                      <Chip
                        label={status.status}
                        color={status.status === 'ACTIVE' ? 'success' : status.status === 'BLOCKED' ? 'error' : 'warning'}
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="overline">Credit Limit</Typography>
                    <Typography variant="h6">{formatCurrency(status.creditLimit)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="overline">Remaining</Typography>
                    <Typography variant="h6">{formatCurrency(status.remainingLimit)}</Typography>
                    {status.creditLimit > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress variant="determinate" value={Math.max(0, Math.min(100, (status.remainingLimit / status.creditLimit) * 100))} />
                        <Typography variant="caption">{Math.round((status.remainingLimit / status.creditLimit) * 100)}% left</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>Recent Transactions</Typography>
          {!txs.length ? (
            <Typography variant="body2" color="text.secondary">No transactions to show.</Typography>
          ) : (
            <Paper variant="outlined" sx={{ width: '100%', overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {txs.map((t) => (
                    <TableRow key={t.id} hover>
                      <TableCell>{formatDateTime(t.when)}</TableCell>
                      <TableCell>{t.desc}</TableCell>
                      <TableCell align="right">{formatCurrency(t.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Box>
      </Paper>
    </Container>
  )
}


