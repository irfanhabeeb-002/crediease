import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function TopBar() {
  const { user, isAuthenticated, logout } = useAuth()
  const nav = useNavigate()
  function doLogout() { logout(); nav('/login') }
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>CrediEase</Typography>
        {isAuthenticated && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Button component={RouterLink} to="/" color="inherit">Home</Button>
            <Button component={RouterLink} to="/debug" color="inherit">Debug</Button>
            {user?.role === 'ADMIN' && (
              <>
                <Button component={RouterLink} to="/cards/issue" color="inherit">Issue</Button>
                <Button component={RouterLink} to="/cards/manage" color="inherit">Manage</Button>
              </>
            )}
            <Typography variant="body2" color="text.secondary">{user?.username} ({user?.role})</Typography>
            <Button onClick={doLogout} color="inherit">Logout</Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  )
}


