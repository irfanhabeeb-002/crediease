import { Button, Stack } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function AdminNav() {
  return (
    <Stack direction="row" spacing={2} sx={{ my: 2 }}>
      <Button component={RouterLink} to="/cards/issue">Issue Card</Button>
      <Button component={RouterLink} to="/cards/manage">Manage Card</Button>
      <Button component={RouterLink} to="/debug">Testing Tool</Button>
    </Stack>
  )
}


