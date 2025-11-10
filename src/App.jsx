import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { SearchBar } from './components/SearchBar.jsx'
import { MovieGrid } from './components/MovieGrid.jsx'
import { MovieDetailModal } from './components/MovieDetailModal.jsx'
import { useOmdbSearch } from './hooks/useOmdbSearch.js'
import { FiltersBar } from './components/FiltersBar.jsx'
import { useLocalStorage } from './hooks/useLocalStorage.js'

function App() {
  const [query, setQuery] = useState('batman')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [filters, setFilters] = useState({ type: '', year: '' })
  const [sort, setSort] = useState('relevance')
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [favorites, setFavorites] = useLocalStorage('mf_favorites', [])
  const favoritesSet = useMemo(() => new Set(favorites), [favorites])
  const sentinelRef = useMemo(() => ({ current: null }), [])

  const apiKey = import.meta.env.VITE_OMDB_API_KEY || '42049448'

  const {
    movies,
    totalResults,
    loading,
    error,
    hasMore,
    search,
    reset,
  } = useOmdbSearch(apiKey)

  useEffect(() => {
    search(query, 1, filters)
    setPage(1)
  }, [query, filters, search])

  const handleLoadMore = () => {
    const nextPage = page + 1
    search(query, nextPage, filters)
    setPage(nextPage)
  }

  const handleSelect = (movie) => {
    setSelected(movie)
  }

  const handleCloseModal = () => setSelected(null)

  const headerNote = useMemo(() => {
    if (!apiKey) {
      return 'No OMDb API key found. Add VITE_OMDB_API_KEY to .env for full results.'
    }
    return null
  }, [apiKey])

  const visibleMovies = useMemo(() => {
    let list = movies
    if (onlyFavorites) {
      list = list.filter(m => favoritesSet.has(m.imdbID))
    }
    switch (sort) {
      case 'title-asc':
        return [...list].sort((a, b) => a.Title.localeCompare(b.Title))
      case 'title-desc':
        return [...list].sort((a, b) => b.Title.localeCompare(a.Title))
      case 'year-asc':
        return [...list].sort((a, b) => (a.Year || '').localeCompare(b.Year || ''))
      case 'year-desc':
        return [...list].sort((a, b) => (b.Year || '').localeCompare(a.Year || ''))
      default:
        return list
    }
  }, [movies, onlyFavorites, favoritesSet, sort])

  const onFiltersChange = (partial) => {
    if (partial.type !== undefined) setFilters(prev => ({ ...prev, type: partial.type }))
    if (partial.year !== undefined) setFilters(prev => ({ ...prev, year: partial.year }))
    if (partial.sort !== undefined) setSort(partial.sort)
    if (partial.onlyFavorites !== undefined) setOnlyFavorites(partial.onlyFavorites)
  }

  const toggleFavorite = (movie) => {
    setFavorites(prev => {
      const id = movie.imdbID
      if (prev.includes(id)) {
        return prev.filter(x => x !== id)
      }
      return [...prev, id]
    })
  }

  useEffect(() => {
    if (!sentinelRef.current) return
    if (!hasMore) return
    const el = sentinelRef.current
    const obs = new IntersectionObserver((entries) => {
      const first = entries[0]
      if (first.isIntersecting && !loading && !error) {
        handleLoadMore()
      }
    }, { root: null, rootMargin: '200px', threshold: 0 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [sentinelRef, loading, error, hasMore]) 

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Movie Finder</h1>
        {headerNote && <p className="app__note">{headerNote}</p>}
        <div className="app__controls">
          <label className="switch">
            <input
              type="checkbox"
              checked={onlyFavorites}
              onChange={(e) => setOnlyFavorites(e.target.checked)}
            />
            Favorites only
          </label>
        </div>
      </header>

      <SearchBar
        defaultValue={query}
        onSearch={(value) => {
          const trimmed = value.trim()
          if (!trimmed) {
            reset()
            setQuery('')
            return
          }
          setQuery(trimmed)
        }}
      />

      <FiltersBar
        type={filters.type}
        year={filters.year}
        sort={sort}
        onlyFavorites={onlyFavorites}
        onChange={onFiltersChange}
      />

      <section className="results-meta">
        {totalResults > 0 && (
          <p>
            Showing {visibleMovies.length} of {totalResults} results for "{query}"
          </p>
        )}
      </section>

      <MovieGrid
        movies={visibleMovies}
        loading={loading}
        error={error}
        onSelect={handleSelect}
        favoritesSet={favoritesSet}
        onToggleFavorite={toggleFavorite}
      />

      <div className="actions">
        {hasMore && !loading && !error && (
          <button className="btn" onClick={handleLoadMore}>
            Load more
          </button>
        )}
        <div ref={(el) => (sentinelRef.current = el)} />
      </div>

      <MovieDetailModal movie={selected} onClose={handleCloseModal} apiKey={apiKey} />

      <footer className="app__footer">
        <p>
          Data from <a href="https://www.omdbapi.com/" target="_blank" rel="noreferrer">OMDb API</a>
        </p>
      </footer>
    </div>
  )
}

export default App
