import { memo, useState } from 'react'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
} from '@mui/material'

function ImageCard({ image, onClick }) {
  const [favorite, setFavorite] = useState(false)
  const ratio = image?.renderWidth && image?.renderHeight ? `${image.renderWidth} / ${image.renderHeight}` : '1 / 1'

  const handleFavoriteClick = (event) => {
    event.stopPropagation()
    setFavorite((prev) => !prev)
  }

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: 8,
        },
      }}
    >
      <CardMedia
        component="img"
        image={image.displayUrl}
        alt={`Imagem de ${image.author}`}
        sx={{ aspectRatio: ratio, objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              marginRight: 8,
              borderRadius: '50%',
              backgroundColor: '#e3f2fd',
              padding: 4,
            }}
          >
            <path
              d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
              fill="#1565C0"
            />
          </svg>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {image.author}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
          {image.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dimensões originais: {image.width} x {image.height}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <IconButton onClick={handleFavoriteClick} color={favorite ? 'secondary' : 'default'}>
          {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </CardActions>
    </Card>
  )
}

export default memo(ImageCard)
