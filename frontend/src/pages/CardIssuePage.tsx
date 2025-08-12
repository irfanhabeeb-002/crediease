import { Alert, Box, Button, Container, Grid, Paper, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { api, authHeaders } from '../lib/http'

export default function CardIssuePage() {
  const { token } = useAuth()
  const [form, setForm] = useState({ holder: '', phone: '', aadhar: '', address: '', creditLimit: '50000' })
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  function set<K extends keyof typeof form>(k: K, v: string) { setForm(prev => ({ ...prev, [k]: v })) }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null); setErr(null)
    try {
      const res = await api.post('/cards', {
        ...form,
        creditLimit: Number(form.creditLimit)
      }, { headers: authHeaders(token) })
      if (!res.data?.success) throw new Error(res.data?.message)
      setMsg(`Card issued: ${res.data.data.cardno}`)
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message)
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Issue New Card (Admin)</Typography>
        {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        <Box component="form" onSubmit={onSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField label="Holder" value={form.holder} onChange={e => set('holder', e.target.value)} fullWidth required /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} fullWidth required /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Aadhaar" value={form.aadhar} onChange={e => set('aadhar', e.target.value)} fullWidth required /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Credit Limit" value={form.creditLimit} onChange={e => set('creditLimit', e.target.value)} fullWidth required /></Grid>
            <Grid item xs={12}><TextField label="Address" value={form.address} onChange={e => set('address', e.target.value)} fullWidth multiline minRows={2} /></Grid>
            <Grid item xs={12}><Button type="submit" variant="contained">Issue</Button></Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  )
}


