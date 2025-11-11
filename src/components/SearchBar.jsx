import { useEffect, useRef, useState } from 'react'

export function SearchBar({ defaultValue = '', onSearch }) {
  const [value, setValue] = useState(defaultValue)
  const debounceRef = useRef(0)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  useEffect(() => {
    window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      if (value.trim() !== '') {
        onSearch?.(value)
      }
    }, 400)
    return () => window.clearTimeout(debounceRef.current)
  }, [value, onSearch])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch?.(value)
  }

  return (
    <form className="searchbar" onSubmit={handleSubmit} role="search">
      <input
        className="searchbar__input"
        type="text"
        placeholder="Search movies by title..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Search movies"
        id="search-input"
        name="search"
      />
      <button className="btn" type="submit">Search</button>
    </form>
  )
}


