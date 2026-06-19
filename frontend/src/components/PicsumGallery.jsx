import { useState, useEffect } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  IconButton,
  Pagination,
  Snackbar,
  Tooltip,
  Typography,
  Skeleton,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import SaveIcon from '@mui/icons-material/Save'
import { useGallery } from '../contexts/GalleryContext.jsx'
import SaveImageModal from './SaveImageModal.jsx'

const skeletonItems = Array.from({ length: 12 }, (_, index) => index)

function PicsumGallery() {
  const { user, insertPicture } = useGallery()
  const [images, setImages] = useState([])
  const [page, setPage] = useState(1)
  const [limit] = useState(12)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [imageToSave, setImageToSave] = useState(null)

  useEffect(() => {
    let active = true
    const fetchPicsum = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=${limit}`)
        if (!response.ok) {
          throw new Error('Não foi possível carregar as imagens do Picsum.')
        }
        const data = await response.json()
        if (active) {
          setImages(data)
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Erro ao buscar imagens públicas.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchPicsum()
    return () => {
      active = false
    }
  }, [page, limit])

  const handleCopyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      setSnackbar({
        open: true,
        message: 'URL da imagem copiada com sucesso!',
        severity: 'success',
      })
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Erro ao copiar a URL da imagem.',
        severity: 'error',
      })
    }
  }

  const handleSaveImageClick = (img) => {
    setImageToSave(img)
    setSaveModalOpen(true)
  }

  const handleSaveImage = async (img, chosenTitle) => {
    const payload = {
      title: chosenTitle,
      url: img.download_url,
      width: img.width,
      height: img.height,
    }

    const result = await insertPicture(payload)
    if (result.success) {
      setSnackbar({
        open: true,
        message: 'Imagem salva na sua galeria!',
        severity: 'success',
      })
      return { success: true }
    } else {
      setSnackbar({
        open: true,
        message: `Erro ao salvar imagem: ${result.error}`,
        severity: 'error',
      })
      return { success: false, error: result.error }
    }
  }

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Grid container spacing={2}>
          {skeletonItems.map((item) => (
            <Grid key={item} size={{ xs: 12, sm: 6, md: 4, lg: 3 }} sx={{ minWidth: '300px', }}>
              <Box sx={{ borderRadius: 1.5, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <Skeleton variant="rectangular" sx={{ width: '100%', aspectRatio: '1/1' }} />
                <Box sx={{ p: 1.5 }}>
                  <Skeleton width="65%" height={32} sx={{ mb: 1 }} />
                  <Skeleton width="45%" height={24} />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {images.map((img) => {
          const previewUrl = `https://picsum.photos/id/${img.id}/300/300`
          return (
            <Grid key={img.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={previewUrl}
                  alt={`Imagem por ${img.author}`}
                  sx={{ aspectRatio: '1/1', objectFit: 'cover', bgcolor: '#f0f0f0' }}
                />
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, noWrap: true }}>
                    {img.author}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Original: {img.width} x {img.height}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Tooltip title="Copiar URL original">
                    <Button
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => handleCopyUrl(img.download_url)}
                      variant="outlined"
                    >
                      Copiar URL
                    </Button>
                  </Tooltip>
                  {user && (
                    <Tooltip title="Salvar na minha galeria">
                      <IconButton
                        color="primary"
                        onClick={() => handleSaveImageClick(img)}
                        sx={{
                          border: '1px solid',
                          borderColor: 'primary.main',
                          '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' },
                        }}
                      >
                        <SaveIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </CardActions>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {images.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Pagination
            count={page + 5} // Picsum API doesn't return total pages, so we offer dynamic forward browsing
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      <SaveImageModal
        open={saveModalOpen}
        onClose={() => {
          setSaveModalOpen(false)
          setImageToSave(null)
        }}
        image={imageToSave}
        onSave={handleSaveImage}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default PicsumGallery
