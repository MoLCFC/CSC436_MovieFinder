import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import './App.css'
import { SearchBar } from './components/SearchBar.jsx'
import { MovieGrid } from './components/MovieGrid.jsx'
import { MovieDetailModal } from './components/MovieDetailModal.jsx'
import { useOmdbSearch } from './hooks/useOmdbSearch.js'
import { FiltersBar } from './components/FiltersBar.jsx'
import { useLocalStorage } from './hooks/useLocalStorage.js'

function App() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [filters, setFilters] = useState({ type: '', year: '' })
  const [sort, setSort] = useState('year-desc')
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [favorites, setFavorites] = useLocalStorage('mf_favorites', [])
  const favoritesSet = useMemo(() => new Set(favorites), [favorites])
  const sentinelRef = useRef(null)
  const loadingMoreRef = useRef(false)

  const apiKey = import.meta.env.VITE_OMDB_API_KEY || '42049448'

  const {
    movies,
    totalResults,
    loading,
    error,
    hasMore,
    search,
  } = useOmdbSearch(apiKey)

  useEffect(() => {
    search(query, 1, filters)
    setPage(1)
  }, [query, filters, search])

  const handleLoadMore = useCallback(async () => {
    if (loadingMoreRef.current || loading || error || !hasMore) return
    loadingMoreRef.current = true
    const nextPage = page + 1
    await search(query, nextPage, filters)
    setPage(nextPage)
    loadingMoreRef.current = false
  }, [page, search, query, filters, loading, error, hasMore])

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
    const effectiveSort = sort
    let list = movies
    if (onlyFavorites) {
      list = list.filter(m => favoritesSet.has(m.imdbID))
    }
    const parseYear = (y) => {
      const m = String(y || '').match(/\d{4}/)
      return m ? parseInt(m[0], 10) : 0
    }
    switch (effectiveSort) {
      case 'title-asc':
        return [...list].sort((a, b) => a.Title.localeCompare(b.Title))
      case 'title-desc':
        return [...list].sort((a, b) => b.Title.localeCompare(a.Title))
      case 'year-asc':
        return [...list].sort((a, b) => parseYear(a.Year) - parseYear(b.Year))
      case 'year-desc':
        return [...list].sort((a, b) => parseYear(b.Year) - parseYear(a.Year))
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
    const el = sentinelRef.current
    if (!el) return
    if (!hasMore) return
    const obs = new IntersectionObserver((entries) => {
      const first = entries[0]
      if (first.isIntersecting && !loading && !error && !loadingMoreRef.current) {
        void handleLoadMore()
      }
    }, { root: null, rootMargin: '600px', threshold: 0 })
    obs.observe(el)
    return () => {
      obs.unobserve(el)
      obs.disconnect()
    }
  }, [loading, error, hasMore, handleLoadMore]) 

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Movie Finder</h1>
        {headerNote && <p className="app__note">{headerNote}</p>}
        <div className="app__controls">
          <label className="switch" htmlFor="favorites-only-header">
            <input
              type="checkbox"
              checked={onlyFavorites}
              onChange={(e) => setOnlyFavorites(e.target.checked)}
              id="favorites-only-header"
              name="onlyFavoritesHeader"
            />
            Favorites only
          </label>
        </div>
      </header>

      <SearchBar
        defaultValue={query}
        onSearch={(value) => {
          const trimmed = value.trim()
          setQuery(trimmed)
          // Prefer newest when empty search
          if (trimmed === '') setSort('year-desc')
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
        {totalResults > 0 && query === '' && (
          <p>Latest releases (newest first)</p>
        )}
        {totalResults > 0 && query !== '' && (
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
        <div className="infinite-sentinel" ref={sentinelRef} />
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
