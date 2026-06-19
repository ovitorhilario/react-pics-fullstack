import { useMemo } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Link,
  Typography,
} from '@mui/material'
import { useGallery } from '../contexts/GalleryContext.jsx'

function ImageModal() {
  const { selectedImage, clearSelection, filters } = useGallery()

  const imageUrl = useMemo(() => {
    if (!selectedImage) return ''

    const picsumMatch = selectedImage.url.match(/picsum\.photos\/id\/(\d+)/)
    if (picsumMatch) {
      const picsumId = picsumMatch[1]
      const modalWidth = 1024
      const aspectRatio = selectedImage.width && selectedImage.height 
        ? selectedImage.width / selectedImage.height 
        : 1.5
      const modalHeight = Math.round(modalWidth / aspectRatio)

      let url = `https://picsum.photos/id/${picsumId}/${modalWidth}/${modalHeight}`
      
      const params = []
      if (filters.grayscale) params.push('grayscale')
      if (filters.blur > 0) params.push(`blur=${filters.blur}`)
      
      if (params.length > 0) {
        url += `?${params.join('&')}`
      }
      return url
    }

    return selectedImage.url
  }, [selectedImage, filters.grayscale, filters.blur])

  return (
    <Dialog open={selectedImage !== null} onClose={clearSelection} fullWidth maxWidth="md">
      {selectedImage ? (
        <DialogContent sx={{ pt: 6, position: 'relative' }}>
          <IconButton
            onClick={clearSelection}
            sx={{ position: 'absolute', top: 12, right: 12 }}
            aria-label="Fechar"
          >
            <CloseIcon />
          </IconButton>

          <Box
            component="img"
            src={imageUrl}
            alt={`Imagem de ${selectedImage.author}`}
            sx={{ width: '100%', borderRadius: 1.5, mb: 2, maxHeight: 520, objectFit: 'cover' }}
          />

          <Typography variant="h6" sx={{ mb: 1 }}>
            {selectedImage.author}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            ID: {selectedImage.id}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Dimensões originais: {selectedImage.width} x {selectedImage.height}
          </Typography>

          <Link href={selectedImage.url} target="_blank" rel="noopener noreferrer">
            Abrir link de download
          </Link>
        </DialogContent>
      ) : null}
    </Dialog>
  )
}

export default ImageModal

