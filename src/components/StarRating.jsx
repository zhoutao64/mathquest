export default function StarRating({ stars = 0, size = 28 }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map((i) => {
        const filled = i < stars;
        return (
          <span
            key={i}
            style={{
              fontSize: size,
              lineHeight: 1,
              color: filled ? '#FBBF24' : '#D1D5DB',
              display: 'inline-block',
              animation: filled ? `pop 0.3s ease ${i * 0.12}s both` : 'none',
            }}
          >
            {filled ? '\u2B50' : '\u2606'}
          </span>
        );
      })}
    </div>
  );
}
