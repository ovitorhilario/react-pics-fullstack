import { useState, useEffect } from 'react'
import { AppBar, Box, Button, Container, Paper, Tab, Tabs, Toolbar, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import SearchForm from './components/SearchForm.jsx'
import ImageGallery from './components/ImageGallery.jsx'
import PicsumGallery from './components/PicsumGallery.jsx'
import LoginModal from './components/LoginModal.jsx'
import AddImageModal from './components/AddImageModal.jsx'
import { GalleryProvider, useGallery } from './contexts/GalleryContext.jsx'

function MainAppContent() {
  const { user, logout } = useGallery()
  const [loginOpen, setLoginOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)

  // Reset tab selection to 0 if the user logs out
  useEffect(() => {
    if (!user) {
      setTabValue(0)
    }
  }, [user])

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
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_, val) => setTabValue(val)}
            aria-label="abas da galeria"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Galeria Pública (Picsum)" sx={{ fontWeight: 600, fontSize: '1rem' }} />
            {user && <Tab label="Galeria de Posts (Usuários)" sx={{ fontWeight: 600, fontSize: '1rem' }} />}
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <Paper sx={{ p: 3 }}>
            <PicsumGallery />
          </Paper>
        )}

        {tabValue === 1 && user && (
          <Box>
            <SearchForm />
            <Paper sx={{ p: 3, mt: 2 }}>
              <ImageGallery />
            </Paper>
          </Box>
        )}
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

