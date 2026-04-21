export default function ProgressBar({
  value,
  max,
  color = 'primary',
  height = 10,
}) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  const colorMap = {
    primary: 'var(--primary)',
    danger: 'var(--danger)',
    warning: 'var(--warning)',
    purple: 'var(--purple)',
    pink: 'var(--pink)',
    blue: 'var(--blue)',
    green: 'var(--green)',
  };

  const fillColor = colorMap[color] || colorMap.primary;

  return (
    <div className="progress-bar">
      <div className="progress-bar-track" style={{ height }}>
        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
            background: fillColor,
          }}
        />
      </div>
      <span className="progress-bar-label">
        {value}/{max}
      </span>
    </div>
  );
}
