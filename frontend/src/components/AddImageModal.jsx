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

function AddImageModal({ open, onClose }) {
  const { insertPicture } = useGallery()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [width, setWidth] = useState('300')
  const [height, setHeight] = useState('300')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) {
      setError('Título e URL são obrigatórios.')
      return
    }

    setLoading(true)
    setError(null)

    const wNum = parseInt(width, 10) || 300
    const hNum = parseInt(height, 10) || 300

    const result = await insertPicture({
      title: title.trim(),
      url: url.trim(),
      width: wNum,
      height: hNum
    })

    setLoading(false)

    if (result.success) {
      // Limpar campos
      setTitle('')
      setUrl('')
      setWidth('300')
      setHeight('300')
      setError(null)
      onClose()
    } else {
      // Exibe mensagem de erro exata vinda do back-end
      setError(result.error)
    }
  }

  const handleClose = () => {
    if (loading) return
    setTitle('')
    setUrl('')
    setWidth('300')
    setHeight('300')
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Inserir Nova Imagem</DialogTitle>
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
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="URL da Imagem"
            type="url"
            fullWidth
            required
            variant="outlined"
            placeholder="Ex: https://picsum.photos/id/10/2500/1667"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              margin="dense"
              label="Largura"
              type="number"
              fullWidth
              variant="outlined"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              disabled={loading}
              inputProps={{ min: 10, max: 5000 }}
            />
            <TextField
              margin="dense"
              label="Altura"
              type="number"
              fullWidth
              variant="outlined"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              disabled={loading}
              inputProps={{ min: 10, max: 5000 }}
            />
          </Box>
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
            Adicionar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default AddImageModal
