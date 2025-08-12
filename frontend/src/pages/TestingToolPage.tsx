import { Alert, Box, Button, Container, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { api, authHeaders } from '../lib/http'

export default function TestingToolPage() {
  const { token } = useAuth()
  const [method, setMethod] = useState<'GET'|'POST'|'PUT'>('GET')
  const [path, setPath] = useState('/health')
  const [body, setBody] = useState('')
  const [resp, setResp] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)

  async function send() {
    setErr(null); setResp(null)
    try {
      const cfg = { headers: authHeaders(token) }
      let res
      if (method === 'GET') res = await api.get(path, cfg)
      if (method === 'POST') res = await api.post(path, body ? JSON.parse(body) : {}, cfg)
      if (method === 'PUT') res = await api.put(path, body ? JSON.parse(body) : {}, cfg)
      setResp(res?.data)
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message)
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Testing Tool</Typography>
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Method" value={method} onChange={e => setMethod(e.target.value as any)} sx={{ minWidth: 120 }}>
              <MenuItem value="GET">GET</MenuItem>
              <MenuItem value="POST">POST</MenuItem>
              <MenuItem value="PUT">PUT</MenuItem>
            </TextField>
            <TextField label="Path" value={path} onChange={e => setPath(e.target.value)} fullWidth />
            <Button variant="contained" onClick={send}>Send</Button>
          </Stack>
          {(method === 'POST' || method === 'PUT') && (
            <TextField label="JSON Body" value={body} onChange={e => setBody(e.target.value)} fullWidth multiline minRows={5} />
          )}
          {resp && (
            <Box>
              <Typography variant="subtitle1">Response</Typography>
              <pre>{JSON.stringify(resp, null, 2)}</pre>
            </Box>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}


