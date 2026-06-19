import { useState } from 'react'
import { AppBar, Box, Button, Container, Grid, Paper, Toolbar, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import SearchForm from './components/SearchForm.jsx'
import ImageGallery from './components/ImageGallery.jsx'
import LoginModal from './components/LoginModal.jsx'
import AddImageModal from './components/AddImageModal.jsx'
import { GalleryProvider, useGallery } from './contexts/GalleryContext.jsx'

function MainAppContent() {
  const { user, logout } = useGallery()
  const [loginOpen, setLoginOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="primary">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 700 }}>
            React Pics
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user ? (
              <>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#fff', display: { xs: 'none', sm: 'block' } }}>
                  Olá, <strong>{user.username}</strong>!
                </Typography>
                <Button
                  color="inherit"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setAddOpen(true)}
                  sx={{ borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#fff' } }}
                >
                  Inserir Imagem
                </Button>
                <Button
                  color="inherit"
                  startIcon={<LogoutIcon />}
                  onClick={logout}
                >
                  Sair
                </Button>
              </>
            ) : (
              <Button
                color="inherit"
                variant="outlined"
                startIcon={<LoginIcon />}
                onClick={() => setLoginOpen(true)}
                sx={{ borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#fff' } }}
              >
                Entrar
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <SearchForm />
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper sx={{ p: 2 }}>
              <ImageGallery />
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Modais de interação */}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <AddImageModal open={addOpen} onClose={() => setAddOpen(false)} />
    </Box>
  )
}

function App() {
  return (
    <GalleryProvider>
      <MainAppContent />
    </GalleryProvider>
  )
}

export default App

