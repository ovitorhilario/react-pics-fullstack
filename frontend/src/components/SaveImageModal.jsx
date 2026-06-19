import { useState, useEffect } from 'react'
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

function SaveImageModal({ open, onClose, image, onSave }) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (image) {
      setTitle(`Foto por ${image.author}`)
    } else {
      setTitle('')
    }
    setError(null)
  }, [image, open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('O título é obrigatório.')
      return
    }

    setLoading(true)
    setError(null)

    const result = await onSave(image, title.trim())

    setLoading(false)
    if (result && result.success) {
      onClose()
    } else if (result && result.error) {
      setError(result.error)
    }
  }

  const handleClose = () => {
    if (loading) return
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Salvar na Minha Galeria</DialogTitle>
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
            label="Título da Imagem"
            type="text"
            fullWidth
            required
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            Salvar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default SaveImageModal
