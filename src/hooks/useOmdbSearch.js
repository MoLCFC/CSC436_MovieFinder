import { useCallback, useRef, useState } from 'react'

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
    if (!query) {
      reset()
      return
    }
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
      const nextMovies = page === 1 ? results : [...movies, ...results]
      setMovies(nextMovies)
      setTotalResults(Number(json.totalResults || 0))
      lastQueryRef.current = query
      lastPageRef.current = page
      lastFiltersRef.current = { type: filters?.type || '', year: filters?.year || '' }
    } catch (e) {
      setError(e.message || 'Failed to fetch movies')
    } finally {
      setLoading(false)
    }
  }, [apiKey, movies, reset])

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


