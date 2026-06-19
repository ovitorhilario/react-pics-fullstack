import { memo, useState } from 'react'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import {
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
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {image.author}
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
