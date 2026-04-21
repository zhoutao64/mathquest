export default function Button({
  children,
  onClick,
  color = 'primary',
  size = 'normal',
  disabled = false,
  style,
}) {
  const className = [
    'btn',
    `btn-${color}`,
    size === 'small' ? 'btn-small' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...(disabled ? { opacity: 0.5, pointerEvents: 'none' } : {}),
        ...style,
      }}
    >
      {children}
    </button>
  );
}
