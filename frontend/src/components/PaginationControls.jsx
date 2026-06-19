import { Box, Button, Pagination, Typography } from '@mui/material'
import { useGallery } from '../contexts/GalleryContext.jsx'

function PaginationControls() {
  const {
    filters: { page, limit },
    total,
    loading,
    goToNextPage,
    goToPrevPage,
  } = useGallery()

  const totalPages = Math.ceil(total / limit) || 1

  const handlePaginationChange = async (_, selectedPage) => {
    if (selectedPage > page) {
      await goToNextPage()
      return
    }

    if (selectedPage < page) {
      await goToPrevPage()
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        mt: 3,
      }}
    >
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        Página {page} de {totalPages}
      </Typography>

      <Pagination
        page={page}
        count={totalPages}
        color="primary"
        onChange={handlePaginationChange}
        disabled={loading}
      />

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" onClick={goToPrevPage} disabled={loading || page <= 1}>
          Anterior
        </Button>
        <Button variant="contained" onClick={goToNextPage} disabled={loading || page >= totalPages}>
          Próxima
        </Button>
      </Box>
    </Box>
  )
}

export default PaginationControls
