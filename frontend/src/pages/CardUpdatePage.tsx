import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { api, authHeaders } from '../lib/http'

export default function CardUpdatePage() {
  const { cardno = '' } = useParams()
  const { token } = useAuth()
  const [holder, setHolder] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [expiry, setExpiry] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setMsg(null)
    try {
      const res = await api.put(`/cards/${cardno}`, { holder, phone, address, expiry }, { headers: authHeaders(token) })
      if (!res.data?.success) throw new Error(res.data?.message)
      setMsg('Card updated')
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Update Card #{cardno}</Typography>
        {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField label="Holder" value={holder} onChange={e => setHolder(e.target.value)} />
            <TextField label="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
            <TextField label="Address" value={address} onChange={e => setAddress(e.target.value)} />
            <TextField label="Expiry (YYYY-MM-DD)" value={expiry} onChange={e => setExpiry(e.target.value)} />
            <Button type="submit" variant="contained">Save</Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}


