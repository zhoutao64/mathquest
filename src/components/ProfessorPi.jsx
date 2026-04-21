const styles = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--purple), var(--pink))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    flexShrink: 0,
    boxShadow: '0 2px 10px rgba(167, 139, 250, 0.3)',
    color: '#fff',
    fontWeight: 800,
  },
  bubble: {
    position: 'relative',
    background: 'var(--card)',
    border: '1px solid var(--card-border)',
    borderRadius: '16px 16px 16px 4px',
    padding: '14px 18px',
    boxShadow: 'var(--shadow)',
    maxWidth: 360,
    flex: 1,
  },
  tail: {
    position: 'absolute',
    left: -8,
    top: 14,
    width: 0,
    height: 0,
    borderTop: '6px solid transparent',
    borderBottom: '6px solid transparent',
    borderRight: '8px solid var(--card)',
  },
  message: {
    fontSize: '0.95rem',
    lineHeight: 1.5,
    margin: 0,
    color: 'var(--text)',
  },
  hint: {
    fontSize: '0.85rem',
    lineHeight: 1.4,
    color: 'var(--text-light)',
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px dashed var(--card-border)',
    fontStyle: 'italic',
  },
};

export default function ProfessorPi({ message, hints = [], showHint = false }) {
  const currentHint = hints.length > 0 ? hints[0] : null;

  return (
    <div style={styles.container}>
      <div style={styles.avatar} title="Professor Pi">
        <span style={{ lineHeight: 1 }}>{'\u03C0'}</span>
      </div>
      <div style={styles.bubble}>
        <div style={styles.tail} />
        {message && <p style={styles.message}>{message}</p>}
        {showHint && currentHint && (
          <p style={styles.hint}>
            {'\uD83D\uDCA1'} {currentHint}
          </p>
        )}
      </div>
    </div>
  );
}
