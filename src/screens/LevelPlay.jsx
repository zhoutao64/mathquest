import { Suspense, lazy, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useGameStore from '../store/useGameStore'
import { ZONE1_LEVELS } from '../levels/zone1'

const FractionFeast = lazy(() => import('../levels/zone1/FractionFeast'))
const FractionFrenzy = lazy(() => import('../levels/zone1/FractionFrenzy'))
const DecimalDash = lazy(() => import('../levels/zone1/DecimalDash'))

const levelComponents = {
  1: FractionFeast,
  2: FractionFrenzy,
  3: DecimalDash,
}

function LoadingSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          fontSize: 48,
          animation: 'float 1.5s ease-in-out infinite',
        }}
      >
        {'\uD83C\uDFAE'}
      </div>
      <p style={{ color: '#64748B', fontWeight: 600 }}>Loading...</p>
    </div>
  )
}

export default function LevelPlay() {
  const { zoneId, levelId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const completeLevel = useGameStore((s) => s.completeLevel)
  const addXP = useGameStore((s) => s.addXP)
  const addCard = useGameStore((s) => s.addCard)

  const numericLevelId = Number(levelId)
  const levelData = ZONE1_LEVELS.find((l) => l.id === numericLevelId)
  const LevelComponent = levelComponents[numericLevelId]

  const handleComplete = useCallback(
    ({ stars, mistakes }) => {
      completeLevel(zoneId, numericLevelId, stars)

      const xpEarned = stars * 30
      addXP(xpEarned)

      if (levelData?.cardId) {
        addCard(levelData.cardId)
      }

      navigate(`/zone/${zoneId}/level/${levelId}/result?stars=${stars}&xp=${xpEarned}&mistakes=${mistakes}`)
    },
    [zoneId, numericLevelId, levelId, levelData, completeLevel, addXP, addCard, navigate]
  )

  const handleExit = () => {
    navigate(`/zone/${zoneId}`)
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Exit button */}
      <button
        onClick={handleExit}
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 100,
          background: 'rgba(255,255,255,0.85)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 10,
          padding: '8px 14px',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#64748B',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {'\u2715'} {t('common.exit')}
      </button>

      {LevelComponent ? (
        <Suspense fallback={<LoadingSpinner />}>
          <LevelComponent levelData={levelData} onComplete={handleComplete} />
        </Suspense>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            flexDirection: 'column',
            gap: 16,
            padding: 20,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 64 }}>{'\uD83D\uDEA7'}</div>
          <h2
            style={{
              fontSize: 'clamp(1.4rem, 4vw, 1.8rem)',
              fontWeight: 800,
              color: '#1E293B',
              margin: 0,
            }}
          >
            Coming Soon!
          </h2>
          <p style={{ color: '#64748B', maxWidth: 320, margin: 0 }}>
            {t(`zone1Levels.level${levelId}.name`)}
          </p>
          <button
            className="btn btn-primary"
            onClick={handleExit}
            style={{ marginTop: 12 }}
          >
            {t('common.back')}
          </button>
        </div>
      )}
    </div>
  )
}
