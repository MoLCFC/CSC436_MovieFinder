import { useCallback, useRef, useState } from 'react'

// Curated recent releases for default feed (newest → oldest)
const DEFAULT_IMDB_IDS = [
  'tt22022452', // Inside Out 2 (2024)
  'tt15239678', // Dune: Part Two (2024)
  'tt6263850',  // Deadpool & Wolverine (2024)
  'tt21692408', // Kung Fu Panda 4 (2024)
  'tt6791350',  // Guardians of the Galaxy Vol. 3 (2023)
  'tt10366206', // John Wick: Chapter 4 (2023)
  'tt15398776', // Oppenheimer (2023)
  'tt1517268',  // Barbie (2023)
  'tt6718170',  // The Super Mario Bros. Movie (2023)
  'tt9603212',  // Mission: Impossible - Dead Reckoning Part One (2023)
  'tt1630029',  // Avatar: The Way of Water (2022)
  'tt1745960',  // Top Gun: Maverick (2022)
  'tt1877830',  // The Batman (2022)
  'tt9114286',  // Black Panther: Wakanda Forever (2022)
  'tt10872600', // Spider-Man: No Way Home (2021)
  'tt1160419',  // Dune (2021)
]

export function useOmdbSearch(apiKey) {
  const [movies, setMovies] = useState([])
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const lastQueryRef = useRef('')
  const lastPageRef = useRef(0)
  const lastFiltersRef = useRef({ type: '', year: '' })

  const hasMore = movies.length < totalResults

  const reset = useCallback(() => {
    setMovies([])
    setTotalResults(0)
    setError('')
    setLoading(false)
    lastQueryRef.current = ''
    lastPageRef.current = 0
    lastFiltersRef.current = { type: '', year: '' }
  }, [])

  const search = useCallback(async (query, page = 1, filters = { type: '', year: '' }) => {
    // Handle missing API key
    if (!apiKey) {
      setMovies([])
      setTotalResults(0)
      setError('Missing OMDb API key. Add VITE_OMDB_API_KEY in a .env file at project root.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      let total = 0

      if (!query || query.trim() === '') {
        // Default feed: fetch by curated IDs, paginated locally
        const pageSize = 10
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const slice = DEFAULT_IMDB_IDS.slice(start, end)
        total = DEFAULT_IMDB_IDS.length
        const results = await Promise.all(slice.map(async (id) => {
          const url = new URL('https://www.omdbapi.com/')
          url.searchParams.set('i', id)
          url.searchParams.set('plot', 'short')
          url.searchParams.set('apikey', apiKey)
          const res = await fetch(url.toString())
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const json = await res.json()
          if (json.Response === 'False') return null
          return json
        }))
        const cleaned = results.filter(Boolean)
        setMovies(prev => (page === 1 ? cleaned : [...prev, ...cleaned]))
      } else {
        // Normal search
        const url = new URL('https://www.omdbapi.com/')
        url.searchParams.set('s', query)
        if (filters?.type) {
          url.searchParams.set('type', filters.type)
        }
        if (filters?.year) {
          url.searchParams.set('y', String(filters.year))
        }
        url.searchParams.set('page', String(page))
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
        if (json.Response === 'False') {
          throw new Error(json.Error || 'Unknown error')
        }
        const results = json.Search || []
        total = Number(json.totalResults || 0)
        setMovies(prev => (page === 1 ? results : [...prev, ...results]))
      }

      setTotalResults(total)
      lastQueryRef.current = query || ''
      lastPageRef.current = page
      lastFiltersRef.current = { type: filters?.type || '', year: filters?.year || '' }
    } catch (e) {
      setError(e.message || 'Failed to fetch movies')
    } finally {
      setLoading(false)
    }
  }, [apiKey])

  return {
    movies,
    totalResults,
    loading,
    error,
    hasMore,
    search,
    reset,
    lastQuery: lastQueryRef.current,
    lastPage: lastPageRef.current,
    lastFilters: lastFiltersRef.current,
  }
}


