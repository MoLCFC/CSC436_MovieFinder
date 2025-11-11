export function MovieCard({ movie, onClick, isFavorite = false, onToggleFavorite }) {
  const { Title, Year, Poster, Type } = movie
  const isPlaceholder = !Poster || Poster === 'N/A'
  return (
    <div
      className="movie-card"
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(movie)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(movie)
        }
      }}
      aria-label={`Open details for ${Title}`}
    >
      <div className="movie-card__poster">
        <button
          type="button"
          className={`movie-card__fav ${isFavorite ? 'movie-card__fav--active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(movie) }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          ★
        </button>
        {isPlaceholder ? (
          <div className="movie-card__placeholder">No Image</div>
        ) : (
          <img src={Poster} alt={`${Title} poster`} loading="lazy" />
        )}
      </div>
      <div className="movie-card__meta">
        <h3 className="movie-card__title">{Title}</h3>
        <p className="movie-card__info">{Year} • {Type}</p>
      </div>
    </div>
  )
}


