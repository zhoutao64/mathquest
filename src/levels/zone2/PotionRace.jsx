import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import AlchemyShooter, { playSuccessSound, playNextSound } from './AlchemyShooter'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    instruction: {
      en: 'Who brews faster? Alchemist A: 6 potions in 2 hours. Alchemist B: 10 in 4 hours.',
      zh: '谁酿得更快？炼金师A：2小时6瓶。炼金师B：4小时10瓶。',
    },
    targets: ['A (3/hr)', 'B (2.5/hr)'],
    answer: 'A (3/hr)',
    explanation: {
      en: 'A: 6\u00f72=3/hr. B: 10\u00f74=2.5/hr. A is faster!',
      zh: 'A: 6\u00f72=3瓶/时。B: 10\u00f74=2.5瓶/时。A更快！',
    },
    hints: [
      { en: 'Calculate each rate: divide potions by hours.', zh: '计算每个速率：用药水数除以小时数。' },
      { en: 'A: 6\u00f72=? B: 10\u00f74=? Compare the two rates.', zh: 'A: 6\u00f72=? B: 10\u00f74=? 比较两个速率。' },
    ],
  },
  {
    instruction: {
      en: 'Better deal? Shop A: 5 crystals for $15. Shop B: 3 crystals for $12.',
      zh: '哪家更划算？商店A：5块水晶15元。商店B：3块水晶12元。',
    },
    targets: ['A ($3ea)', 'B ($4ea)'],
    answer: 'A ($3ea)',
    explanation: {
      en: 'A: $15\u00f75=$3 each. B: $12\u00f73=$4 each. Shop A is cheaper!',
      zh: 'A: 15\u00f75=每块3元。B: 12\u00f73=每块4元。商店A更便宜！',
    },
    hints: [
      { en: 'Find the unit price at each shop.', zh: '求出每家商店的单价。' },
      { en: 'Divide cost by quantity for each shop. Lower price = better deal!', zh: '用价格除以数量。更低的单价 = 更划算！' },
    ],
  },
  {
    instruction: {
      en: 'More efficient? Cauldron X: 8 potions with 4kg herbs. Cauldron Y: 15 potions with 5kg.',
      zh: '哪个更高效？大锅X：4公斤草药酿8瓶。大锅Y：5公斤酿15瓶。',
    },
    targets: ['X (2/kg)', 'Y (3/kg)'],
    answer: 'Y (3/kg)',
    explanation: {
      en: 'X: 8\u00f74=2/kg. Y: 15\u00f75=3/kg. Cauldron Y is more efficient!',
      zh: 'X: 8\u00f74=2瓶/公斤。Y: 15\u00f75=3瓶/公斤。大锅Y更高效！',
    },
    hints: [
      { en: 'Calculate potions per kg for each cauldron.', zh: '计算每个大锅每公斤酿多少瓶。' },
      { en: 'X: 8\u00f74=? Y: 15\u00f75=? Higher rate = more efficient!', zh: 'X: 8\u00f74=? Y: 15\u00f75=? 更高的速率 = 更高效！' },
    ],
  },
  {
    instruction: {
      en: 'Faster delivery? Cart A: 30km in 6 hours. Cart B: 25km in 5 hours.',
      zh: '哪个送货更快？马车A：6小时30公里。马车B：5小时25公里。',
    },
    targets: ['A (5km/h)', 'B (5km/h)', 'Same!'],
    answer: 'Same!',
    explanation: {
      en: 'Both are 5 km/h \u2014 they\'re the same speed!',
      zh: '都是5公里/时\u2014\u2014速度相同！',
    },
    hints: [
      { en: 'Calculate each speed: distance \u00f7 time.', zh: '计算每个速度：距离 \u00f7 时间。' },
      { en: 'A: 30\u00f76=? B: 25\u00f75=? What if they are equal?', zh: 'A: 30\u00f76=? B: 25\u00f75=? 如果它们相等呢？' },
    ],
  },
  {
    instruction: {
      en: 'Better yield? Field A: 20 herbs from 4m\u00b2. Field B: 36 herbs from 6m\u00b2.',
      zh: '哪个产量更高？田A：4平方米产20株。田B：6平方米产36株。',
    },
    targets: ['A (5/m\u00b2)', 'B (6/m\u00b2)'],
    answer: 'B (6/m\u00b2)',
    explanation: {
      en: 'A: 20\u00f74=5/m\u00b2. B: 36\u00f76=6/m\u00b2. Field B has better yield!',
      zh: 'A: 20\u00f74=5株/平方米。B: 36\u00f76=6株/平方米。田B产量更高！',
    },
    hints: [
      { en: 'Calculate herbs per square meter for each field.', zh: '计算每个田每平方米产多少株。' },
      { en: 'A: 20\u00f74=? B: 36\u00f76=? Higher number wins!', zh: 'A: 20\u00f74=? B: 36\u00f76=? 大的赢！' },
    ],
  },
]

// ─── Target positions ────────────────────────────────────────
// 2 targets side by side (or 3 for task 4)
const POS_TWO = [
  [130, 130],
  [270, 130],
]

const POS_THREE = [
  [80, 130],
  [200, 130],
  [320, 130],
]

// ─── Main Component ──────────────────────────────────────────
export default function PotionRace({ levelData, onComplete }) {
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
  const positions = task.targets.length === 3 ? POS_THREE : POS_TWO
  const colors = ['#4ECDC4', '#F472B6', '#FFE66D']

  const targets = task.targets.map((label, i) => ({
    id: `t${i}`,
    x: positions[i][0],
    y: positions[i][1],
    label,
    value: label,
    color: colors[i],
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
      ? '比较两个速率！先算出每个的单位速率，再看谁更大。'
      : 'Compare the two rates! Calculate each unit rate, then see which is bigger.'

  const hints = task.hints.map(h => h[lang])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>{'\uD83C\uDFC1'}</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '药水竞速' : 'Potion Race'}
        </h2>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          {taskIndex + 1} / {TASKS.length}
        </div>
      </div>

      {/* Instruction card */}
      <div className="card" style={{ textAlign: 'center', maxWidth: 420, width: '100%' }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: '#64748B', marginBottom: 6 }}>
          {'\u2694\uFE0F'} {lang === 'zh' ? '速率对决' : 'RATE SHOWDOWN'}
        </div>
        <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', fontWeight: 600, color: '#1E293B', lineHeight: 1.5 }}>
          {task.instruction[lang]}
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: '#64748B' }}>
          {lang === 'zh' ? '射击更好的那个！' : 'Shoot the better one!'}
        </div>
      </div>

      {/* Game area */}
      <AlchemyShooter
        targets={targets}
        onShoot={handleShoot}
        mode="single"
        solved={solved}
        background="workshop"
        hitRadius={36}
        drift
      />

      {/* Explanation card */}
      {showExplanation && (
        <div className="card" style={{
          maxWidth: 400, width: '100%', textAlign: 'center',
          background: '#E0FFF8', border: '2px solid #4ECDC4',
          animation: 'bounce-in 0.4s',
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>{'\uD83C\uDFC6'}</div>
          <p style={{ fontSize: 15, color: '#1E293B', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
            {task.explanation[lang]}
          </p>
          <button className="btn btn-primary" onClick={handleNext} style={{ marginTop: 16 }}>
            {taskIndex < TASKS.length - 1
              ? (lang === 'zh' ? '\u4E0B\u4E00\u573A \u2192' : 'Next Race \u2192')
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
