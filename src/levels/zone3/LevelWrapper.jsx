import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import MineScale from './MineScale'

// Shared outer UI for all Zone 3 levels. Levels only supply tasks + title + optional tutorial.
export default function LevelWrapper({ tasks, titleEn, titleZh, Tutorial = null, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [totalMisses, setTotalMisses] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [showTutorial, setShowTutorial] = useState(!!Tutorial)

  const task = tasks[taskIndex]

  const handleSolve = useCallback(({ misses }) => {
    setTotalMisses((m) => m + misses)
    setTimeout(() => setShowExplanation(true), 300)
  }, [])

  const handleMistake = useCallback(() => {}, [])

  const handleNext = useCallback(() => {
    const next = taskIndex + 1
    if (next >= tasks.length) {
      const stars = totalMisses === 0 ? 3 : totalMisses <= 3 ? 2 : 1
      onComplete({ stars, mistakes: totalMisses })
      return
    }
    setTaskIndex(next)
    setShowExplanation(false)
  }, [taskIndex, tasks.length, totalMisses, onComplete])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 12px 30px', minHeight: '100vh', gap: 14,
      background: 'radial-gradient(ellipse at top, #2D1808 0%, #0F0805 100%)',
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{
          fontSize: 'clamp(1.1rem, 4vw, 1.35rem)',
          fontWeight: 900, color: '#FDE047', margin: 0,
          textShadow: '0 2px 6px rgba(0,0,0,0.6)', letterSpacing: 1,
        }}>
          {lang === 'zh' ? titleZh : titleEn}
        </h2>
        <div style={{ fontSize: 12, color: '#FCA5A5', marginTop: 2, fontWeight: 700 }}>
          {taskIndex + 1} / {tasks.length}
        </div>
      </div>

      {/* Equation banner */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(249,115,22,0.12))',
          border: '2px solid rgba(253,224,71,0.45)',
          borderRadius: 12,
          padding: '10px 22px',
          fontSize: 'clamp(1.4rem, 5vw, 1.7rem)',
          fontWeight: 900, color: '#FEF3C7',
          fontFamily: 'Nunito, sans-serif', letterSpacing: 3,
          textShadow: '0 2px 6px rgba(0,0,0,0.7)', display: 'inline-block',
        }}>
          {task.equation}
        </div>
      </div>

      {/* Engine */}
      <MineScale
        task={task}
        taskKey={taskIndex}
        onSolve={handleSolve}
        onMistake={handleMistake}
      />

      {/* Explanation */}
      {showExplanation && (
        <div style={{
          maxWidth: 420, width: '100%', padding: '16px 18px',
          background: 'linear-gradient(135deg, rgba(254,243,199,0.95), rgba(253,224,71,0.88))',
          border: '3px solid #F59E0B', borderRadius: 16, textAlign: 'center',
          boxShadow: '0 8px 30px rgba(251,191,36,0.5)',
        }}>
          <div style={{ fontSize: 26, marginBottom: 4 }}>{'\u2728'}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#451A03', lineHeight: 1.55 }}>
            {task.explanation[lang]}
          </div>
          <button
            onClick={handleNext}
            style={{
              marginTop: 14, padding: '10px 26px',
              background: 'linear-gradient(135deg, #DC2626, #991B1B)',
              color: 'white', border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(220,38,38,0.4)',
              fontFamily: 'Nunito, sans-serif', letterSpacing: 1,
            }}
          >
            {taskIndex < tasks.length - 1
              ? (lang === 'zh' ? '\u4E0B\u4E00\u9898 \u2192' : 'NEXT \u2192')
              : (lang === 'zh' ? '\u901A\u5173\uFF01' : 'VICTORY!')}
          </button>
        </div>
      )}

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {tasks.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < taskIndex ? '#FDE047' : i === taskIndex ? '#F59E0B' : '#3F1F1F',
            boxShadow: i === taskIndex ? '0 0 8px #FDE047' : 'none',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {/* Opening tutorial */}
      {showTutorial && Tutorial && (
        <Tutorial lang={lang} onClose={() => setShowTutorial(false)} />
      )}
    </div>
  )
}
