export function FiltersBar({ type, year, sort, onlyFavorites, onChange }) {
  return (
    <div className="toolbar">
      <div className="filters">
        <select
          className="select"
          value={type}
          onChange={(e) => onChange({ type: e.target.value })}
          aria-label="Filter by type"
          id="filter-type"
          name="type"
        >
          <option value="">All types</option>
          <option value="movie">Movies</option>
          <option value="series">Series</option>
          <option value="episode">Episodes</option>
        </select>
        <input
          className="input"
          type="number"
          min="1900"
          max="2099"
          step="1"
          placeholder="Year"
          value={year}
          onChange={(e) => onChange({ year: e.target.value })}
          aria-label="Filter by year"
          style={{ width: 120 }}
          id="filter-year"
          name="year"
        />
      </div>
      <div>
        <select
          className="select"
          value={sort}
          onChange={(e) => onChange({ sort: e.target.value })}
          aria-label="Sort results"
          id="sort-select"
          name="sort"
        >
          <option value="relevance">Relevance</option>
          <option value="title-asc">Title A→Z</option>
          <option value="title-desc">Title Z→A</option>
          <option value="year-desc">Newest</option>
          <option value="year-asc">Oldest</option>
        </select>
      </div>
      <label className="switch" htmlFor="favorites-only">
        <input
          type="checkbox"
          checked={onlyFavorites}
          onChange={(e) => onChange({ onlyFavorites: e.target.checked })}
          id="favorites-only"
          name="onlyFavorites"
        />
        Favorites only
      </label>
    </div>
  )
}


