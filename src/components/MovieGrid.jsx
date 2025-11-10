import { MovieCard } from './MovieCard.jsx'
import { SkeletonGrid } from './SkeletonGrid.jsx'

export function MovieGrid({ movies, loading, error, onSelect, favoritesSet, onToggleFavorite }) {
  if (error) {
    return <div className="state state--error">Failed to load: {error}</div>
  }

  if (loading && (!movies || movies.length === 0)) {
    return <SkeletonGrid />
  }

  if (!loading && (!movies || movies.length === 0)) {
    return <div className="state">No results. Try another search.</div>
  }

  return (
    <>
      <div className="grid">
        {movies.map((m) => (
          <MovieCard
            key={m.imdbID}
            movie={m}
            onClick={onSelect}
            isFavorite={favoritesSet?.has(m.imdbID)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
      {loading && movies.length > 0 && (
        <div className="state">
          <div className="spinner" aria-label="Loading more" />
          <p>Loading more...</p>
        </div>
      )}
    </>
  )
}


