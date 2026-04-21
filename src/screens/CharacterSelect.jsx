import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useGameStore from '../store/useGameStore'

const characters = [
  { id: 'milo', emoji: '\uD83E\uDDB8\u200D\u2642\uFE0F', nameKey: 'character.milo', descKey: 'character.miloDesc' },
  { id: 'maya', emoji: '\uD83E\uDDB8\u200D\u2640\uFE0F', nameKey: 'character.maya', descKey: 'character.mayaDesc' },
]

export default function CharacterSelect() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const setCharacter = useGameStore((s) => s.setCharacter)
  const [selected, setSelected] = useState(null)

  const handleConfirm = () => {
    if (!selected) return
    setCharacter(selected)
    navigate('/map')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <h1
        style={{
          fontSize: 'clamp(1.8rem, 6vw, 2.5rem)',
          fontWeight: 800,
          color: '#1E293B',
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        {t('character.title')}
      </h1>

      <p
        style={{
          color: '#64748B',
          marginBottom: 32,
          fontSize: '1rem',
          textAlign: 'center',
        }}
      >
        {'\u2728'} {t('character.title')} {'\u2728'}
      </p>

      <div
        style={{
          display: 'flex',
          gap: 20,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 32,
          maxWidth: 600,
          width: '100%',
        }}
      >
        {characters.map((char) => {
          const isSelected = selected === char.id
          return (
            <div
              key={char.id}
              onClick={() => setSelected(char.id)}
              style={{
                flex: '1 1 240px',
                maxWidth: 280,
                background: 'rgba(255,255,255,0.85)',
                border: isSelected
                  ? '3px solid #4ECDC4'
                  : '2px solid rgba(0,0,0,0.06)',
                borderRadius: 16,
                padding: 24,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isSelected
                  ? '0 8px 30px rgba(78, 205, 196, 0.3)'
                  : '0 4px 20px rgba(0,0,0,0.08)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                style={{
                  fontSize: 64,
                  lineHeight: 1.2,
                  marginBottom: 12,
                }}
              >
                {char.emoji}
              </div>

              <h2
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: '#1E293B',
                  marginBottom: 8,
                }}
              >
                {t(char.nameKey)}
              </h2>

              <p
                style={{
                  fontSize: '0.9rem',
                  color: '#64748B',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {t(char.descKey)}
              </p>

              {isSelected && (
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 20,
                    animation: 'pop 0.3s ease forwards',
                  }}
                >
                  {'\u2705'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        className="btn btn-primary"
        onClick={handleConfirm}
        disabled={!selected}
        style={{
          fontSize: '1.1rem',
          padding: '14px 48px',
          opacity: selected ? 1 : 0.5,
          pointerEvents: selected ? 'auto' : 'none',
        }}
      >
        {t('common.confirm')} {'\uD83D\uDE80'}
      </button>
    </div>
  )
}
