import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import AlchemyShooter, { playSuccessSound, playNextSound } from './AlchemyShooter'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    instruction: {
      en: 'Are 2:3 and 4:6 proportional?',
      zh: '2:3 和 4:6 成比例吗？',
    },
    answer: true,
    explanation: {
      en: '2:3 = 4:6 \u2713 (2\u00d76=12, 3\u00d74=12). Cross products are equal!',
      zh: '2:3 = 4:6 \u2713\uff082\u00d76=12\uff0c3\u00d74=12\uff09。交叉积相等！',
    },
    hints: [
      { en: 'Cross-multiply: does 2\u00d76 equal 3\u00d74?', zh: '交叉相乘：2\u00d76 是否等于 3\u00d74？' },
      { en: 'If both cross products are 12, they are proportional!', zh: '如果两个交叉积都是12，就成比例！' },
    ],
  },
  {
    instruction: {
      en: 'Are 3:4 and 6:9 proportional?',
      zh: '3:4 和 6:9 成比例吗？',
    },
    answer: false,
    explanation: {
      en: '3:4 \u2260 6:9 (3\u00d79=27, 4\u00d76=24). Cross products differ!',
      zh: '3:4 \u2260 6:9\uff083\u00d79=27\uff0c4\u00d76=24\uff09。交叉积不等！',
    },
    hints: [
      { en: 'Cross-multiply: does 3\u00d79 equal 4\u00d76?', zh: '交叉相乘：3\u00d79 是否等于 4\u00d76？' },
      { en: '27 \u2260 24, so these ratios are NOT proportional.', zh: '27 \u2260 24，所以这两个比不成比例。' },
    ],
  },
  {
    instruction: {
      en: 'Are 5:8 and 15:24 proportional?',
      zh: '5:8 和 15:24 成比例吗？',
    },
    answer: true,
    explanation: {
      en: '5:8 = 15:24 \u2713 (5\u00d724=120, 8\u00d715=120). Cross products match!',
      zh: '5:8 = 15:24 \u2713\uff085\u00d724=120\uff0c8\u00d715=120\uff09。交叉积相等！',
    },
    hints: [
      { en: 'Cross-multiply: 5\u00d724 and 8\u00d715. Are they equal?', zh: '交叉相乘：5\u00d724 和 8\u00d715。相等吗？' },
      { en: 'Also notice: 5\u00d73=15 and 8\u00d73=24. Same multiplier!', zh: '注意：5\u00d73=15，8\u00d73=24。乘数相同！' },
    ],
  },
  {
    instruction: {
      en: 'Are 4:7 and 8:15 proportional?',
      zh: '4:7 和 8:15 成比例吗？',
    },
    answer: false,
    explanation: {
      en: '4:7 \u2260 8:15 (4\u00d715=60, 7\u00d78=56). Cross products differ!',
      zh: '4:7 \u2260 8:15\uff084\u00d715=60\uff0c7\u00d78=56\uff09。交叉积不等！',
    },
    hints: [
      { en: 'Cross-multiply: does 4\u00d715 equal 7\u00d78?', zh: '交叉相乘：4\u00d715 是否等于 7\u00d78？' },
      { en: '60 \u2260 56. Close, but not proportional!', zh: '60 \u2260 56。很接近，但不成比例！' },
    ],
  },
  {
    instruction: {
      en: 'Are 6:10 and 9:15 proportional?',
      zh: '6:10 和 9:15 成比例吗？',
    },
    answer: true,
    explanation: {
      en: '6:10 = 9:15 \u2713 (6\u00d715=90, 10\u00d79=90). Both simplify to 3:5!',
      zh: '6:10 = 9:15 \u2713\uff086\u00d715=90\uff0c10\u00d79=90\uff09。都化简为3:5！',
    },
    hints: [
      { en: 'Cross-multiply: 6\u00d715 and 10\u00d79. Equal?', zh: '交叉相乘：6\u00d715 和 10\u00d79。相等吗？' },
      { en: 'Try simplifying both ratios. 6:10 = 3:5, and 9:15 = ?', zh: '试着化简：6:10 = 3:5，9:15 = ？' },
    ],
  },
]

// ─── Target positions: 2 large targets ───────────────────────
const POSITIONS = [
  [130, 130],
  [270, 130],
]

// ─── Main Component ──────────────────────────────────────────
export default function ProportionGuard({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [solved, setSolved] = useState(false)

  const task = TASKS[taskIndex]

  // Build targets: TRUE and FALSE bottles
  const trueLabel = lang === 'zh' ? '\u2705 \u662F' : '\u2705 TRUE'
  const falseLabel = lang === 'zh' ? '\u274C \u5426' : '\u274C FALSE'
  const correctLabel = task.answer ? trueLabel : falseLabel

  const targets = [
    {
      id: `true-${taskIndex}`,
      x: POSITIONS[0][0],
      y: POSITIONS[0][1],
      label: trueLabel,
      value: trueLabel,
      color: '#4ECDC4',
    },
    {
      id: `false-${taskIndex}`,
      x: POSITIONS[1][0],
      y: POSITIONS[1][1],
      label: falseLabel,
      value: falseLabel,
      color: '#F472B6',
    },
  ]

  // Handle shooting
  const handleShoot = useCallback((target) => {
    if (target.value === correctLabel) {
      playSuccessSound()
      setSolved(true)
      setShowExplanation(true)
      return 'correct'
    } else {
      setMistakes(m => m + 1)
      setShowHint(true)
      return 'wrong'
    }
  }, [correctLabel])

  // Next task
  const handleNext = useCallback(() => {
    const next = taskIndex + 1
    setTasksCompleted(tc => tc + 1)
    if (next >= TASKS.length) {
      const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
      onComplete({ stars, mistakes })
    } else {
      setTaskIndex(next)
      setSolved(false)
      setShowHint(false)
      setShowExplanation(false)
    }
  }, [taskIndex, mistakes, onComplete])

  // Professor message
  const professorMsg = solved
    ? task.explanation[lang]
    : lang === 'zh'
      ? '用交叉相乘来判断！如果两个交叉积相等，就成比例。'
      : 'Use cross-multiplication! If both cross products are equal, it\'s proportional.'

  const hints = task.hints.map(h => h[lang])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>{'\uD83D\uDEE1\uFE0F'}</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '比例守卫' : 'Proportion Guard'}
        </h2>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          {taskIndex + 1} / {TASKS.length}
        </div>
      </div>

      {/* Instruction card with ratio display */}
      <div className="card" style={{ textAlign: 'center', maxWidth: 420, width: '100%' }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: '#64748B', marginBottom: 6 }}>
          {'\u2696\uFE0F'} {lang === 'zh' ? '比例判断' : 'PROPORTION CHECK'}
        </div>
        <div style={{
          fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontWeight: 900, color: '#A78BFA',
          margin: '8px 0', fontFamily: 'Nunito, sans-serif',
        }}>
          {task.instruction[lang]}
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: '#64748B' }}>
          {lang === 'zh' ? '射击正确答案！' : 'Shoot TRUE or FALSE!'}
        </div>
      </div>

      {/* Game area */}
      <AlchemyShooter
        targets={targets}
        onShoot={handleShoot}
        mode="single"
        solved={solved}
        background="vault"
        hitRadius={36}
        drift
      />

      {/* Explanation card */}
      {showExplanation && (
        <div className="card" style={{
          maxWidth: 400, width: '100%', textAlign: 'center',
          background: '#F3E8FF', border: '2px solid #A78BFA',
          animation: 'bounce-in 0.4s',
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>{'\uD83D\uDD2E'}</div>
          <p style={{ fontSize: 15, color: '#1E293B', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
            {task.explanation[lang]}
          </p>
          <button className="btn btn-primary" onClick={handleNext} style={{ marginTop: 16 }}>
            {taskIndex < TASKS.length - 1
              ? (lang === 'zh' ? '\u4E0B\u4E00\u9898 \u2192' : 'Next Guard \u2192')
              : (lang === 'zh' ? '\u5B8C\u6210\uFF01' : 'Finish!')}
          </button>
        </div>
      )}

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {TASKS.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < tasksCompleted ? '#A78BFA' : i === taskIndex ? '#FFE66D' : '#E2E8F0',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Professor Pi */}
      <div style={{ maxWidth: 420, width: '100%', marginTop: 8 }}>
        <ProfessorPi
          message={professorMsg}
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
