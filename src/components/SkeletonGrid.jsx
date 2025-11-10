export function SkeletonGrid({ count = 10 }) {
  const items = Array.from({ length: count })
  return (
    <div className="skeleton-grid">
      {items.map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-card__poster" />
          <div className="skeleton-card__text">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        </div>
      ))}
    </div>
  )
}


