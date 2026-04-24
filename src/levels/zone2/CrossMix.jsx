import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import AlchemyShooter, { playSuccessSound, playNextSound } from './AlchemyShooter'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    instruction: {
      en: 'Solve: 2/3 = x/9',
      zh: '\u89E3\uFF1A2/3 = x/9',
    },
    equation: { a: 2, b: 3, c: null, d: 9, display: '2/3 = x/9' },
    targets: ['4', '5', '6', '8'],
    answer: '6',
    explanation: {
      en: '2/3 = x/9 \u2192 3\u00d7x = 2\u00d79 \u2192 3x = 18 \u2192 x = 6',
      zh: '2/3 = x/9 \u2192 3\u00d7x = 2\u00d79 \u2192 3x = 18 \u2192 x = 6',
    },
    hints: [
      { en: 'Cross-multiply: 3 \u00d7 x = 2 \u00d7 9.', zh: '\u4EA4\u53C9\u76F8\u4E58\uFF1A3 \u00d7 x = 2 \u00d7 9\u3002' },
      { en: '3x = 18. Divide both sides by 3!', zh: '3x = 18\u3002\u4E24\u8FB9\u90FD\u9664\u4EE53\uFF01' },
    ],
  },
  {
    instruction: {
      en: 'Solve: 3/4 = 9/x',
      zh: '\u89E3\uFF1A3/4 = 9/x',
    },
    equation: { a: 3, b: 4, c: 9, d: null, display: '3/4 = 9/x' },
    targets: ['10', '12', '15', '16'],
    answer: '12',
    explanation: {
      en: '3/4 = 9/x \u2192 3\u00d7x = 4\u00d79 \u2192 3x = 36 \u2192 x = 12',
      zh: '3/4 = 9/x \u2192 3\u00d7x = 4\u00d79 \u2192 3x = 36 \u2192 x = 12',
    },
    hints: [
      { en: 'Cross-multiply: 3 \u00d7 x = 4 \u00d7 9.', zh: '\u4EA4\u53C9\u76F8\u4E58\uFF1A3 \u00d7 x = 4 \u00d7 9\u3002' },
      { en: '3x = 36. What is 36 \u00f7 3?', zh: '3x = 36\u300236 \u00f7 3 = \uFF1F' },
    ],
  },
  {
    instruction: {
      en: 'Solve: x/5 = 6/10',
      zh: '\u89E3\uFF1Ax/5 = 6/10',
    },
    equation: { a: null, b: 5, c: 6, d: 10, display: 'x/5 = 6/10' },
    targets: ['2', '3', '4', '5'],
    answer: '3',
    explanation: {
      en: 'x/5 = 6/10 \u2192 10\u00d7x = 5\u00d76 \u2192 10x = 30 \u2192 x = 3',
      zh: 'x/5 = 6/10 \u2192 10\u00d7x = 5\u00d76 \u2192 10x = 30 \u2192 x = 3',
    },
    hints: [
      { en: 'Cross-multiply: 10 \u00d7 x = 5 \u00d7 6.', zh: '\u4EA4\u53C9\u76F8\u4E58\uFF1A10 \u00d7 x = 5 \u00d7 6\u3002' },
      { en: '10x = 30. Divide both sides by 10!', zh: '10x = 30\u3002\u4E24\u8FB9\u90FD\u9664\u4EE510\uFF01' },
    ],
  },
  {
    instruction: {
      en: 'Solve: 4/x = 8/14',
      zh: '\u89E3\uFF1A4/x = 8/14',
    },
    equation: { a: 4, b: null, c: 8, d: 14, display: '4/x = 8/14' },
    targets: ['5', '6', '7', '8'],
    answer: '7',
    explanation: {
      en: '4/x = 8/14 \u2192 4\u00d714 = 8\u00d7x \u2192 56 = 8x \u2192 x = 7',
      zh: '4/x = 8/14 \u2192 4\u00d714 = 8\u00d7x \u2192 56 = 8x \u2192 x = 7',
    },
    hints: [
      { en: 'Cross-multiply: 4 \u00d7 14 = 8 \u00d7 x.', zh: '\u4EA4\u53C9\u76F8\u4E58\uFF1A4 \u00d7 14 = 8 \u00d7 x\u3002' },
      { en: '56 = 8x. What is 56 \u00f7 8?', zh: '56 = 8x\u300256 \u00f7 8 = \uFF1F' },
    ],
  },
  {
    instruction: {
      en: 'Solve: 5/8 = 15/x',
      zh: '\u89E3\uFF1A5/8 = 15/x',
    },
    equation: { a: 5, b: 8, c: 15, d: null, display: '5/8 = 15/x' },
    targets: ['20', '22', '24', '30'],
    answer: '24',
    explanation: {
      en: '5/8 = 15/x \u2192 5\u00d7x = 8\u00d715 \u2192 5x = 120 \u2192 x = 24',
      zh: '5/8 = 15/x \u2192 5\u00d7x = 8\u00d715 \u2192 5x = 120 \u2192 x = 24',
    },
    hints: [
      { en: 'Cross-multiply: 5 \u00d7 x = 8 \u00d7 15.', zh: '\u4EA4\u53C9\u76F8\u4E58\uFF1A5 \u00d7 x = 8 \u00d7 15\u3002' },
      { en: '5x = 120. What is 120 \u00f7 5?', zh: '5x = 120\u3002120 \u00f7 5 = \uFF1F' },
    ],
  },
]

// ─── Target positions for 4 targets ─────────────────────────
const POSITIONS = [
  [80, 100],
  [200, 80],
  [320, 100],
  [200, 180],
]

// ─── Proportion Equation Display ─────────────────────────────
function EquationDisplay({ equation }) {
  const { display } = equation
  // Split on 'x' to highlight it
  const parts = display.split('x')

  return (
    <div style={{
      fontSize: 'clamp(1.8rem, 7vw, 2.5rem)',
      fontWeight: 900,
      fontFamily: 'Nunito, sans-serif',
      color: '#1E293B',
      margin: '8px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
    }}>
      {parts[0] && <span>{parts[0]}</span>}
      <span style={{
        color: '#EF4444',
        background: '#FEE2E2',
        borderRadius: 8,
        padding: '2px 10px',
        border: '2px dashed #EF4444',
        margin: '0 2px',
      }}>x</span>
      {parts[1] && <span>{parts[1]}</span>}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function CrossMix({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [solved, setSolved] = useState(false)

  const task = TASKS[taskIndex]

  // Build targets array
  const targets = task.targets.map((label, i) => ({
    id: `t${i}`,
    x: POSITIONS[i][0],
    y: POSITIONS[i][1],
    label,
    value: label,
    color: ['#A78BFA', '#4ECDC4', '#F472B6', '#FFE66D'][i],
  }))

  // Handle shooting
  const handleShoot = useCallback((target) => {
    if (target.value === task.answer) {
      playSuccessSound()
      setSolved(true)
      setShowExplanation(true)
      return 'correct'
    } else {
      setMistakes(m => m + 1)
      setShowHint(true)
      return 'wrong'
    }
  }, [task])

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
      ? '\u4EA4\u53C9\u76F8\u4E58\u6765\u89E3\u6BD4\u4F8B\uFF01\u628A\u5BF9\u89D2\u7684\u6570\u76F8\u4E58\uFF0C\u7136\u540E\u89E3\u65B9\u7A0B\u3002'
      : 'Cross-multiply to solve! Multiply the diagonals, then solve for x.'

  const hints = task.hints.map(h => h[lang])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>{'\u2716\uFE0F'}</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '\u4EA4\u53C9\u6DF7\u5408' : 'Cross Mix'}
        </h2>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          {taskIndex + 1} / {TASKS.length}
        </div>
      </div>

      {/* Instruction card with equation */}
      <div className="card" style={{ textAlign: 'center', maxWidth: 420, width: '100%' }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: '#64748B', marginBottom: 6 }}>
          {'\uD83E\uDDEA'} {lang === 'zh' ? '\u89E3\u6BD4\u4F8B\u65B9\u7A0B' : 'SOLVE THE PROPORTION'}
        </div>
        <EquationDisplay equation={task.equation} />
        <div style={{ marginTop: 8, fontSize: 13, color: '#64748B' }}>
          {lang === 'zh' ? '\u5C04\u51FB x \u7684\u6B63\u786E\u503C\uFF01' : 'Shoot the correct value of x!'}
        </div>
      </div>

      {/* Game area */}
      <AlchemyShooter
        targets={targets}
        onShoot={handleShoot}
        mode="single"
        solved={solved}
        background="garden"
        drift
      >
        {/* Show equation inside the SVG as HUD */}
        <text x={200} y={30} textAnchor="middle"
          fill="#C4B5FD" fontSize={14} fontWeight={800}
          fontFamily="Nunito, sans-serif" opacity={0.7}>
          {task.equation.display}
        </text>
      </AlchemyShooter>

      {/* Explanation card */}
      {showExplanation && (
        <div className="card" style={{
          maxWidth: 400, width: '100%', textAlign: 'center',
          background: '#E0FFF8', border: '2px solid #4ECDC4',
          animation: 'bounce-in 0.4s',
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>{'\u2728'}</div>
          <p style={{ fontSize: 15, color: '#1E293B', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
            {task.explanation[lang]}
          </p>
          <button className="btn btn-primary" onClick={handleNext} style={{ marginTop: 16 }}>
            {taskIndex < TASKS.length - 1
              ? (lang === 'zh' ? '\u4E0B\u4E00\u9898 \u2192' : 'Next Mix \u2192')
              : (lang === 'zh' ? '\u5B8C\u6210\uFF01' : 'Finish!')}
          </button>
        </div>
      )}

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {TASKS.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < tasksCompleted ? '#4ECDC4' : i === taskIndex ? '#FFE66D' : '#E2E8F0',
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
