import { Suspense, lazy, useCallback, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useGameStore from '../store/useGameStore'
import { ZONE1_LEVELS, ZONE1_BOSS } from '../levels/zone1'
import { ZONE2_LEVELS, ZONE2_BOSS } from '../levels/zone2'
import { ZONE3_LEVELS, ZONE3_BOSS } from '../levels/zone3'
import { ZONE4_LEVELS, ZONE4_BOSS } from '../levels/zone4'
import DialogueBox from '../components/DialogueBox'
import SettingsPanel, { SettingsGearButton } from '../components/SettingsPanel'
import { getCutscene } from '../data/cutscenes'

const FractionFeast = lazy(() => import('../levels/zone1/FractionFeast'))
const FractionFrenzy = lazy(() => import('../levels/zone1/FractionFrenzy'))
const DecimalDash = lazy(() => import('../levels/zone1/DecimalDash'))
const NegativePlunge = lazy(() => import('../levels/zone1/NegativePlunge'))
const AbsoluteAdventure = lazy(() => import('../levels/zone1/AbsoluteAdventure'))
const FactorFactory = lazy(() => import('../levels/zone1/FactorFactory'))
const MultipleMachine = lazy(() => import('../levels/zone1/MultipleMachine'))
const PowerTower = lazy(() => import('../levels/zone1/PowerTower'))
const RootGarden = lazy(() => import('../levels/zone1/RootGarden'))
const IrrationalExplorer = lazy(() => import('../levels/zone1/IrrationalExplorer'))
const NumberGolem = lazy(() => import('../levels/zone1/NumberGolem'))

const RatioRecon = lazy(() => import('../levels/zone2/RatioRecon'))
const EquivalentElixir = lazy(() => import('../levels/zone2/EquivalentElixir'))
const SimplifySerum = lazy(() => import('../levels/zone2/SimplifySerum'))
const RecipeTable = lazy(() => import('../levels/zone2/RecipeTable'))
const UnitBrew = lazy(() => import('../levels/zone2/UnitBrew'))
const PotionRace = lazy(() => import('../levels/zone2/PotionRace'))
const ProportionGuard = lazy(() => import('../levels/zone2/ProportionGuard'))
const CrossMix = lazy(() => import('../levels/zone2/CrossMix'))
const BlueprintShot = lazy(() => import('../levels/zone2/BlueprintShot'))
const PercentPotion = lazy(() => import('../levels/zone2/PercentPotion'))
const ConversionCauldron = lazy(() => import('../levels/zone2/ConversionCauldron'))
const GraphGrinder = lazy(() => import('../levels/zone2/GraphGrinder'))
const ChimeraAmalgam = lazy(() => import('../levels/zone2/ChimeraAmalgam'))

const BalanceBasics = lazy(() => import('../levels/zone3/BalanceBasics'))
const TwinMines = lazy(() => import('../levels/zone3/TwinMines'))
const HeavyLoad = lazy(() => import('../levels/zone3/HeavyLoad'))
const MultiplierShaft = lazy(() => import('../levels/zone3/MultiplierShaft'))
const DivisionPit = lazy(() => import('../levels/zone3/DivisionPit'))
const TwoStepVault = lazy(() => import('../levels/zone3/TwoStepVault'))
const NegativeCave = lazy(() => import('../levels/zone3/NegativeCave'))
const TwinWeights = lazy(() => import('../levels/zone3/TwinWeights'))
const FractionForge = lazy(() => import('../levels/zone3/FractionForge'))
const DistributionBlade = lazy(() => import('../levels/zone3/DistributionBlade'))
const InequalityEdge = lazy(() => import('../levels/zone3/InequalityEdge'))
const WordWarrior = lazy(() => import('../levels/zone3/WordWarrior'))
const EquationColossus = lazy(() => import('../levels/zone3/EquationColossus'))

const Parkour = lazy(() => import('../levels/zone4/Parkour'))
const SteepClimb = lazy(() => import('../levels/zone4/SteepClimb'))

const ZONE_DATA = {
  zone1: { levels: ZONE1_LEVELS, boss: ZONE1_BOSS },
  zone2: { levels: ZONE2_LEVELS, boss: ZONE2_BOSS },
  zone3: { levels: ZONE3_LEVELS, boss: ZONE3_BOSS },
  zone4: { levels: ZONE4_LEVELS, boss: ZONE4_BOSS },
}

const ZONE_COMPONENTS = {
  zone1: {
    1: FractionFeast,
    2: FractionFrenzy,
    3: DecimalDash,
    4: NegativePlunge,
    5: AbsoluteAdventure,
    6: FactorFactory,
    7: MultipleMachine,
    8: PowerTower,
    9: RootGarden,
    10: IrrationalExplorer,
    boss: NumberGolem,
  },
  zone2: {
    1: RatioRecon,
    2: EquivalentElixir,
    3: SimplifySerum,
    4: RecipeTable,
    5: UnitBrew,
    6: PotionRace,
    7: ProportionGuard,
    8: CrossMix,
    9: BlueprintShot,
    10: PercentPotion,
    11: ConversionCauldron,
    12: GraphGrinder,
    boss: ChimeraAmalgam,
  },
  zone3: {
    1: BalanceBasics,
    2: TwinMines,
    3: HeavyLoad,
    4: MultiplierShaft,
    5: DivisionPit,
    6: TwoStepVault,
    7: NegativeCave,
    8: TwinWeights,
    9: FractionForge,
    10: DistributionBlade,
    11: InequalityEdge,
    12: WordWarrior,
    boss: EquationColossus,
  },
  zone4: {
    1: Parkour,
    2: SteepClimb,
  },
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
  const defeatBoss = useGameStore((s) => s.defeatBoss)
  const addXP = useGameStore((s) => s.addXP)
  const addCard = useGameStore((s) => s.addCard)
  const hasCutsceneSeen = useGameStore((s) => s.hasCutsceneSeen)
  const markCutsceneSeen = useGameStore((s) => s.markCutsceneSeen)

  const isBoss = levelId === 'boss'
  const numericLevelId = isBoss ? 'boss' : Number(levelId)
  const zoneData = ZONE_DATA[zoneId]
  const levelData = isBoss ? zoneData?.boss : zoneData?.levels.find((l) => l.id === numericLevelId)
  const LevelComponent = ZONE_COMPONENTS[zoneId]?.[numericLevelId]

  // Cutscene IDs for this level
  const introId = isBoss ? `${zoneId}_boss_intro` : `${zoneId}_level${levelId}_intro`
  const outroId = isBoss ? `${zoneId}_boss_outro` : `${zoneId}_level${levelId}_outro`
  const introScenes = getCutscene(introId)
  const outroScenes = getCutscene(outroId)

  // Phase state machine: intro_dialogue → playing → outro_dialogue → done
  const hasIntro = introScenes && !hasCutsceneSeen(introId)
  const [phase, setPhase] = useState(hasIntro ? 'intro_dialogue' : 'playing')
  const [completionData, setCompletionData] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  // Intro dialogue finished
  const handleIntroComplete = useCallback(() => {
    markCutsceneSeen(introId)
    setPhase('playing')
  }, [introId, markCutsceneSeen])

  // Level gameplay finished
  const handleComplete = useCallback(
    ({ stars, mistakes }) => {
      if (isBoss) {
        defeatBoss(zoneId)
      }
      completeLevel(zoneId, numericLevelId, stars)
      const xpEarned = isBoss ? levelData?.xpReward || 150 : stars * 30
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
    [zoneId, numericLevelId, levelId, levelData, isBoss, completeLevel, defeatBoss, addXP, addCard, navigate, outroScenes, outroId, hasCutsceneSeen]
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
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      <SettingsGearButton onClick={() => setShowSettings(true)} />
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
                {t(`${zoneId}Levels.level${levelId}.name`)}
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
