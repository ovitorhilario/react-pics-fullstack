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
  TextField,
  Slider,
  Switch,
  FormControlLabel,
  Paper,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import SaveIcon from '@mui/icons-material/Save'
import { useGallery } from '../contexts/GalleryContext.jsx'
import SaveImageModal from './SaveImageModal.jsx'

const skeletonItems = Array.from({ length: 12 }, (_, index) => index)

const defaultFilters = {
  width: 300,
  height: 300,
  limit: 12,
  blur: 0,
  grayscale: false,
}

function getFieldError(field, value) {
  if (field === 'width' || field === 'height') {
    if (value === '') {
      return 'Este campo é obrigatório.'
    }
    const numericValue = Number(value)
    if (Number.isNaN(numericValue)) {
      return 'Informe um número válido.'
    }
    if (numericValue < 10 || numericValue > 5000) {
      return 'O valor deve estar entre 10 e 5000.'
    }
  }
  if (field === 'limit') {
    if (value === '') {
      return 'Este campo é obrigatório.'
    }
    const numericValue = Number(value)
    if (Number.isNaN(numericValue)) {
      return 'Informe um número válido.'
    }
    if (numericValue < 1 || numericValue > 100) {
      return 'O valor deve estar entre 1 e 100.'
    }
  }
  return ''
}

function PicsumGallery() {
  const { user, insertPicture } = useGallery()
  const [images, setImages] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [imageToSave, setImageToSave] = useState(null)

  const [formValues, setFormValues] = useState({ ...defaultFilters })
  const [activeFilters, setActiveFilters] = useState({ ...defaultFilters })
  const [fieldErrors, setFieldErrors] = useState({ width: '', height: '', limit: '' })
  const [touched, setTouched] = useState({ width: false, height: false, limit: false })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    let active = true
    const fetchPicsum = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=${activeFilters.limit}`)
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
  }, [page, activeFilters.limit])

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

  const handleTouchedChange = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }))
  }

  const handleNumberChange = (field) => (event) => {
    const value = event.target.value
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (touched[field] || submitted) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: getFieldError(field, value),
      }))
    }
  }

  const handleBlurChange = (_, value) => {
    setFormValues((prev) => ({
      ...prev,
      blur: value,
    }))
  }

  const handleGrayscaleChange = (event) => {
    setFormValues((prev) => ({
      ...prev,
      grayscale: event.target.checked,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)

    const errors = {
      width: getFieldError('width', formValues.width),
      height: getFieldError('height', formValues.height),
      limit: getFieldError('limit', formValues.limit),
    }
    setFieldErrors(errors)
    setTouched({ width: true, height: true, limit: true })

    if (Object.values(errors).some(Boolean)) {
      return
    }

    setActiveFilters({
      width: Number(formValues.width),
      height: Number(formValues.height),
      limit: Number(formValues.limit),
      blur: formValues.blur,
      grayscale: formValues.grayscale,
    })
    setPage(1)
  }

  const handleClear = () => {
    setSubmitted(false)
    setTouched({ width: false, height: false, limit: false })
    setFieldErrors({ width: '', height: '', limit: '' })
    setFormValues({ ...defaultFilters })
    setActiveFilters({ ...defaultFilters })
    setPage(1)
  }

  const aspectRatio = `${activeFilters.width} / ${activeFilters.height}`

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Filtrar Imagens Públicas
          </Typography>

          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Largura"
                value={formValues.width}
                onChange={handleNumberChange('width')}
                onBlur={() => handleTouchedChange('width')}
                error={Boolean((touched.width || submitted) && fieldErrors.width)}
                helperText={(touched.width || submitted) && fieldErrors.width ? fieldErrors.width : ' '}
                slotProps={{ htmlInput: { min: 10, max: 5000 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Altura"
                value={formValues.height}
                onChange={handleNumberChange('height')}
                onBlur={() => handleTouchedChange('height')}
                error={Boolean((touched.height || submitted) && fieldErrors.height)}
                helperText={(touched.height || submitted) && fieldErrors.height ? fieldErrors.height : ' '}
                slotProps={{ htmlInput: { min: 10, max: 5000 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Quantidade por página"
                value={formValues.limit}
                onChange={handleNumberChange('limit')}
                onBlur={() => handleTouchedChange('limit')}
                error={Boolean((touched.limit || submitted) && fieldErrors.limit)}
                helperText={(touched.limit || submitted) && fieldErrors.limit ? fieldErrors.limit : ' '}
                slotProps={{ htmlInput: { min: 1, max: 100 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex', gap: 1.5, height: 56, alignItems: 'center', mb: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ height: '100%' }}
              >
                Filtrar
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                onClick={handleClear}
                sx={{ height: '100%' }}
              >
                Limpar
              </Button>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <Box sx={{ px: 1 }}>
                <Typography sx={{ mb: 1 }}>Desfoque: {formValues.blur}</Typography>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={formValues.blur}
                  onChange={handleBlurChange}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={<Switch checked={formValues.grayscale} onChange={handleGrayscaleChange} />}
                label="Escala de cinza"
              />
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : loading ? (
        <Grid container spacing={2}>
          {skeletonItems.map((item) => (
            <Grid key={item} size={{ xs: 12, sm: 6, md: 4, lg: 3 }} sx={{ minWidth: '300px' }}>
              <Box sx={{ borderRadius: 1.5, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <Skeleton variant="rectangular" sx={{ width: '100%', aspectRatio }} />
                <Box sx={{ p: 1.5 }}>
                  <Skeleton width="65%" height={32} sx={{ mb: 1 }} />
                  <Skeleton width="45%" height={24} />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : images.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary" variant="h6">
            Nenhuma imagem encontrada.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {images.map((img) => {
            const previewUrl = (() => {
              let url = `https://picsum.photos/id/${img.id}/${activeFilters.width}/${activeFilters.height}`
              const params = []
              if (activeFilters.grayscale) params.push('grayscale')
              if (activeFilters.blur > 0) params.push(`blur=${activeFilters.blur}`)
              if (params.length > 0) {
                url += `?${params.join('&')}`
              }
              return url
            })()

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
                    sx={{ aspectRatio, objectFit: 'cover', bgcolor: '#f0f0f0' }}
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
      )}

      {images.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Pagination
            count={page + 5}
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
