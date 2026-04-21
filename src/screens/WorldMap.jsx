import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useGameStore from '../store/useGameStore'
import ProgressBar from '../components/ProgressBar'

const zoneIcons = {
  zone1: '\uD83C\uDFF0',
  zone2: '\uD83E\uDDEA',
  zone3: '\u2694\uFE0F',
  zone4: '\uD83D\uDCC8',
  zone5: '\uD83D\uDD37',
  zone6: '\uD83C\uDFB2',
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

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '20px 16px',
        maxWidth: 680,
        margin: '0 auto',
      }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
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

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1
          style={{
            fontSize: 'clamp(1.8rem, 6vw, 2.4rem)',
            fontWeight: 800,
            color: '#1E293B',
            marginBottom: 4,
          }}
        >
          {'\uD83D\uDC51'} {t('worldMap.title')}
        </h1>
        <p style={{ color: '#64748B', margin: 0, fontSize: '0.95rem' }}>
          {t('worldMap.restoreAll')}
        </p>
      </div>

      {/* Crystal progress */}
      <div
        style={{
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 24,
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 18 }}>{'\uD83D\uDC8E'}</span>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>
            {t('worldMap.crystalProgress')}: {crystalsRepaired}/6
          </span>
        </div>
        <ProgressBar value={crystalsRepaired} max={6} color="purple" height={8} />
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
          const icon = zoneIcons[zoneId]
          const color = zoneColors[zoneId]

          return (
            <div
              key={zoneId}
              onClick={() => unlocked && navigate(`/zone/${zoneId}`)}
              style={{
                background: unlocked
                  ? 'rgba(255,255,255,0.85)'
                  : 'rgba(200,200,200,0.4)',
                border: completed
                  ? `2px solid ${color}`
                  : '1px solid rgba(0,0,0,0.06)',
                borderRadius: 16,
                padding: 20,
                cursor: unlocked ? 'pointer' : 'default',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: completed
                  ? `0 4px 20px ${color}33`
                  : '0 4px 20px rgba(0,0,0,0.08)',
                backdropFilter: 'blur(8px)',
                opacity: unlocked ? 1 : 0.6,
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
              {completed && (
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    fontSize: 18,
                  }}
                >
                  {'\u2728'}
                </span>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 36 }}>{icon}</span>
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
                  : `\uD83D\uDD12 ${t('common.locked')}`}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
