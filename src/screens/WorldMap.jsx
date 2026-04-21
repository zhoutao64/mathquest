import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useGameStore from '../store/useGameStore'
import ProgressBar from '../components/ProgressBar'
import { DigitAvatar } from '../components/characters'
import SettingsPanel, { SettingsGearButton } from '../components/SettingsPanel'

// SVG zone icons instead of emojis
function ZoneIcon({ zoneId, size = 40, color }) {
  const s = size / 40
  const icons = {
    zone1: ( // Castle/fortress
      <svg width={size} height={size} viewBox={`0 0 ${40*s} ${40*s}`}>
        <rect x={8*s} y={18*s} width={24*s} height={20*s} rx={2*s} fill={color} />
        <rect x={4*s} y={14*s} width={8*s} height={6*s} rx={1*s} fill={color} />
        <rect x={16*s} y={14*s} width={8*s} height={6*s} rx={1*s} fill={color} />
        <rect x={28*s} y={14*s} width={8*s} height={6*s} rx={1*s} fill={color} />
        <rect x={6*s} y={8*s} width={4*s} height={8*s} fill={color} />
        <rect x={18*s} y={6*s} width={4*s} height={10*s} fill={color} />
        <rect x={30*s} y={8*s} width={4*s} height={8*s} fill={color} />
        <rect x={16*s} y={28*s} width={8*s} height={10*s} rx={4*s} fill="white" opacity={0.3} />
      </svg>
    ),
    zone2: ( // Potion flask
      <svg width={size} height={size} viewBox={`0 0 ${40*s} ${40*s}`}>
        <rect x={15*s} y={4*s} width={10*s} height={8*s} rx={2*s} fill={color} opacity={0.7} />
        <path d={`M ${14*s} ${12*s} L ${8*s} ${30*s} Q ${8*s} ${38*s} ${20*s} ${38*s} Q ${32*s} ${38*s} ${32*s} ${30*s} L ${26*s} ${12*s} Z`} fill={color} />
        <ellipse cx={20*s} cy={28*s} rx={8*s} ry={5*s} fill="white" opacity={0.3} />
        <circle cx={16*s} cy={26*s} r={2*s} fill="white" opacity={0.5} />
        <circle cx={24*s} cy={30*s} r={1.5*s} fill="white" opacity={0.4} />
      </svg>
    ),
    zone3: ( // Sword
      <svg width={size} height={size} viewBox={`0 0 ${40*s} ${40*s}`}>
        <rect x={18*s} y={4*s} width={4*s} height={22*s} rx={1*s} fill={color} />
        <polygon points={`${20*s},${4*s} ${16*s},${10*s} ${24*s},${10*s}`} fill={color} />
        <rect x={12*s} y={26*s} width={16*s} height={4*s} rx={2*s} fill="#FFE66D" />
        <rect x={17*s} y={30*s} width={6*s} height={8*s} rx={2*s} fill="#8B5E3C" />
      </svg>
    ),
    zone4: ( // Chart
      <svg width={size} height={size} viewBox={`0 0 ${40*s} ${40*s}`}>
        <rect x={6*s} y={24*s} width={7*s} height={12*s} rx={2*s} fill={color} opacity={0.6} />
        <rect x={16*s} y={16*s} width={7*s} height={20*s} rx={2*s} fill={color} opacity={0.8} />
        <rect x={26*s} y={8*s} width={7*s} height={28*s} rx={2*s} fill={color} />
        <path d={`M ${9*s} ${22*s} L ${20*s} ${14*s} L ${30*s} ${6*s}`} fill="none" stroke="#FFE66D" strokeWidth={2*s} strokeLinecap="round" />
      </svg>
    ),
    zone5: ( // Diamond
      <svg width={size} height={size} viewBox={`0 0 ${40*s} ${40*s}`}>
        <polygon points={`${20*s},${4*s} ${34*s},${16*s} ${20*s},${36*s} ${6*s},${16*s}`} fill={color} />
        <polygon points={`${20*s},${4*s} ${28*s},${16*s} ${20*s},${36*s}`} fill="white" opacity={0.2} />
        <line x1={6*s} y1={16*s} x2={34*s} y2={16*s} stroke="white" strokeWidth={1*s} opacity={0.3} />
      </svg>
    ),
    zone6: ( // Dice
      <svg width={size} height={size} viewBox={`0 0 ${40*s} ${40*s}`}>
        <rect x={6*s} y={6*s} width={28*s} height={28*s} rx={5*s} fill={color} />
        <circle cx={14*s} cy={14*s} r={3*s} fill="white" />
        <circle cx={26*s} cy={14*s} r={3*s} fill="white" />
        <circle cx={20*s} cy={20*s} r={3*s} fill="white" />
        <circle cx={14*s} cy={26*s} r={3*s} fill="white" />
        <circle cx={26*s} cy={26*s} r={3*s} fill="white" />
      </svg>
    ),
  }
  return icons[zoneId] || null
}

// SVG lock icon
function LockIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x={5} y={11} width={14} height={10} rx={2} fill="#94A3B8" />
      <path d="M8 11V7a4 4 0 018 0v4" fill="none" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" />
      <circle cx={12} cy={16} r={1.5} fill="white" />
    </svg>
  )
}

// Star progress bar (stars instead of plain bar)
function StarProgress({ current, max }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} width={20} height={20} viewBox="0 0 20 20">
          <polygon
            points="10,2 12.5,7.5 18,8 14,12.5 15,18 10,15 5,18 6,12.5 2,8 7.5,7.5"
            fill={i < current ? '#FFE66D' : '#E2E8F0'}
            stroke={i < current ? '#F59E0B' : '#CBD5E1'}
            strokeWidth={0.5}
          />
        </svg>
      ))}
    </div>
  )
}

const zoneColors = {
  zone1: '#4ECDC4',
  zone2: '#A78BFA',
  zone3: '#FF6B6B',
  zone4: '#60A5FA',
  zone5: '#F472B6',
  zone6: '#FFE66D',
}

const zoneIds = ['zone1', 'zone2', 'zone3', 'zone4', 'zone5', 'zone6']

export default function WorldMap() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isZoneUnlocked = useGameStore((s) => s.isZoneUnlocked)
  const isZoneCompleted = useGameStore((s) => s.isZoneCompleted)

  const crystalsRepaired = zoneIds.filter((zId) => isZoneCompleted(zId)).length
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '20px 16px',
        maxWidth: 680,
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* Settings */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} showExit />}
      <SettingsGearButton onClick={() => setShowSettings(true)} />

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
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

      {/* Header with Digit */}
      <div style={{ textAlign: 'center', marginBottom: 20, position: 'relative' }}>
        <div style={{ display: 'inline-block', marginBottom: 8 }}>
          <DigitAvatar size={48} emotion="excited" />
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.8rem, 6vw, 2.4rem)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #4ECDC4, #A78BFA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 4,
          }}
        >
          {t('worldMap.title')}
        </h1>
        <p style={{ color: '#64748B', margin: 0, fontSize: '0.95rem' }}>
          {t('worldMap.restoreAll')}
        </p>
      </div>

      {/* Crystal progress with star icons */}
      <div
        style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: 20,
          padding: '14px 18px',
          marginBottom: 24,
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>
            {t('worldMap.crystalProgress')}
          </span>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#A78BFA' }}>
            {crystalsRepaired}/6
          </span>
        </div>
        <StarProgress current={crystalsRepaired} max={6} />
      </div>

      {/* Zone grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {zoneIds.map((zoneId) => {
          const unlocked = isZoneUnlocked(zoneId)
          const completed = isZoneCompleted(zoneId)
          const color = zoneColors[zoneId]

          return (
            <div
              key={zoneId}
              onClick={() => unlocked && navigate(`/zone/${zoneId}`)}
              style={{
                background: unlocked
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(200,200,200,0.35)',
                border: completed
                  ? `2px solid ${color}`
                  : '1px solid rgba(0,0,0,0.06)',
                borderRadius: 20,
                padding: 20,
                cursor: unlocked ? 'pointer' : 'default',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: completed
                  ? `0 4px 24px ${color}30`
                  : '0 4px 16px rgba(0,0,0,0.06)',
                backdropFilter: 'blur(8px)',
                opacity: unlocked ? 1 : 0.55,
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (unlocked) e.currentTarget.style.transform = 'scale(1.03)'
              }}
              onMouseLeave={(e) => {
                if (unlocked) e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {/* Completed sparkle */}
              {completed && (
                <svg width={24} height={24} style={{ position: 'absolute', top: 10, right: 10, animation: 'sparkle 2s ease infinite' }}>
                  <polygon points="12,2 14.5,9 22,9.5 16,14 18,22 12,18 6,22 8,14 2,9.5 9.5,9" fill="#FFE66D" />
                </svg>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <ZoneIcon zoneId={zoneId} size={40} color={color} />
                <div>
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: unlocked ? '#1E293B' : '#94A3B8',
                      margin: 0,
                    }}
                  >
                    {t(`zones.${zoneId}.name`)}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: '#64748B',
                      margin: 0,
                    }}
                  >
                    {t(`zones.${zoneId}.guardian`)}
                  </p>
                </div>
              </div>

              <p
                style={{
                  fontSize: '0.85rem',
                  color: unlocked ? '#64748B' : '#94A3B8',
                  margin: 0,
                }}
              >
                {unlocked
                  ? t(`zones.${zoneId}.desc`)
                  : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <LockIcon size={16} /> {t('common.locked')}
                    </span>
                  )}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
