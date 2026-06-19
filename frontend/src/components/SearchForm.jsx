import { useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  Paper,
  Slider,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { useGallery } from '../contexts/GalleryContext.jsx'

const defaultValues = {
  width: 300,
  height: 300,
  limit: 12,
  blur: 0,
  grayscale: false,
  search: '',
}

function toNumber(value) {
  if (value === '') {
    return NaN
  }

  return Number(value)
}

function getFieldError(field, value) {
  if (field === 'width' || field === 'height') {
    if (value === '') {
      return 'Este campo é obrigatório.'
    }

    const numericValue = toNumber(value)

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

    const numericValue = toNumber(value)

    if (Number.isNaN(numericValue)) {
      return 'Informe um número válido.'
    }

    if (numericValue < 1 || numericValue > 100) {
      return 'O valor deve estar entre 1 e 100.'
    }
  }

  return ''
}

function validateForm(values) {
  return {
    width: getFieldError('width', values.width),
    height: getFieldError('height', values.height),
    limit: getFieldError('limit', values.limit),
  }
}

function SearchForm() {
  const { applyFilters, filters, loading, error } = useGallery()
  const [formValues, setFormValues] = useState({
    width: filters.width,
    height: filters.height,
    limit: filters.limit,
    blur: filters.blur,
    grayscale: filters.grayscale,
    search: filters.search || '',
  })
  const [fieldErrors, setFieldErrors] = useState({
    width: '',
    height: '',
    limit: '',
  })
  const [touched, setTouched] = useState({
    width: false,
    height: false,
    limit: false,
  })
  const [submitted, setSubmitted] = useState(false)

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

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitted(true)

    const validation = validateForm(formValues)
    setFieldErrors(validation)
    setTouched({ width: true, height: true, limit: true })

    if (Object.values(validation).some(Boolean)) {
      return
    }

    await applyFilters({
      width: Number(formValues.width),
      height: Number(formValues.height),
      limit: Number(formValues.limit),
      blur: formValues.blur,
      grayscale: formValues.grayscale,
      search: formValues.search,
      page: 1,
    })
  }

  const handleClear = async () => {
    setSubmitted(false)
    setTouched({ width: false, height: false, limit: false })
    setFieldErrors({ width: '', height: '', limit: '' })
    setFormValues(defaultValues)

    await applyFilters({
      ...defaultValues,
      page: 1,
    })
  }

  return (
    <Paper sx={{ p: '2rem' }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filtros de busca
        </Typography>

        <TextField
          fullWidth
          label="Pesquisar por título ou autor"
          value={formValues.search}
          onChange={(e) => setFormValues(prev => ({ ...prev, search: e.target.value }))}
          sx={{ mb: 3 }}
        />

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
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
              inputProps={{ min: 10, max: 5000 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
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
              inputProps={{ min: 10, max: 5000 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
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
              inputProps={{ min: 1, max: 100 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ px: 1, pt: 1 }}>
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

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={<Switch checked={formValues.grayscale} onChange={handleGrayscaleChange} />}
              label="Escala de cinza"
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress color="inherit" size={18} /> : <SearchIcon />}
            disabled={loading}
          >
            Buscar imagens
          </Button>

          <Button
            type="button"
            variant="outlined"
            color="secondary"
            onClick={handleClear}
            disabled={loading}
          >
            Limpar
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}

export default SearchForm
