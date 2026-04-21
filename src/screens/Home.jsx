import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useGameStore from '../store/useGameStore'
import DialogueBox from '../components/DialogueBox'
import { getCutscene } from '../data/cutscenes'
import { ProfessorPiAvatar, DigitAvatar } from '../components/characters'
import SettingsPanel, { SettingsGearButton } from '../components/SettingsPanel'

// SVG decorative icons instead of emojis
function StarIcon({ size = 28, color = '#FFE66D', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" style={style}>
      <polygon
        points="14,2 17.5,10 26,11 19.5,17 21.5,26 14,21.5 6.5,26 8.5,17 2,11 10.5,10"
        fill={color} stroke={color} strokeWidth={0.5} opacity={0.7}
      />
    </svg>
  )
}

function MathSymbol({ symbol, size = 24, color, style }) {
  return (
    <span style={{
      fontSize: size,
      fontWeight: 800,
      color,
      opacity: 0.5,
      pointerEvents: 'none',
      userSelect: 'none',
      position: 'absolute',
      ...style,
    }}>
      {symbol}
    </span>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const character = useGameStore((s) => s.character)

  const hasCutsceneSeen = useGameStore((s) => s.hasCutsceneSeen)
  const markCutsceneSeen = useGameStore((s) => s.markCutsceneSeen)

  const hasCharacter = !!character
  const [showPrologue, setShowPrologue] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleStart = () => {
    if (hasCharacter) {
      navigate('/map')
    } else if (!hasCutsceneSeen('prologue')) {
      setShowPrologue(true)
    } else {
      navigate('/character')
    }
  }

  const handlePrologueComplete = () => {
    markCutsceneSeen('prologue')
    setShowPrologue(false)
    navigate('/character')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: 20,
      }}
    >
      {/* Prologue cutscene */}
      {showPrologue && (
        <DialogueBox scenes={getCutscene('prologue')} onComplete={handlePrologueComplete} />
      )}

      {/* Settings */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      <SettingsGearButton onClick={() => setShowSettings(true)} />

      {/* Floating SVG decorations */}
      <StarIcon size={32} style={{ position: 'absolute', top: '12%', left: '8%', animation: 'float 3s ease-in-out infinite', opacity: 0.5 }} />
      <StarIcon size={24} color="#A78BFA" style={{ position: 'absolute', top: '18%', right: '10%', animation: 'float 2.5s ease-in-out 0.5s infinite', opacity: 0.4 }} />
      <StarIcon size={20} color="#F472B6" style={{ position: 'absolute', bottom: '25%', left: '6%', animation: 'float 3.2s ease-in-out 1s infinite', opacity: 0.4 }} />
      <StarIcon size={28} style={{ position: 'absolute', top: '40%', right: '5%', animation: 'float 2.8s ease-in-out 0.3s infinite', opacity: 0.3 }} />

      <MathSymbol symbol="+" color="#4ECDC4" style={{ top: '30%', left: '12%', animation: 'float 3.5s ease-in-out 0.8s infinite' }} />
      <MathSymbol symbol="\u00F7" color="#A78BFA" style={{ top: '22%', right: '15%', animation: 'float 3s ease-in-out 1.2s infinite' }} />
      <MathSymbol symbol="\u00D7" color="#F472B6" style={{ bottom: '30%', right: '10%', animation: 'float 2.6s ease-in-out 0.5s infinite' }} />
      <MathSymbol symbol="\u03C0" size={28} color="#FFE66D" style={{ bottom: '18%', left: '15%', animation: 'float 3.8s ease-in-out 1.5s infinite' }} />

      {/* Characters floating on sides */}
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '5%',
        animation: 'float 4s ease-in-out infinite',
        opacity: 0.6,
        pointerEvents: 'none',
      }}>
        <DigitAvatar size={50} emotion="happy" />
      </div>

      {/* Main content */}
      <div
        style={{
          textAlign: 'center',
          animation: 'bounce-in 0.6s ease forwards',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Professor Pi waving */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 16,
          animation: 'wiggle 2s ease-in-out infinite',
        }}>
          <ProfessorPiAvatar size={100} emotion="encouraging" />
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 4rem)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #4ECDC4, #A78BFA, #F472B6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          {t('home.title')}
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 3vw, 1.3rem)',
            color: '#64748B',
            marginBottom: 40,
          }}
        >
          {t('home.subtitle')}
        </p>

        <button
          className="btn btn-primary"
          onClick={handleStart}
          style={{
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            padding: '16px 44px',
            borderRadius: 24,
            boxShadow: '0 6px 24px rgba(78, 205, 196, 0.4)',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}
        >
          {hasCharacter
            ? t('home.continueAdventure')
            : t('home.startAdventure')}
        </button>
      </div>
    </div>
  )
}
