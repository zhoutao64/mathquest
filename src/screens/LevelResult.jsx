import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ZONE1_LEVELS } from '../levels/zone1'
import { ZONE2_LEVELS } from '../levels/zone2'
import { ProfessorPiAvatar } from '../components/characters'
import SettingsPanel, { SettingsGearButton } from '../components/SettingsPanel'

// Animated SVG star with expression
function CelebrationStar({ filled, delay = 0, size = 52 }) {
  const s = size / 52
  return (
    <div style={{
      animation: filled ? `star-pop 0.5s ease ${delay}s both` : 'none',
      display: 'inline-block',
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${52*s} ${52*s}`}>
        <polygon
          points={`${26*s},${4*s} ${31*s},${18*s} ${46*s},${19*s} ${35*s},${28*s} ${38*s},${43*s} ${26*s},${35*s} ${14*s},${43*s} ${17*s},${28*s} ${6*s},${19*s} ${21*s},${18*s}`}
          fill={filled ? '#FFE66D' : '#E2E8F0'}
          stroke={filled ? '#F59E0B' : '#CBD5E1'}
          strokeWidth={1.5*s}
        />
        {/* Face on filled star */}
        {filled && (
          <>
            <circle cx={22*s} cy={22*s} r={1.5*s} fill="#D97706" />
            <circle cx={30*s} cy={22*s} r={1.5*s} fill="#D97706" />
            <path d={`M ${22*s} ${27*s} Q ${26*s} ${31*s} ${30*s} ${27*s}`} fill="none" stroke="#D97706" strokeWidth={1.2*s} strokeLinecap="round" />
          </>
        )}
      </svg>
    </div>
  )
}

// Confetti pieces
function Confetti({ count = 20 }) {
  const pieces = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${2 + Math.random() * 2}s`,
      color: ['#4ECDC4', '#A78BFA', '#F472B6', '#FFE66D', '#60A5FA', '#FF6B6B'][i % 6],
      size: 6 + Math.random() * 6,
    })),
    [count]
  )

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {pieces.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.left,
            top: -10,
            width: p.size,
            height: p.size,
            borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? 2 : 0,
            background: p.color,
            animation: `confetti-fall ${p.duration} ease ${p.delay} both`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  )
}

export default function LevelResult() {
  const { zoneId, levelId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  const stars = Number(searchParams.get('stars')) || 0
  const xpEarned = Number(searchParams.get('xp')) || 0
  const mistakes = Number(searchParams.get('mistakes')) || 0

  const numericLevelId = Number(levelId)
  const ZONE_LEVELS = { zone1: ZONE1_LEVELS, zone2: ZONE2_LEVELS }
  const zoneLevels = ZONE_LEVELS[zoneId] || ZONE1_LEVELS
  const levelData = zoneLevels.find((l) => l.id === numericLevelId)
  const hasCard = !!levelData?.cardId

  const nextLevelId = numericLevelId + 1
  const hasNextLevel = zoneLevels.some((l) => l.id === nextLevelId)

  const professorEmotion = stars >= 3 ? 'proud' : stars >= 2 ? 'encouraging' : 'happy'

  const [showSettings, setShowSettings] = useState(false)

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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      <SettingsGearButton onClick={() => setShowSettings(true)} />

      {/* Confetti */}
      {stars >= 2 && <Confetti count={stars >= 3 ? 30 : 15} />}

      {/* Professor Pi celebrating */}
      <div style={{
        animation: 'bounce-in 0.6s ease forwards',
        marginBottom: 12,
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ animation: stars >= 3 ? 'wiggle 1s ease-in-out infinite' : 'none' }}>
          <ProfessorPiAvatar size={80} emotion={professorEmotion} />
        </div>
      </div>

      {/* Title */}
      <div style={{ animation: 'bounce-in 0.6s ease 0.1s both', position: 'relative', zIndex: 1 }}>
        <h1
          style={{
            fontSize: 'clamp(1.8rem, 6vw, 2.5rem)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #4ECDC4, #A78BFA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 20,
          }}
        >
          {t('result.title')}
        </h1>
      </div>

      {/* Stars with faces */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 28,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {[1, 2, 3].map(i => (
          <CelebrationStar key={i} filled={i <= stars} delay={0.3 + i * 0.2} size={52} />
        ))}
      </div>

      {/* XP display */}
      <div
        style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: 24,
          padding: '20px 36px',
          marginBottom: 20,
          backdropFilter: 'blur(8px)',
          border: '2px solid rgba(78, 205, 196, 0.2)',
          boxShadow: '0 4px 24px rgba(78, 205, 196, 0.15)',
          animation: 'bounce-in 0.6s ease 0.4s both',
          minWidth: 200,
          position: 'relative',
          zIndex: 1,
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
            background: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(244,114,182,0.12))',
            border: '2px solid #C4B5FD',
            borderRadius: 20,
            padding: '14px 24px',
            marginBottom: 24,
            animation: 'bounce-in 0.6s ease 0.6s both',
            position: 'relative',
            zIndex: 1,
          }}
        >
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
          animation: 'bounce-in 0.6s ease 0.7s both',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <button
          className="btn btn-purple"
          onClick={() => navigate(`/zone/${zoneId}`)}
          style={{ padding: '14px 28px', borderRadius: 20 }}
        >
          {t('result.backToMap')}
        </button>

        {hasNextLevel && (
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/zone/${zoneId}/level/${nextLevelId}`)}
            style={{ padding: '14px 28px', borderRadius: 20 }}
          >
            {t('result.nextLevel')} {'\u2192'}
          </button>
        )}
      </div>
    </div>
  )
}
