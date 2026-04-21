import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useGameStore from '../store/useGameStore'
import { ZONE1_LEVELS, ZONE1_INFO } from '../levels/zone1'
import StarRating from '../components/StarRating'

const levelIcons = [
  '\uD83C\uDF70', '\uD83C\uDF6C', '\uD83C\uDFC3', '\uD83E\uDD3F', '\uD83D\uDCCF',
  '\uD83C\uDFED', '\uD83E\uDD41', '\uD83D\uDDFC', '\uD83C\uDF3B', '\uD83D\uDD2D',
]

export default function ZoneMap() {
  const { zoneId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const getLevelStars = useGameStore((s) => s.getLevelStars)
  const isLevelUnlocked = useGameStore((s) => s.isLevelUnlocked)

  // For now only zone1 is implemented
  const levels = ZONE1_LEVELS
  const zoneInfo = ZONE1_INFO

  const completedCount = levels.filter(
    (lvl) => getLevelStars(zoneId, lvl.id) > 0
  ).length

  const allLevelsComplete = completedCount >= 10

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '20px 16px',
        maxWidth: 560,
        margin: '0 auto',
      }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/map')}
        style={{
          background: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: 10,
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: '#64748B',
          backdropFilter: 'blur(8px)',
          marginBottom: 16,
        }}
      >
        {'\u2190'} {t('common.back')}
      </button>

      {/* Zone header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 4 }}>{zoneInfo.icon}</div>
        <h1
          style={{
            fontSize: 'clamp(1.6rem, 5vw, 2rem)',
            fontWeight: 800,
            color: '#1E293B',
            marginBottom: 4,
          }}
        >
          {t(`zones.${zoneId}.name`)}
        </h1>
        <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem' }}>
          {completedCount}/10 {t('common.level')}
        </p>
      </div>

      {/* Level list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {levels.map((level, index) => {
          const stars = getLevelStars(zoneId, level.id)
          const unlocked = isLevelUnlocked(zoneId, level.id)
          const completed = stars > 0

          return (
            <div
              key={level.id}
              onClick={() =>
                unlocked && navigate(`/zone/${zoneId}/level/${level.id}`)
              }
              style={{
                background: unlocked
                  ? 'rgba(255,255,255,0.85)'
                  : 'rgba(200,200,200,0.35)',
                border: completed
                  ? '2px solid #4ECDC4'
                  : '1px solid rgba(0,0,0,0.06)',
                borderRadius: 14,
                padding: '16px 18px',
                cursor: unlocked ? 'pointer' : 'default',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                backdropFilter: 'blur(8px)',
                opacity: unlocked ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
              onMouseEnter={(e) => {
                if (unlocked) e.currentTarget.style.transform = 'translateX(4px)'
              }}
              onMouseLeave={(e) => {
                if (unlocked) e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              {/* Level number + icon */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: unlocked
                    ? 'linear-gradient(135deg, #4ECDC4, #60A5FA)'
                    : '#CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {unlocked ? levelIcons[index] || '\uD83D\uDCDD' : '\uD83D\uDD12'}
              </div>

              {/* Level info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 2,
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#64748B',
                    }}
                  >
                    {index + 1}
                  </span>
                  <span
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: unlocked ? '#1E293B' : '#94A3B8',
                    }}
                  >
                    {t(`zone1Levels.level${level.id}.name`)}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: '#94A3B8',
                    margin: 0,
                  }}
                >
                  {t(`zone1Levels.level${level.id}.topic`)}
                </p>
              </div>

              {/* Stars */}
              <div style={{ flexShrink: 0 }}>
                {unlocked ? (
                  <StarRating stars={stars} size={18} />
                ) : (
                  <span style={{ fontSize: 14, color: '#94A3B8' }}>
                    {'\uD83D\uDD12'}
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {/* Boss card */}
        <div
          style={{
            background: allLevelsComplete
              ? 'linear-gradient(135deg, rgba(255,107,107,0.15), rgba(167,139,250,0.15))'
              : 'rgba(200,200,200,0.3)',
            border: allLevelsComplete
              ? '2px solid #FF6B6B'
              : '1px dashed rgba(0,0,0,0.12)',
            borderRadius: 14,
            padding: '18px 20px',
            textAlign: 'center',
            marginTop: 8,
            opacity: allLevelsComplete ? 1 : 0.5,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 4 }}>{'\uD83D\uDC09'}</div>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: allLevelsComplete ? '#FF6B6B' : '#94A3B8',
              margin: '0 0 4px',
            }}
          >
            {t(`zones.${zoneId}.guardian`)}
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>
            {allLevelsComplete
              ? t('common.play')
              : `\uD83D\uDD12 ${t('common.locked')}`}
          </p>
        </div>
      </div>
    </div>
  )
}
