import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import MineScale from './MineScale'
import { WORD_WARRIOR } from './tasks'

export default function WordWarrior({ onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [wordSolved, setWordSolved] = useState(false) // has player picked the correct equation?
  const [totalMisses, setTotalMisses] = useState(0)
  const [wordAttempts, setWordAttempts] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [wrongChoice, setWrongChoice] = useState(null)

  const task = WORD_WARRIOR[taskIndex]

  const handleChoice = (idx) => {
    if (idx === task.wordProblem.correctIdx) {
      setWordSolved(true)
      setWrongChoice(null)
    } else {
      setWrongChoice(idx)
      setWordAttempts((a) => a + 1)
    }
  }

  const handleSolve = useCallback(({ misses }) => {
    setTotalMisses((m) => m + misses)
    setTimeout(() => setShowExplanation(true), 300)
  }, [])

  const handleMistake = useCallback(() => {}, [])

  const handleNext = useCallback(() => {
    const next = taskIndex + 1
    if (next >= WORD_WARRIOR.length) {
      const totalPenalty = totalMisses + wordAttempts
      const stars = totalPenalty === 0 ? 3 : totalPenalty <= 3 ? 2 : 1
      onComplete({ stars, mistakes: totalPenalty })
      return
    }
    setTaskIndex(next)
    setWordSolved(false)
    setWrongChoice(null)
    setShowExplanation(false)
  }, [taskIndex, totalMisses, wordAttempts, onComplete])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 12px 30px', minHeight: '100vh', gap: 14,
      background: 'radial-gradient(ellipse at top, #2D1808 0%, #0F0805 100%)',
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.35rem)', fontWeight: 900, color: '#FDE047',
          margin: 0, textShadow: '0 2px 6px rgba(0,0,0,0.6)', letterSpacing: 1 }}>
          {lang === 'zh' ? '\u6587\u5B57\u6218\u58EB' : 'WORD WARRIOR'}
        </h2>
        <div style={{ fontSize: 12, color: '#FCA5A5', marginTop: 2, fontWeight: 700 }}>
          {taskIndex + 1} / {WORD_WARRIOR.length}
        </div>
      </div>

      {/* Story panel */}
      <div style={{
        maxWidth: 440, width: '100%', padding: '14px 18px',
        background: 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(249,115,22,0.12))',
        border: '2px solid rgba(253,224,71,0.4)', borderRadius: 14,
        color: '#FEF3C7', fontSize: 14, lineHeight: 1.5, fontWeight: 600,
      }}>
        <div style={{ fontSize: 12, color: '#FCA5A5', marginBottom: 4, fontWeight: 800, letterSpacing: 1 }}>
          {lang === 'zh' ? '\u77FF\u5DE5\u7684\u8C1C\u9898' : "MINER'S RIDDLE"}
        </div>
        {task.wordProblem.story[lang]}
      </div>

      {/* Choices (only if not yet solved) */}
      {!wordSolved && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 440, width: '100%' }}>
          {task.wordProblem.choices.map((choice, idx) => {
            const isWrong = wrongChoice === idx
            return (
              <button key={idx}
                onClick={() => handleChoice(idx)}
                disabled={isWrong}
                style={{
                  padding: '12px 18px',
                  background: isWrong ? 'rgba(220,38,38,0.35)' : 'linear-gradient(135deg, #334155, #1E293B)',
                  color: isWrong ? '#FCA5A5' : '#FEF3C7',
                  border: `2px solid ${isWrong ? '#DC2626' : 'rgba(253,224,71,0.35)'}`,
                  borderRadius: 12, fontSize: 17, fontWeight: 900,
                  fontFamily: 'Nunito, sans-serif', letterSpacing: 2,
                  cursor: isWrong ? 'default' : 'pointer',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
                  textAlign: 'center',
                }}>
                {choice}
              </button>
            )
          })}
        </div>
      )}

      {/* MineScale (only after correct choice) */}
      {wordSolved && (
        <>
          <div style={{
            background: 'linear-gradient(135deg, rgba(74,222,128,0.2), rgba(34,197,94,0.12))',
            border: '2px solid rgba(74,222,128,0.45)', borderRadius: 10,
            padding: '6px 16px', fontSize: 15, fontWeight: 900, color: '#86EFAC',
            fontFamily: 'Nunito, sans-serif', letterSpacing: 3,
          }}>
            {task.equation}
          </div>
          <MineScale task={task} taskKey={taskIndex} onSolve={handleSolve} onMistake={handleMistake} />
        </>
      )}

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
          <button onClick={handleNext} style={{
            marginTop: 14, padding: '10px 26px',
            background: 'linear-gradient(135deg, #DC2626, #991B1B)',
            color: 'white', border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(220,38,38,0.4)',
            fontFamily: 'Nunito, sans-serif', letterSpacing: 1,
          }}>
            {taskIndex < WORD_WARRIOR.length - 1 ? (lang === 'zh' ? '\u4E0B\u4E00\u9898 \u2192' : 'NEXT \u2192')
              : (lang === 'zh' ? '\u901A\u5173\uFF01' : 'VICTORY!')}
          </button>
        </div>
      )}

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {WORD_WARRIOR.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < taskIndex ? '#FDE047' : i === taskIndex ? '#F59E0B' : '#3F1F1F',
            boxShadow: i === taskIndex ? '0 0 8px #FDE047' : 'none',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>
    </div>
  )
}
