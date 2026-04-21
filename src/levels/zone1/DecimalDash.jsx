export default function DecimalDash({ levelData, onComplete }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16, padding: 20 }}>
      <div style={{ fontSize: 64 }}>🏃</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B' }}>Decimal Dash</h2>
      <p style={{ color: '#64748B' }}>Coming soon...</p>
      <button className="btn btn-primary" onClick={() => onComplete({ stars: 3, mistakes: 0 })}>
        Complete (Debug)
      </button>
    </div>
  )
}
