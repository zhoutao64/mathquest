import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import AlchemyShooter, { playSuccessSound, playNextSound } from './AlchemyShooter'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    instruction: {
      en: '12 gold coins for 4 moonstone crystals. Price per crystal?',
      zh: '4块月光石花了12金币。每块多少钱？',
    },
    targets: ['2', '3', '4', '6'],
    answer: '3',
    explanation: {
      en: '12 \u00f7 4 = 3 coins per crystal. Unit rate = total \u00f7 count!',
      zh: '12 \u00f7 4 = 每块3金币。单位速率 = 总量 \u00f7 数量！',
    },
    hints: [
      { en: 'Divide the total cost by the number of crystals.', zh: '用总价除以水晶数量。' },
      { en: '12 \u00f7 4 = ? Think: how many groups of 4 in 12?', zh: '12 \u00f7 4 = ? 想一想：12里有几个4？' },
    ],
  },
  {
    instruction: {
      en: '20 potions brewed in 5 hours. Potions per hour?',
      zh: '5小时酿了20瓶药水。每小时几瓶？',
    },
    targets: ['3', '4', '5', '10'],
    answer: '4',
    explanation: {
      en: '20 \u00f7 5 = 4 potions per hour. Unit rate tells us the amount for ONE unit!',
      zh: '20 \u00f7 5 = 每小时4瓶。单位速率告诉我们一个单位的数量！',
    },
    hints: [
      { en: 'Divide total potions by total hours.', zh: '用药水总数除以总小时数。' },
      { en: '20 \u00f7 5 = ? Skip-count by 5 up to 20!', zh: '20 \u00f7 5 = ? 从5开始数到20！' },
    ],
  },
  {
    instruction: {
      en: '15 herbs collected from 3 gardens. Herbs per garden?',
      zh: '从3个花园采了15株草药。每个花园几株？',
    },
    targets: ['3', '5', '6', '12'],
    answer: '5',
    explanation: {
      en: '15 \u00f7 3 = 5 herbs per garden. Divide total by number of groups!',
      zh: '15 \u00f7 3 = 每个花园5株。用总数除以组数！',
    },
    hints: [
      { en: 'Total herbs divided by number of gardens.', zh: '草药总数除以花园数量。' },
      { en: '15 \u00f7 3 = ? Three times what equals 15?', zh: '15 \u00f7 3 = ? 3乘几等于15？' },
    ],
  },
  {
    instruction: {
      en: '$18 for 6 potion bottles. Cost per bottle?',
      zh: '6瓶药水花了18元。每瓶多少钱？',
    },
    targets: ['$2', '$3', '$6', '$12'],
    answer: '$3',
    explanation: {
      en: '18 \u00f7 6 = $3 per bottle. Unit price = total cost \u00f7 quantity!',
      zh: '18 \u00f7 6 = 每瓶3元。单价 = 总价 \u00f7 数量！',
    },
    hints: [
      { en: 'Divide the total price by the number of bottles.', zh: '用总价除以瓶数。' },
      { en: '18 \u00f7 6 = ? Six times what equals 18?', zh: '18 \u00f7 6 = ? 6乘几等于18？' },
    ],
  },
  {
    instruction: {
      en: 'Rose brewed 24 elixirs using 8 dragon scales. Elixirs per scale?',
      zh: '罗斯用8片龙鳞酿了24瓶灵药。每片龙鳞酿几瓶？',
    },
    targets: ['2', '3', '4', '8'],
    answer: '3',
    explanation: {
      en: '24 \u00f7 8 = 3 elixirs per scale. You mastered unit rates!',
      zh: '24 \u00f7 8 = 每片龙鳞3瓶。你掌握了单位速率！',
    },
    hints: [
      { en: 'Divide total elixirs by number of scales.', zh: '用灵药总数除以龙鳞数。' },
      { en: '24 \u00f7 8 = ? Think: 8 \u00d7 3 = ?', zh: '24 \u00f7 8 = ? 想一想：8 \u00d7 3 = ?' },
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

// ─── Main Component ──────────────────────────────────────────
export default function UnitBrew({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [solved, setSolved] = useState(false)

  const task = TASKS[taskIndex]

  // Build targets array for AlchemyShooter
  const targets = task.targets.map((label, i) => ({
    id: `t${i}`,
    x: POSITIONS[i][0],
    y: POSITIONS[i][1],
    label,
    value: label,
    color: ['#A78BFA', '#4ECDC4', '#F472B6', '#FFE66D'][i],
  }))

  // Handle shooting a target
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

  // Advance to next task
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
      ? '找出单位速率！用总量除以数量。'
      : 'Find the unit rate! Divide the total by the count.'

  const hints = task.hints.map(h => h[lang])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>{'\u2697\uFE0F'}</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '单位酿造' : 'Unit Brew'}
        </h2>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          {taskIndex + 1} / {TASKS.length}
        </div>
      </div>

      {/* Instruction card */}
      <div className="card" style={{ textAlign: 'center', maxWidth: 420, width: '100%' }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: '#64748B', marginBottom: 6 }}>
          {'\uD83E\uDDEA'} {lang === 'zh' ? '酿造问题' : 'BREW QUESTION'}
        </div>
        <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', fontWeight: 600, color: '#1E293B' }}>
          {task.instruction[lang]}
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: '#64748B' }}>
          {lang === 'zh' ? '射击正确的药水瓶！' : 'Shoot the correct potion!'}
        </div>
      </div>

      {/* Game area */}
      <AlchemyShooter
        targets={targets}
        onShoot={handleShoot}
        mode="single"
        solved={solved}
        background="workshop"
        drift
      />

      {/* Explanation card */}
      {showExplanation && (
        <div className="card" style={{
          maxWidth: 400, width: '100%', textAlign: 'center',
          background: '#E0FFF8', border: '2px solid #4ECDC4',
          animation: 'bounce-in 0.4s',
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>{'\uD83C\uDF1F'}</div>
          <p style={{ fontSize: 15, color: '#1E293B', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
            {task.explanation[lang]}
          </p>
          <button className="btn btn-primary" onClick={handleNext} style={{ marginTop: 16 }}>
            {taskIndex < TASKS.length - 1
              ? (lang === 'zh' ? '\u4E0B\u4E00\u9898 \u2192' : 'Next Brew \u2192')
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
