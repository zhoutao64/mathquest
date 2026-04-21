import ProfessorPiAvatar from './characters/ProfessorPiAvatar'

export default function ProfessorPi({ message, hints = [], showHint = false, emotion = 'happy' }) {
  const currentHint = hints.length > 0 ? hints[0] : null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
    }}>
      {/* SVG Avatar */}
      <div style={{
        flexShrink: 0,
        filter: 'drop-shadow(0 2px 8px rgba(167, 139, 250, 0.3))',
      }}>
        <ProfessorPiAvatar size={56} emotion={emotion} />
      </div>

      {/* Speech bubble */}
      <div style={{
        position: 'relative',
        background: 'var(--card)',
        border: '2px solid #C4B5FD',
        borderRadius: '20px 20px 20px 6px',
        padding: '14px 18px',
        boxShadow: '0 4px 16px rgba(167, 139, 250, 0.12)',
        maxWidth: 360,
        flex: 1,
      }}>
        {/* Bubble tail */}
        <div style={{
          position: 'absolute',
          left: -10,
          top: 16,
          width: 0,
          height: 0,
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderRight: '10px solid #C4B5FD',
        }} />
        <div style={{
          position: 'absolute',
          left: -7,
          top: 17,
          width: 0,
          height: 0,
          borderTop: '5px solid transparent',
          borderBottom: '5px solid transparent',
          borderRight: '8px solid var(--card)',
        }} />

        {message && (
          <p style={{
            fontSize: '0.95rem',
            lineHeight: 1.5,
            margin: 0,
            color: 'var(--text)',
          }}>
            {message}
          </p>
        )}
        {showHint && currentHint && (
          <p style={{
            fontSize: '0.85rem',
            lineHeight: 1.4,
            color: 'var(--text-light)',
            marginTop: 8,
            paddingTop: 8,
            borderTop: '1px dashed #C4B5FD',
            fontStyle: 'italic',
          }}>
            {'💡'} {currentHint}
          </p>
        )}
      </div>
    </div>
  )
}
