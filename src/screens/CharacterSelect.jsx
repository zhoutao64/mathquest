import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useGameStore from '../store/useGameStore'
import SettingsPanel, { SettingsGearButton } from '../components/SettingsPanel'

// SVG character illustrations (full body standing pose)
function MiloAvatar({ size = 120 }) {
  const s = size / 100
  return (
    <svg width={size} height={size * 1.4} viewBox={`0 0 ${100*s} ${140*s}`}>
      {/* Hair */}
      <path d={`M ${30*s} ${28*s} Q ${35*s} ${10*s} ${50*s} ${8*s} Q ${65*s} ${10*s} ${70*s} ${28*s}`}
        fill="#5C3D2E" />
      <path d={`M ${55*s} ${10*s} Q ${60*s} ${5*s} ${65*s} ${12*s}`} fill="#5C3D2E" />
      {/* Head */}
      <ellipse cx={50*s} cy={32*s} rx={22*s} ry={20*s} fill="#FFD4A8" />
      {/* Eyes */}
      <circle cx={42*s} cy={30*s} r={4*s} fill="white" />
      <circle cx={58*s} cy={30*s} r={4*s} fill="white" />
      <circle cx={43*s} cy={30*s} r={2.5*s} fill="#1E293B" />
      <circle cx={59*s} cy={30*s} r={2.5*s} fill="#1E293B" />
      <circle cx={44*s} cy={29*s} r={1*s} fill="white" />
      <circle cx={60*s} cy={29*s} r={1*s} fill="white" />
      {/* Smile */}
      <path d={`M ${42*s} ${38*s} Q ${50*s} ${45*s} ${58*s} ${38*s}`} fill="none" stroke="#D97706" strokeWidth={2*s} strokeLinecap="round" />
      {/* Blush */}
      <ellipse cx={35*s} cy={36*s} rx={4*s} ry={2.5*s} fill="#FFBFA0" opacity={0.5} />
      <ellipse cx={65*s} cy={36*s} rx={4*s} ry={2.5*s} fill="#FFBFA0" opacity={0.5} />
      {/* Body (hoodie) */}
      <path d={`M ${30*s} ${52*s} Q ${30*s} ${48*s} ${50*s} ${50*s} Q ${70*s} ${48*s} ${70*s} ${52*s} L ${72*s} ${90*s} L ${28*s} ${90*s} Z`}
        fill="#60A5FA" />
      {/* Hoodie detail */}
      <path d={`M ${45*s} ${52*s} L ${45*s} ${70*s}`} fill="none" stroke="#3B82F6" strokeWidth={1.5*s} />
      <path d={`M ${55*s} ${52*s} L ${55*s} ${70*s}`} fill="none" stroke="#3B82F6" strokeWidth={1.5*s} />
      {/* Arms */}
      <path d={`M ${28*s} ${55*s} Q ${18*s} ${65*s} ${22*s} ${78*s}`} fill="none" stroke="#60A5FA" strokeWidth={8*s} strokeLinecap="round" />
      <path d={`M ${72*s} ${55*s} Q ${82*s} ${65*s} ${78*s} ${78*s}`} fill="none" stroke="#60A5FA" strokeWidth={8*s} strokeLinecap="round" />
      {/* Hands */}
      <circle cx={22*s} cy={78*s} r={5*s} fill="#FFD4A8" />
      <circle cx={78*s} cy={78*s} r={5*s} fill="#FFD4A8" />
      {/* Legs */}
      <rect x={34*s} y={90*s} width={12*s} height={30*s} rx={5*s} fill="#374151" />
      <rect x={54*s} y={90*s} width={12*s} height={30*s} rx={5*s} fill="#374151" />
      {/* Shoes */}
      <ellipse cx={40*s} cy={122*s} rx={10*s} ry={6*s} fill="#EF4444" />
      <ellipse cx={60*s} cy={122*s} rx={10*s} ry={6*s} fill="#EF4444" />
      {/* Cape */}
      <path d={`M ${32*s} ${50*s} Q ${25*s} ${70*s} ${20*s} ${90*s} L ${30*s} ${85*s}`}
        fill="#A78BFA" opacity={0.7} />
      <path d={`M ${68*s} ${50*s} Q ${75*s} ${70*s} ${80*s} ${90*s} L ${70*s} ${85*s}`}
        fill="#A78BFA" opacity={0.7} />
    </svg>
  )
}

function MayaAvatar({ size = 120 }) {
  const s = size / 100
  return (
    <svg width={size} height={size * 1.4} viewBox={`0 0 ${100*s} ${140*s}`}>
      {/* Hair */}
      <path d={`M ${25*s} ${30*s} Q ${30*s} ${8*s} ${50*s} ${6*s} Q ${70*s} ${8*s} ${75*s} ${30*s}`}
        fill="#1E1E2F" />
      {/* Pigtails */}
      <path d={`M ${28*s} ${25*s} Q ${15*s} ${30*s} ${18*s} ${50*s}`} fill="#1E1E2F" />
      <path d={`M ${72*s} ${25*s} Q ${85*s} ${30*s} ${82*s} ${50*s}`} fill="#1E1E2F" />
      {/* Hair ties */}
      <circle cx={20*s} cy={40*s} r={3*s} fill="#F472B6" />
      <circle cx={80*s} cy={40*s} r={3*s} fill="#F472B6" />
      {/* Head */}
      <ellipse cx={50*s} cy={32*s} rx={22*s} ry={20*s} fill="#F0C38E" />
      {/* Eyes */}
      <circle cx={42*s} cy={30*s} r={4.5*s} fill="white" />
      <circle cx={58*s} cy={30*s} r={4.5*s} fill="white" />
      <circle cx={43*s} cy={30*s} r={2.5*s} fill="#6D28D9" />
      <circle cx={59*s} cy={30*s} r={2.5*s} fill="#6D28D9" />
      <circle cx={44*s} cy={29*s} r={1*s} fill="white" />
      <circle cx={60*s} cy={29*s} r={1*s} fill="white" />
      {/* Eyelashes */}
      <line x1={38*s} y1={26*s} x2={40*s} y2={27.5*s} stroke="#1E1E2F" strokeWidth={1.5*s} strokeLinecap="round" />
      <line x1={62*s} y1={27.5*s} x2={64*s} y2={26*s} stroke="#1E1E2F" strokeWidth={1.5*s} strokeLinecap="round" />
      {/* Smile */}
      <path d={`M ${42*s} ${38*s} Q ${50*s} ${46*s} ${58*s} ${38*s}`} fill="none" stroke="#D97706" strokeWidth={2*s} strokeLinecap="round" />
      {/* Blush */}
      <ellipse cx={35*s} cy={36*s} rx={4*s} ry={2.5*s} fill="#FFBFA0" opacity={0.5} />
      <ellipse cx={65*s} cy={36*s} rx={4*s} ry={2.5*s} fill="#FFBFA0" opacity={0.5} />
      {/* Body (dress) */}
      <path d={`M ${32*s} ${52*s} Q ${32*s} ${48*s} ${50*s} ${50*s} Q ${68*s} ${48*s} ${68*s} ${52*s} L ${75*s} ${95*s} L ${25*s} ${95*s} Z`}
        fill="#F472B6" />
      {/* Dress details */}
      <path d={`M ${40*s} ${70*s} Q ${50*s} ${65*s} ${60*s} ${70*s}`} fill="none" stroke="#EC4899" strokeWidth={1.5*s} />
      {/* Star on dress */}
      <polygon points={`${50*s},${60*s} ${51.5*s},${64*s} ${56*s},${64*s} ${52.5*s},${67*s} ${53.5*s},${71*s} ${50*s},${68.5*s} ${46.5*s},${71*s} ${47.5*s},${67*s} ${44*s},${64*s} ${48.5*s},${64*s}`}
        fill="#FFE66D" />
      {/* Arms */}
      <path d={`M ${30*s} ${55*s} Q ${18*s} ${60*s} ${20*s} ${75*s}`} fill="none" stroke="#F472B6" strokeWidth={8*s} strokeLinecap="round" />
      <path d={`M ${70*s} ${55*s} Q ${82*s} ${60*s} ${80*s} ${75*s}`} fill="none" stroke="#F472B6" strokeWidth={8*s} strokeLinecap="round" />
      {/* Hands */}
      <circle cx={20*s} cy={75*s} r={5*s} fill="#F0C38E" />
      <circle cx={80*s} cy={75*s} r={5*s} fill="#F0C38E" />
      {/* Wand in hand */}
      <line x1={80*s} y1={75*s} x2={88*s} y2={58*s} stroke="#A78BFA" strokeWidth={2*s} strokeLinecap="round" />
      <polygon points={`${88*s},${54*s} ${89.5*s},${57*s} ${92*s},${57*s} ${90*s},${59*s} ${91*s},${62*s} ${88*s},${60*s} ${85*s},${62*s} ${86*s},${59*s} ${84*s},${57*s} ${86.5*s},${57*s}`}
        fill="#FFE66D" />
      {/* Legs */}
      <rect x={36*s} y={95*s} width={10*s} height={25*s} rx={5*s} fill="#FDE68A" />
      <rect x={54*s} y={95*s} width={10*s} height={25*s} rx={5*s} fill="#FDE68A" />
      {/* Shoes */}
      <ellipse cx={41*s} cy={122*s} rx={9*s} ry={5.5*s} fill="#A78BFA" />
      <ellipse cx={59*s} cy={122*s} rx={9*s} ry={5.5*s} fill="#A78BFA" />
    </svg>
  )
}

const characters = [
  { id: 'milo', Avatar: MiloAvatar, nameKey: 'character.milo', descKey: 'character.miloDesc', color: '#60A5FA', borderColor: '#93C5FD' },
  { id: 'maya', Avatar: MayaAvatar, nameKey: 'character.maya', descKey: 'character.mayaDesc', color: '#F472B6', borderColor: '#F9A8D4' },
]

export default function CharacterSelect() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const setCharacter = useGameStore((s) => s.setCharacter)
  const [selected, setSelected] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

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
        position: 'relative',
      }}
    >
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      <SettingsGearButton onClick={() => setShowSettings(true)} />
      <h1
        style={{
          fontSize: 'clamp(1.8rem, 6vw, 2.5rem)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #4ECDC4, #A78BFA)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
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
        {t('character.title')}
      </p>

      <div
        style={{
          display: 'flex',
          gap: 20,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 32,
          maxWidth: 620,
          width: '100%',
        }}
      >
        {characters.map((char) => {
          const isSelected = selected === char.id
          const Avatar = char.Avatar
          return (
            <div
              key={char.id}
              onClick={() => setSelected(char.id)}
              style={{
                flex: '1 1 250px',
                maxWidth: 280,
                background: 'rgba(255,255,255,0.9)',
                border: isSelected
                  ? `3px solid ${char.color}`
                  : '2px solid rgba(0,0,0,0.06)',
                borderRadius: 24,
                padding: '28px 20px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                transform: isSelected ? 'scale(1.05) translateY(-4px)' : 'scale(1)',
                boxShadow: isSelected
                  ? `0 12px 36px ${char.color}40`
                  : '0 4px 20px rgba(0,0,0,0.08)',
                backdropFilter: 'blur(8px)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative corner stars for selected */}
              {isSelected && (
                <>
                  <svg width={24} height={24} style={{ position: 'absolute', top: 8, right: 8 }}>
                    <polygon points="12,2 14.5,9 22,9.5 16,14 18,22 12,18 6,22 8,14 2,9.5 9.5,9" fill="#FFE66D" />
                  </svg>
                  <svg width={18} height={18} style={{ position: 'absolute', top: 12, left: 10 }}>
                    <polygon points="9,1 11,7 17,7 12,10.5 14,17 9,13 4,17 6,10.5 1,7 7,7" fill="#FFE66D" opacity={0.6} />
                  </svg>
                </>
              )}

              {/* SVG Character */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 12,
                animation: isSelected ? 'float 2s ease-in-out infinite' : 'none',
              }}>
                <Avatar size={100} />
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

              {/* Selected checkmark */}
              {isSelected && (
                <div style={{
                  marginTop: 14,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: char.color,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'bounce-in 0.3s ease forwards',
                }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
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
          padding: '16px 48px',
          borderRadius: 24,
          opacity: selected ? 1 : 0.5,
          pointerEvents: selected ? 'auto' : 'none',
        }}
      >
        {t('common.confirm')}
      </button>
    </div>
  )
}
