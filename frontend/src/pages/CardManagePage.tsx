import { Alert, Box, Button, Container, Grid, Paper, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { api, authHeaders } from '../lib/http'

export default function CardManagePage() {
  const { token } = useAuth()
  const [cardno, setCardno] = useState('')
  const [limit, setLimit] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function action(act: 'activate'|'block'|'set_limit') {
    setMsg(null); setErr(null)
    try {
      const payload: any = { action: act }
      if (act === 'set_limit') payload.limit = Number(limit)
      const res = await api.put(`/cards/${cardno}/status`, payload, { headers: authHeaders(token) })
      if (!res.data?.success) throw new Error(res.data?.message)
      setMsg(`Updated: ${res.data.data.status} | CreditLimit=${res.data.data.creditLimit}`)
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message)
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Manage Card (Admin)</Typography>
        {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        <Stack spacing={2}>
          <TextField label="Card Number" value={cardno} onChange={e => setCardno(e.target.value)} />
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={() => action('activate')}>Activate</Button>
            <Button variant="outlined" onClick={() => action('block')}>Block</Button>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={8}><TextField label="New Limit" value={limit} onChange={e => setLimit(e.target.value)} fullWidth /></Grid>
            <Grid item xs={4}><Button fullWidth variant="contained" onClick={() => action('set_limit')}>Set Limit</Button></Grid>
          </Grid>
        </Stack>
      </Paper>
    </Container>
  )
}


