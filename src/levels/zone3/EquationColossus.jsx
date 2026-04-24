import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import MineScale from './MineScale'
import { EQUATION_COLOSSUS } from './tasks'

export default function EquationColossus({ onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [totalMisses, setTotalMisses] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)

  const task = EQUATION_COLOSSUS[taskIndex]
  const hpMax = 100
  const hp = Math.max(0, hpMax - Math.round((taskIndex + (showExplanation ? 1 : 0)) * (hpMax / EQUATION_COLOSSUS.length)))

  const handleSolve = useCallback(({ misses }) => {
    setTotalMisses((m) => m + misses)
    setTimeout(() => setShowExplanation(true), 400)
  }, [])

  const handleMistake = useCallback(() => {}, [])

  const handleNext = useCallback(() => {
    const next = taskIndex + 1
    if (next >= EQUATION_COLOSSUS.length) {
      const stars = totalMisses === 0 ? 3 : totalMisses <= 3 ? 2 : 1
      onComplete({ stars, mistakes: totalMisses })
      return
    }
    setTaskIndex(next)
    setShowExplanation(false)
  }, [taskIndex, totalMisses, onComplete])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 12px 30px', minHeight: '100vh', gap: 12,
      background: 'radial-gradient(ellipse at top, #4C1D1D 0%, #0F0505 100%)',
    }}>
      {/* Boss header with HP */}
      <div style={{ textAlign: 'center', maxWidth: 440, width: '100%' }}>
        <h2 style={{
          fontSize: 'clamp(1.2rem, 5vw, 1.55rem)', fontWeight: 900,
          color: '#F87171', margin: 0, letterSpacing: 2,
          textShadow: '0 2px 8px rgba(220,38,38,0.6)',
        }}>
          {lang === 'zh' ? '\u65B9\u7A0B\u5DE8\u50CF' : 'EQUATION COLOSSUS'}
        </h2>
        <div style={{ fontSize: 12, color: '#FCA5A5', marginTop: 4, fontWeight: 700 }}>
          {lang === 'zh' ? `\u9636\u6BB5 ${taskIndex + 1} / ${EQUATION_COLOSSUS.length}` : `PHASE ${taskIndex + 1} / ${EQUATION_COLOSSUS.length}`}
        </div>

        {/* Boss avatar */}
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
          <svg viewBox="0 0 80 70" width="80" height="70">
            <defs>
              <radialGradient id="bossGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#DC2626" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#7C2D12" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx={40} cy={35} rx={32} ry={28} fill="url(#bossGlow)" opacity={0.6}>
              <animate attributeName="rx" values="30;34;30" dur="2s" repeatCount="indefinite" />
            </ellipse>
            <path d="M 18 22 L 40 8 L 62 22 L 62 48 Q 62 58 52 60 L 28 60 Q 18 58 18 48 Z"
              fill="#3f1f1f" stroke="#1a0a0a" strokeWidth={1.5} />
            <circle cx={32} cy={30} r={5} fill="#FDE047" />
            <circle cx={32} cy={30} r={2} fill="#DC2626" />
            <circle cx={48} cy={30} r={5} fill="#FDE047" />
            <circle cx={48} cy={30} r={2} fill="#DC2626" />
            <path d="M 26 46 L 32 48 L 38 46 L 44 48 L 50 46 L 54 48"
              fill="none" stroke="#1a0a0a" strokeWidth={2} strokeLinecap="round" />
            {/* Crack overlay based on HP */}
            {hp < 66 && <path d="M 24 18 L 32 40 L 28 56" stroke="#FDE047" strokeWidth={1.5} fill="none" />}
            {hp < 33 && <path d="M 58 22 L 48 44 L 56 58" stroke="#FDE047" strokeWidth={1.5} fill="none" />}
          </svg>
        </div>

        {/* HP bar */}
        <div style={{ marginTop: 8, position: 'relative', width: '100%', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ fontSize: 10, color: '#F87171', fontWeight: 800, marginBottom: 3, letterSpacing: 1 }}>BOSS HP</div>
          <div style={{
            height: 14, background: 'rgba(0,0,0,0.6)', borderRadius: 7,
            border: '1.5px solid #DC2626', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${hp}%`,
              background: hp > 66 ? 'linear-gradient(90deg, #DC2626, #F87171)' : hp > 33 ? 'linear-gradient(90deg, #F59E0B, #FBBF24)' : 'linear-gradient(90deg, #FDE047, #FEF3C7)',
              transition: 'width 0.6s ease',
              boxShadow: 'inset 0 0 4px rgba(255,255,255,0.3)',
            }} />
          </div>
        </div>
      </div>

      {/* Equation banner */}
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(220,38,38,0.25), rgba(127,29,29,0.15))',
          border: '2px solid rgba(248,113,113,0.5)', borderRadius: 12,
          padding: '10px 22px',
          fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', fontWeight: 900,
          color: '#FEE2E2', fontFamily: 'Nunito, sans-serif',
          letterSpacing: 3, textShadow: '0 2px 6px rgba(0,0,0,0.7)',
          display: 'inline-block',
        }}>
          {task.equation}
        </div>
      </div>

      <MineScale task={task} taskKey={taskIndex} onSolve={handleSolve} onMistake={handleMistake} />

      {showExplanation && (
        <div style={{
          maxWidth: 420, width: '100%', padding: '16px 18px',
          background: 'linear-gradient(135deg, rgba(254,243,199,0.95), rgba(253,224,71,0.88))',
          border: '3px solid #DC2626', borderRadius: 16, textAlign: 'center',
          boxShadow: '0 8px 30px rgba(220,38,38,0.5)',
        }}>
          <div style={{ fontSize: 26, marginBottom: 4 }}>
            {taskIndex < EQUATION_COLOSSUS.length - 1 ? '\u{1F4A5}' : '\u{1F451}'}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#451A03', lineHeight: 1.55 }}>
            {task.explanation[lang]}
          </div>
          <button onClick={handleNext} style={{
            marginTop: 14, padding: '10px 26px',
            background: 'linear-gradient(135deg, #DC2626, #991B1B)',
            color: 'white', border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(220,38,38,0.4)',
            fontFamily: 'Nunito, sans-serif', letterSpacing: 1,
          }}>
            {taskIndex < EQUATION_COLOSSUS.length - 1
              ? (lang === 'zh' ? '\u4E0B\u4E00\u9636\u6BB5 \u2192' : 'NEXT PHASE \u2192')
              : (lang === 'zh' ? '\u51FB\u8D25\u5DE8\u50CF\uFF01' : 'COLOSSUS DEFEATED!')}
          </button>
        </div>
      )}
    </div>
  )
}
