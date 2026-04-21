import { Suspense, lazy, useCallback, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useGameStore from '../store/useGameStore'
import { ZONE1_LEVELS } from '../levels/zone1'
import DialogueBox from '../components/DialogueBox'
import { getCutscene } from '../data/cutscenes'

const FractionFeast = lazy(() => import('../levels/zone1/FractionFeast'))
const FractionFrenzy = lazy(() => import('../levels/zone1/FractionFrenzy'))
const DecimalDash = lazy(() => import('../levels/zone1/DecimalDash'))
const NegativePlunge = lazy(() => import('../levels/zone1/NegativePlunge'))
const AbsoluteAdventure = lazy(() => import('../levels/zone1/AbsoluteAdventure'))
const FactorFactory = lazy(() => import('../levels/zone1/FactorFactory'))
const MultipleMachine = lazy(() => import('../levels/zone1/MultipleMachine'))

const levelComponents = {
  1: FractionFeast,
  2: FractionFrenzy,
  3: DecimalDash,
  4: NegativePlunge,
  5: AbsoluteAdventure,
  6: FactorFactory,
  7: MultipleMachine,
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
  const hasCutsceneSeen = useGameStore((s) => s.hasCutsceneSeen)
  const markCutsceneSeen = useGameStore((s) => s.markCutsceneSeen)

  const numericLevelId = Number(levelId)
  const levelData = ZONE1_LEVELS.find((l) => l.id === numericLevelId)
  const LevelComponent = levelComponents[numericLevelId]

  // Cutscene IDs for this level
  const introId = `${zoneId}_level${levelId}_intro`
  const outroId = `${zoneId}_level${levelId}_outro`
  const introScenes = getCutscene(introId)
  const outroScenes = getCutscene(outroId)

  // Phase state machine: intro_dialogue → playing → outro_dialogue → done
  const hasIntro = introScenes && !hasCutsceneSeen(introId)
  const [phase, setPhase] = useState(hasIntro ? 'intro_dialogue' : 'playing')
  const [completionData, setCompletionData] = useState(null)

  // Intro dialogue finished
  const handleIntroComplete = useCallback(() => {
    markCutsceneSeen(introId)
    setPhase('playing')
  }, [introId, markCutsceneSeen])

  // Level gameplay finished
  const handleComplete = useCallback(
    ({ stars, mistakes }) => {
      completeLevel(zoneId, numericLevelId, stars)
      const xpEarned = stars * 30
      addXP(xpEarned)
      if (levelData?.cardId) {
        addCard(levelData.cardId)
      }

      // Check if there's an outro cutscene
      if (outroScenes && !hasCutsceneSeen(outroId)) {
        setCompletionData({ stars, xpEarned, mistakes })
        setPhase('outro_dialogue')
      } else {
        navigate(`/zone/${zoneId}/level/${levelId}/result?stars=${stars}&xp=${xpEarned}&mistakes=${mistakes}`)
      }
    },
    [zoneId, numericLevelId, levelId, levelData, completeLevel, addXP, addCard, navigate, outroScenes, outroId, hasCutsceneSeen]
  )

  // Outro dialogue finished
  const handleOutroComplete = useCallback(() => {
    markCutsceneSeen(outroId)
    if (completionData) {
      navigate(`/zone/${zoneId}/level/${levelId}/result?stars=${completionData.stars}&xp=${completionData.xpEarned}&mistakes=${completionData.mistakes}`)
    }
  }, [outroId, markCutsceneSeen, completionData, navigate, zoneId, levelId])

  const handleExit = () => {
    navigate(`/zone/${zoneId}`)
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Exit button — always visible */}
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

      {/* Intro dialogue */}
      {phase === 'intro_dialogue' && introScenes && (
        <DialogueBox scenes={introScenes} onComplete={handleIntroComplete} />
      )}

      {/* Outro dialogue */}
      {phase === 'outro_dialogue' && outroScenes && (
        <DialogueBox scenes={outroScenes} onComplete={handleOutroComplete} />
      )}

      {/* Game content — render when playing or during outro (stays in background) */}
      {(phase === 'playing' || phase === 'outro_dialogue') && (
        <>
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
        </>
      )}

      {/* Intro dialogue phase — show a placeholder background */}
      {phase === 'intro_dialogue' && (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ fontSize: 64, opacity: 0.3 }}>
            {levelData?.icon || '\uD83C\uDFAE'}
          </div>
        </div>
      )}
    </div>
  )
}
