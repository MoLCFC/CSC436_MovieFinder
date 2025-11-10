import { useEffect, useState } from 'react'

function Backdrop({ onClick }) {
  return <div className="modal__backdrop" onClick={onClick} />
}

export function MovieDetailModal({ movie, onClose, apiKey }) {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!movie) {
      setDetails(null)
      setError('')
      setLoading(false)
      return
    }
    if (!apiKey) {
      setDetails(null)
      setError('Missing OMDb API key. Add VITE_OMDB_API_KEY in a .env file at project root.')
      setLoading(false)
      return
    }
    let ignore = false
    async function run() {
      setLoading(true)
      setError('')
      try {
        const url = new URL('https://www.omdbapi.com/')
        url.searchParams.set('i', movie.imdbID)
        url.searchParams.set('plot', 'full')
        url.searchParams.set('apikey', apiKey)
        const res = await fetch(url.toString())
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error('Unauthorized with OMDb. Check VITE_OMDB_API_KEY and restart dev server.')
          }
          if (res.status === 429) {
            throw new Error('Rate limited by OMDb. Please wait and try again.')
          }
          throw new Error(`HTTP ${res.status}`)
        }
        const json = await res.json()
        if (ignore) return
        if (json.Response === 'False') {
          throw new Error(json.Error || 'Unknown error')
        }
        setDetails(json)
      } catch (e) {
        if (!ignore) setError(e.message || 'Failed to load details')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [movie, apiKey])

  if (!movie) return null

  return (
    <>
      <Backdrop onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true" aria-label="Movie details">
        <button className="modal__close" onClick={onClose} aria-label="Close">×</button>
        {loading && (
          <div className="state">
            <div className="spinner" />
            <p>Loading details...</p>
          </div>
        )}
        {error && <div className="state state--error">Failed to load details: {error}</div>}
        {!loading && !error && details && (
          <div className="modal__content">
            <div className="modal__poster">
              {details.Poster && details.Poster !== 'N/A' ? (
                <img src={details.Poster} alt={`${details.Title} poster`} />
              ) : (
                <div className="movie-card__placeholder">No Image</div>
              )}
            </div>
            <div className="modal__body">
              <div className="modal__header">
                <h2 className="modal__title">
                  {details.Title} <span className="modal__year">({details.Year})</span>
                </h2>
                <div className="modal__actions">
                  {details.imdbID && (
                    <a
                      className="btn btn--ghost"
                      href={`https://www.imdb.com/title/${details.imdbID}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Open on IMDb"
                    >
                      IMDb
                    </a>
                  )}
                </div>
              </div>
              <p className="modal__sub">
                {details.Rated} • {details.Runtime} • {details.Genre}
              </p>
              <p className="modal__meta">
                <strong>Director:</strong> {details.Director}
              </p>
              <p className="modal__meta">
                <strong>Actors:</strong> {details.Actors}
              </p>
              <p className="modal__plot">{details.Plot}</p>
              <div className="modal__ratings">
                {(details.Ratings || []).map((r) => (
                  <span key={r.Source} className="badge">
                    {r.Source}: {r.Value}
                  </span>
                ))}
                {details.imdbRating && (
                  <span className="badge">IMDb: {details.imdbRating}</span>
                )}
                {details.Metascore && details.Metascore !== 'N/A' && (
                  <span className="badge">Metascore: {details.Metascore}</span>
                )}
              </div>
              {details.Website && details.Website !== 'N/A' && (
                <p className="modal__link">
                  <a href={details.Website} target="_blank" rel="noreferrer">Official site</a>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}


