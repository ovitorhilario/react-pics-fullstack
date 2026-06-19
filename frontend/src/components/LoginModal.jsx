import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { useGallery } from '../contexts/GalleryContext.jsx'

function LoginModal({ open, onClose }) {
  const { login } = useGallery()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Usuário e senha são obrigatórios.')
      return
    }

    setLoading(true)
    setError(null)

    const result = await login(username.trim(), password)
    setLoading(false)

    if (result.success) {
      // Limpar campos
      setUsername('')
      setPassword('')
      setError(null)
      onClose()
    } else {
      // Exibe a mensagem de erro exata vinda do back-end
      setError(result.error)
    }
  }

  const handleClose = () => {
    if (loading) return
    setUsername('')
    setPassword('')
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Acessar Conta</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Usuário"
            type="text"
            fullWidth
            required
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Senha"
            type="password"
            fullWidth
            required
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={loading} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading && <CircularProgress size={16} color="inherit" />}
          >
            Entrar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default LoginModal
