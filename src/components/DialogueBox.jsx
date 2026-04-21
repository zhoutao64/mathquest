import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { getAvatar, NarratorIcon, BakerIcon } from './characters'

// ─── Character Definitions ───────────────────────────────────
const CHARACTERS = {
  professor: {
    name: { en: 'Professor Pi', zh: 'π教授' },
    gradient: 'linear-gradient(135deg, #A78BFA, #F472B6)',
    color: '#A78BFA',
    borderColor: '#C4B5FD',
  },
  digit: {
    name: { en: 'Digit', zh: '迪吉' },
    gradient: 'linear-gradient(135deg, #4ECDC4, #60A5FA)',
    color: '#4ECDC4',
    borderColor: '#A7F3D0',
  },
  bug: {
    name: { en: 'Bug', zh: 'Bug仔' },
    gradient: 'linear-gradient(135deg, #84CC16, #F59E0B)',
    color: '#84CC16',
    borderColor: '#D9F99D',
  },
  golem: {
    name: { en: 'Number Golem', zh: '数字石像鬼' },
    gradient: 'linear-gradient(135deg, #64748B, #334155)',
    color: '#64748B',
    borderColor: '#94A3B8',
  },
  narrator: {
    name: { en: 'Narrator', zh: '旁白' },
    gradient: 'none',
    color: '#94A3B8',
    borderColor: '#CBD5E1',
  },
  baker: {
    name: { en: 'Baker', zh: '蛋糕店老板' },
    gradient: 'linear-gradient(135deg, #FFE66D, #F59E0B)',
    color: '#FFE66D',
    borderColor: '#FDE68A',
  },
}

// ─── Typewriter Hook ─────────────────────────────────────────
function useTypewriter(text, speed = 30) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    indexRef.current = 0

    if (!text) { setDone(true); return }

    timerRef.current = setInterval(() => {
      indexRef.current++
      if (indexRef.current >= text.length) {
        setDisplayed(text)
        setDone(true)
        clearInterval(timerRef.current)
      } else {
        setDisplayed(text.slice(0, indexRef.current))
      }
    }, speed)

    return () => clearInterval(timerRef.current)
  }, [text, speed])

  const skipToEnd = useCallback(() => {
    clearInterval(timerRef.current)
    setDisplayed(text)
    setDone(true)
  }, [text])

  return { displayed, done, skipToEnd }
}

// ─── Render Avatar ───────────────────────────────────────────
function renderAvatar(speaker, emotion) {
  if (speaker === 'narrator') return <NarratorIcon size={64} />
  if (speaker === 'baker') return <BakerIcon size={64} />
  return getAvatar(speaker, 64, emotion)
}

// ─── Main DialogueBox Component ──────────────────────────────
export default function DialogueBox({ scenes = [], onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [sceneIndex, setSceneIndex] = useState(0)
  const scene = scenes[sceneIndex]
  const text = scene ? (scene[lang] || scene.en || '') : ''
  const { displayed, done, skipToEnd } = useTypewriter(text, 25)

  const character = scene ? CHARACTERS[scene.speaker] || CHARACTERS.narrator : null
  const isNarrator = scene?.speaker === 'narrator'

  // Handle tap/click
  const handleTap = useCallback(() => {
    if (!done) {
      skipToEnd()
      return
    }
    const next = sceneIndex + 1
    if (next >= scenes.length) {
      onComplete?.()
    } else {
      setSceneIndex(next)
    }
  }, [done, skipToEnd, sceneIndex, scenes.length, onComplete])

  // Handle skip all
  const handleSkip = useCallback(() => {
    onComplete?.()
  }, [onComplete])

  if (!scene) return null

  return (
    <div
      onClick={handleTap}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: 'rgba(15, 23, 42, 0.6)',
        cursor: 'pointer',
        animation: 'fade-in 0.3s ease',
      }}
    >
      {/* Skip button */}
      <button
        onClick={(e) => { e.stopPropagation(); handleSkip() }}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 12,
          padding: '6px 16px',
          color: 'rgba(255,255,255,0.8)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          zIndex: 10,
        }}
      >
        Skip {'\u00BB'}
      </button>

      {/* Character avatar floating above dialogue box */}
      {character && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: -24,
          zIndex: 2,
          animation: 'avatar-pop 0.3s ease',
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: isNarrator ? 'rgba(255,255,255,0.9)' : character.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 20px ${character.color}44`,
            border: `3px solid ${character.borderColor}`,
            overflow: 'hidden',
          }}>
            {renderAvatar(scene.speaker, scene.emotion)}
          </div>
        </div>
      )}

      {/* Dialogue box */}
      <div
        onClick={handleTap}
        style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '24px 24px 0 0',
          padding: '36px 24px 32px',
          maxWidth: 560,
          width: '100%',
          margin: '0 auto',
          backdropFilter: 'blur(12px)',
          animation: 'slide-up 0.3s ease',
          cursor: 'pointer',
          minHeight: 150,
          borderTop: `3px solid ${character?.borderColor || '#E2E8F0'}`,
          position: 'relative',
        }}
      >
        {/* Decorative dots on the border */}
        <div style={{
          position: 'absolute',
          top: -7,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 6,
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: character?.color || '#E2E8F0',
              opacity: 0.6,
            }} />
          ))}
        </div>

        {/* Speaker name tag */}
        <div style={{
          display: 'inline-block',
          fontSize: 13,
          fontWeight: 700,
          color: 'white',
          background: isNarrator
            ? '#94A3B8'
            : (character?.color || '#64748B'),
          padding: '3px 14px',
          borderRadius: 20,
          marginBottom: 10,
          letterSpacing: 0.5,
          fontStyle: isNarrator ? 'italic' : 'normal',
        }}>
          {character?.name[lang] || ''}
        </div>

        {/* Dialogue text */}
        <p style={{
          fontSize: 'clamp(0.95rem, 3vw, 1.1rem)',
          lineHeight: 1.7,
          color: isNarrator ? '#64748B' : '#1E293B',
          fontStyle: isNarrator ? 'italic' : 'normal',
          fontWeight: isNarrator ? 400 : 500,
          margin: 0,
          minHeight: 48,
        }}>
          {displayed}
          {!done && (
            <span style={{
              display: 'inline-block',
              width: 2,
              height: '1em',
              background: '#1E293B',
              marginLeft: 2,
              verticalAlign: 'text-bottom',
              animation: 'blink-cursor 0.8s step-end infinite',
            }} />
          )}
        </p>

        {/* Bottom indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 16,
        }}>
          {/* Scene progress */}
          <div style={{ display: 'flex', gap: 5 }}>
            {scenes.map((_, i) => (
              <div key={i} style={{
                width: i <= sceneIndex ? 16 : 6,
                height: 6,
                borderRadius: 3,
                background: i <= sceneIndex ? (character?.color || '#4ECDC4') : '#E2E8F0',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>

          {/* Tap to continue */}
          {done && (
            <span style={{
              fontSize: 12,
              color: '#94A3B8',
              animation: 'float 1.5s ease-in-out infinite',
            }}>
              {sceneIndex < scenes.length - 1 ? '\u25BC' : '\u2714'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
