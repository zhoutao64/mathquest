import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ZONE1_LEVELS } from '../levels/zone1'
import StarRating from '../components/StarRating'

export default function LevelResult() {
  const { zoneId, levelId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  const stars = Number(searchParams.get('stars')) || 0
  const xpEarned = Number(searchParams.get('xp')) || 0
  const mistakes = Number(searchParams.get('mistakes')) || 0

  const numericLevelId = Number(levelId)
  const levelData = ZONE1_LEVELS.find((l) => l.id === numericLevelId)
  const hasCard = !!levelData?.cardId

  const nextLevelId = numericLevelId + 1
  const hasNextLevel = ZONE1_LEVELS.some((l) => l.id === nextLevelId)

  // Animated XP counter
  const [displayXP, setDisplayXP] = useState(0)

  useEffect(() => {
    if (xpEarned <= 0) return
    const duration = 1000
    const steps = 30
    const increment = xpEarned / steps
    const interval = duration / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= xpEarned) {
        setDisplayXP(xpEarned)
        clearInterval(timer)
      } else {
        setDisplayXP(Math.floor(current))
      }
    }, interval)
    return () => clearInterval(timer)
  }, [xpEarned])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        textAlign: 'center',
      }}
    >
      {/* Title */}
      <div style={{ animation: 'bounce-in 0.6s ease forwards' }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{'\uD83C\uDF89'}</div>
        <h1
          style={{
            fontSize: 'clamp(1.8rem, 6vw, 2.5rem)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #4ECDC4, #A78BFA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 24,
          }}
        >
          {t('result.title')}
        </h1>
      </div>

      {/* Stars */}
      <div
        style={{
          marginBottom: 28,
          animation: 'bounce-in 0.6s ease 0.2s both',
        }}
      >
        <StarRating stars={stars} size={48} />
      </div>

      {/* XP display */}
      <div
        style={{
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 16,
          padding: '20px 32px',
          marginBottom: 20,
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          animation: 'bounce-in 0.6s ease 0.3s both',
          minWidth: 200,
        }}
      >
        <p
          style={{
            fontSize: '0.85rem',
            color: '#64748B',
            margin: '0 0 4px',
            fontWeight: 600,
          }}
        >
          {t('result.xpEarned')}
        </p>
        <p
          style={{
            fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
            fontWeight: 800,
            color: '#4ECDC4',
            margin: 0,
          }}
        >
          +{displayXP} XP
        </p>
      </div>

      {/* New card banner */}
      {hasCard && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(244,114,182,0.15))',
            border: '2px solid #A78BFA',
            borderRadius: 14,
            padding: '14px 24px',
            marginBottom: 24,
            animation: 'bounce-in 0.6s ease 0.5s both',
          }}
        >
          <span style={{ fontSize: 22, marginRight: 8 }}>{'\uD83C\uDCCF'}</span>
          <span
            style={{
              fontWeight: 700,
              color: '#A78BFA',
              fontSize: '1rem',
            }}
          >
            {t('result.newCard')}
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
          animation: 'bounce-in 0.6s ease 0.6s both',
        }}
      >
        <button
          className="btn btn-purple"
          onClick={() => navigate(`/zone/${zoneId}`)}
          style={{ padding: '12px 28px' }}
        >
          {t('result.backToMap')}
        </button>

        {hasNextLevel && (
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/zone/${zoneId}/level/${nextLevelId}`)}
            style={{ padding: '12px 28px' }}
          >
            {t('result.nextLevel')} {'\u2192'}
          </button>
        )}
      </div>
    </div>
  )
}
