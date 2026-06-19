import { lazy, Suspense } from 'react'
import { Alert, Box, Grid, Skeleton, Typography } from '@mui/material'
import { useGallery } from '../contexts/GalleryContext.jsx'
import ImageCard from './ImageCard.jsx'
import PaginationControls from './PaginationControls.jsx'

const ImageModal = lazy(() => import('./ImageModal.jsx'))

const skeletonItems = Array.from({ length: 12 }, (_, index) => index)

function ImageGallery() {
  const { images, loading, error, selectImage, filters } = useGallery()
  const skeletonRatio = `${filters.width} / ${filters.height}`

  if (loading) {
    return (
      <Grid container spacing={2}>
        {skeletonItems.map((item) => (
          <Grid key={item} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Box sx={{ borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
              <Skeleton variant="rectangular" sx={{ width: '100%', aspectRatio: skeletonRatio }} />
              <Box sx={{ p: 1.5 }}>
                <Skeleton width="75%" />
                <Skeleton width="55%" />
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (!images.length) {
    return (
      <Typography color="text.secondary">
        Nenhuma imagem encontrada. Ajuste os filtros.
      </Typography>
    )
  }

  return (
    <>
      <Grid container spacing={2}>
        {images.map((image) => (
          <Grid key={image.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <ImageCard image={image} onClick={() => selectImage(image)} />
          </Grid>
        ))}
      </Grid>

      <PaginationControls />

      <Suspense fallback={null}>
        <ImageModal />
      </Suspense>
    </>
  )
}

export default ImageGallery
