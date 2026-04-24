import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useGameStore from '../store/useGameStore'
import { ZONE1_LEVELS, ZONE1_INFO } from '../levels/zone1'
import { ZONE2_LEVELS, ZONE2_INFO } from '../levels/zone2'
import { ZONE3_LEVELS, ZONE3_INFO } from '../levels/zone3'
import { ZONE4_LEVELS, ZONE4_INFO } from '../levels/zone4'
import StarRating from '../components/StarRating'
import DialogueBox from '../components/DialogueBox'
import { getCutscene } from '../data/cutscenes'
import { DigitAvatar } from '../components/characters'
import SettingsPanel, { SettingsGearButton } from '../components/SettingsPanel'

// SVG lock icon
function LockIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x={5} y={11} width={14} height={10} rx={2} fill="#CBD5E1" />
      <path d="M8 11V7a4 4 0 018 0v4" fill="none" stroke="#CBD5E1" strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

// Level node — cartoon circle button
function LevelNode({ index, level, stars, unlocked, completed, onClick }) {
  const colors = ['#4ECDC4', '#60A5FA', '#A78BFA', '#F472B6', '#FFE66D', '#FF6B6B', '#34D399', '#F59E0B', '#818CF8', '#EC4899']
  const color = colors[index % colors.length]

  return (
    <div
      onClick={() => unlocked && onClick()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 16px',
        background: unlocked ? 'rgba(255,255,255,0.9)' : 'rgba(200,200,200,0.3)',
        border: completed ? `2px solid ${color}` : '1px solid rgba(0,0,0,0.06)',
        borderRadius: 20,
        cursor: unlocked ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        boxShadow: completed ? `0 2px 16px ${color}25` : '0 2px 10px rgba(0,0,0,0.05)',
        opacity: unlocked ? 1 : 0.5,
      }}
      onMouseEnter={(e) => { if (unlocked) e.currentTarget.style.transform = 'translateX(4px)' }}
      onMouseLeave={(e) => { if (unlocked) e.currentTarget.style.transform = 'translateX(0)' }}
    >
      {/* Level number circle */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: unlocked
          ? `linear-gradient(135deg, ${color}, ${color}CC)`
          : '#CBD5E1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: unlocked ? `0 3px 10px ${color}40` : 'none',
        position: 'relative',
      }}>
        {unlocked ? (
          <span style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>
            {index + 1}
          </span>
        ) : (
          <LockIcon size={20} />
        )}
        {/* Completed checkmark */}
        {completed && (
          <div style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#4ECDC4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white',
          }}>
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Level info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: unlocked ? '#1E293B' : '#94A3B8',
          display: 'block',
        }}>
          {level.nameKey}
        </span>
        <span style={{
          fontSize: '0.8rem',
          color: '#94A3B8',
        }}>
          {level.topicKey}
        </span>
      </div>

      {/* Stars */}
      <div style={{ flexShrink: 0 }}>
        {unlocked && <StarRating stars={stars} size={16} />}
      </div>
    </div>
  )
}

export default function ZoneMap() {
  const { zoneId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const getLevelStars = useGameStore((s) => s.getLevelStars)
  const isLevelUnlocked = useGameStore((s) => s.isLevelUnlocked)
  const hasCutsceneSeen = useGameStore((s) => s.hasCutsceneSeen)
  const markCutsceneSeen = useGameStore((s) => s.markCutsceneSeen)

  const ZONE_DATA = {
    zone1: { levels: ZONE1_LEVELS, info: ZONE1_INFO },
    zone2: { levels: ZONE2_LEVELS, info: ZONE2_INFO },
    zone3: { levels: ZONE3_LEVELS, info: ZONE3_INFO },
    zone4: { levels: ZONE4_LEVELS, info: ZONE4_INFO },
  }
  const zoneData = ZONE_DATA[zoneId] || ZONE_DATA.zone1
  const levels = zoneData.levels
  const zoneInfo = zoneData.info

  // Zone intro cutscene
  const zoneIntroId = `${zoneId}_intro`
  const zoneIntroScenes = getCutscene(zoneIntroId)
  const [showZoneIntro, setShowZoneIntro] = useState(
    zoneIntroScenes && !hasCutsceneSeen(zoneIntroId)
  )

  const completedCount = levels.filter(
    (lvl) => getLevelStars(zoneId, lvl.id) > 0
  ).length

  const allLevelsComplete = completedCount >= levels.length
  const [showSettings, setShowSettings] = useState(false)

  const handleZoneIntroComplete = () => {
    markCutsceneSeen(zoneIntroId)
    setShowZoneIntro(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '20px 16px',
        maxWidth: 560,
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* Settings */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} showExit />}
      <SettingsGearButton onClick={() => setShowSettings(true)} />

      {/* Zone intro cutscene */}
      {showZoneIntro && zoneIntroScenes && (
        <DialogueBox scenes={zoneIntroScenes} onComplete={handleZoneIntroComplete} />
      )}

      {/* Back button */}
      <button
        onClick={() => navigate('/map')}
        style={{
          background: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: 12,
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
            background: 'linear-gradient(135deg, #4ECDC4, #60A5FA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 4,
          }}
        >
          {t(`zones.${zoneId}.name`)}
        </h1>
        <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem' }}>
          {completedCount}/{levels.length} {t('common.level')}
        </p>
      </div>

      {/* Level list with connecting path */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
        {/* Connecting dotted line */}
        <div style={{
          position: 'absolute',
          left: 39,
          top: 36,
          bottom: 80,
          width: 2,
          background: 'repeating-linear-gradient(to bottom, #CBD5E1 0, #CBD5E1 4px, transparent 4px, transparent 10px)',
          zIndex: 0,
        }} />

        {levels.map((level, index) => {
          const stars = getLevelStars(zoneId, level.id)
          const unlocked = isLevelUnlocked(zoneId, level.id)
          const completed = stars > 0

          return (
            <div key={level.id} style={{ position: 'relative', zIndex: 1 }}>
              <LevelNode
                index={index}
                level={{
                  nameKey: t(`${zoneId}Levels.level${level.id}.name`),
                  topicKey: t(`${zoneId}Levels.level${level.id}.topic`),
                }}
                stars={stars}
                unlocked={unlocked}
                completed={completed}
                onClick={() => navigate(`/zone/${zoneId}/level/${level.id}`)}
              />
            </div>
          )
        })}

        {/* Boss card */}
        <div
          onClick={allLevelsComplete ? () => navigate(`/zone/${zoneId}/level/boss`) : undefined}
          style={{
            background: allLevelsComplete
              ? 'linear-gradient(135deg, rgba(255,107,107,0.12), rgba(167,139,250,0.12))'
              : 'rgba(200,200,200,0.25)',
            border: allLevelsComplete
              ? '2px solid #FF6B6B'
              : '1px dashed rgba(0,0,0,0.12)',
            borderRadius: 20,
            padding: '18px 20px',
            textAlign: 'center',
            marginTop: 8,
            opacity: allLevelsComplete ? 1 : 0.5,
            cursor: allLevelsComplete ? 'pointer' : 'default',
            position: 'relative',
            zIndex: 1,
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
              : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <LockIcon size={14} /> {t('common.locked')}
                </span>
              )}
          </p>
        </div>
      </div>

      {/* Digit companion at bottom */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 24,
        opacity: 0.7,
        animation: 'float 3s ease-in-out infinite',
      }}>
        <DigitAvatar size={40} emotion="determined" />
      </div>
    </div>
  )
}
