import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useGameStore from '../store/useGameStore'
import useSettingsStore from '../store/useSettingsStore'

const floatingEmojis = [
  { emoji: '\uD83C\uDFF0', top: '10%', left: '8%', delay: '0s', duration: '3s' },
  { emoji: '\u2B50', top: '15%', right: '12%', delay: '0.5s', duration: '2.5s' },
  { emoji: '\uD83E\uDDEE', bottom: '20%', left: '10%', delay: '1s', duration: '3.5s' },
  { emoji: '\uD83D\uDCD0', bottom: '25%', right: '8%', delay: '1.5s', duration: '2.8s' },
  { emoji: '\uD83D\uDC8E', top: '40%', left: '5%', delay: '0.8s', duration: '3.2s' },
  { emoji: '\uD83C\uDF1F', top: '35%', right: '6%', delay: '0.3s', duration: '2.6s' },
]

export default function Home() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const character = useGameStore((s) => s.character)
  const toggleLanguage = useSettingsStore((s) => s.toggleLanguage)

  const hasCharacter = !!character

  const handleStart = () => {
    navigate(hasCharacter ? '/map' : '/character')
  }

  const handleToggleLang = () => {
    const nextLang = i18n.language === 'en' ? 'zh' : 'en'
    i18n.changeLanguage(nextLang)
    toggleLanguage()
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
      {/* Settings gear */}
      <button
        onClick={handleToggleLang}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: '50%',
          width: 44,
          height: 44,
          fontSize: 22,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          transition: 'transform 0.3s ease',
          zIndex: 10,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(90deg)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotate(0deg)')}
        aria-label={t('common.settings')}
      >
        {'\u2699\uFE0F'}
      </button>

      {/* Floating emoji decorations */}
      {floatingEmojis.map((item, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: item.top,
            left: item.left,
            right: item.right,
            bottom: item.bottom,
            fontSize: 36,
            animation: `float ${item.duration} ease-in-out ${item.delay} infinite`,
            opacity: 0.6,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {item.emoji}
        </span>
      ))}

      {/* Main content */}
      <div
        style={{
          textAlign: 'center',
          animation: 'bounce-in 0.6s ease forwards',
        }}
      >
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
            padding: '14px 40px',
            boxShadow: '0 6px 24px rgba(78, 205, 196, 0.4)',
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
