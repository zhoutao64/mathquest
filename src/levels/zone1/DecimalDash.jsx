import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    instruction: { en: 'Run to position 0.5!', zh: '跑到 0.5 的位置！' },
    target: 0.5,
    range: [0, 1],
    tolerance: 0.05,
    explanation: { en: '0.5 is right in the middle between 0 and 1. It\'s the same as 1/2!', zh: '0.5 就在 0 和 1 的正中间，和 1/2 一样大！' },
  },
  {
    instruction: { en: 'Find 0.75 on the number line!', zh: '在数轴上找到 0.75！' },
    target: 0.75,
    range: [0, 1],
    tolerance: 0.05,
    explanation: { en: '0.75 = 3/4. Three quarters of the way from 0 to 1!', zh: '0.75 = 3/4，从 0 到 1 的四分之三处！' },
  },
  {
    instruction: { en: 'Where is 1.5?', zh: '1.5 在哪里？' },
    target: 1.5,
    range: [0, 3],
    tolerance: 0.1,
    explanation: { en: '1.5 is halfway between 1 and 2. One and a half!', zh: '1.5 在 1 和 2 的正中间，就是一个半！' },
  },
  {
    instruction: { en: 'Collect coins: find 0.3 + 0.7!', zh: '收集金币：找到 0.3 + 0.7！' },
    target: 1.0,
    range: [0, 2],
    tolerance: 0.05,
    coins: [0.3, 0.7],
    explanation: { en: '0.3 + 0.7 = 1.0! Decimals that add to 10 tenths make a whole!', zh: '0.3 + 0.7 = 1.0！小数加起来凑满10个十分之一就是一个整数！' },
  },
  {
    instruction: { en: 'Where is 2.25?', zh: '2.25 在哪里？' },
    target: 2.25,
    range: [0, 3],
    tolerance: 0.1,
    explanation: { en: '2.25 = 2 + 0.25. Two and a quarter! Between 2 and 2.5.', zh: '2.25 = 2 + 0.25。两又四分之一！在 2 和 2.5 之间。' },
  },
]

// ─── Number Line SVG ─────────────────────────────────────────
function NumberLine({ range, target, playerPos, coins, collectedCoins, onTap, solved }) {
  const [min, max] = range
  const W = 340, H = 120
  const pad = 30
  const lineY = 70

  const toX = (val) => pad + ((val - min) / (max - min)) * (W - 2 * pad)

  // Handle click/tap on SVG
  const handleClick = (e) => {
    if (solved) return
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const clickX = ((e.clientX - rect.left) / rect.width) * W
    const val = min + ((clickX - pad) / (W - 2 * pad)) * (max - min)
    const clamped = Math.max(min, Math.min(max, val))
    onTap(Math.round(clamped * 20) / 20) // snap to 0.05
  }

  // Integer ticks
  const ticks = []
  for (let v = min; v <= max; v++) {
    ticks.push(v)
  }

  // Minor ticks (0.1 intervals)
  const minorTicks = []
  for (let v = min; v <= max; v += 0.1) {
    const rounded = Math.round(v * 10) / 10
    if (rounded % 1 !== 0) minorTicks.push(rounded)
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 380, display: 'block', margin: '0 auto', cursor: solved ? 'default' : 'crosshair' }}
      onClick={handleClick}>

      {/* Number line */}
      <line x1={pad} y1={lineY} x2={W - pad} y2={lineY} stroke="#CBD5E1" strokeWidth={3} strokeLinecap="round" />

      {/* Minor ticks */}
      {minorTicks.map(v => (
        <line key={v} x1={toX(v)} y1={lineY - 4} x2={toX(v)} y2={lineY + 4} stroke="#E2E8F0" strokeWidth={1} />
      ))}

      {/* Major ticks with labels */}
      {ticks.map(v => (
        <g key={v}>
          <line x1={toX(v)} y1={lineY - 8} x2={toX(v)} y2={lineY + 8} stroke="#94A3B8" strokeWidth={2} />
          <text x={toX(v)} y={lineY + 24} textAnchor="middle" fill="#64748B" fontSize={14} fontWeight={700} fontFamily="Nunito, sans-serif">
            {v}
          </text>
        </g>
      ))}

      {/* Target flag */}
      {solved && (
        <g>
          <line x1={toX(target)} y1={lineY - 30} x2={toX(target)} y2={lineY} stroke="#4ECDC4" strokeWidth={2} />
          <rect x={toX(target)} y={lineY - 30} width={20} height={14} rx={3} fill="#4ECDC4" />
          <text x={toX(target) + 10} y={lineY - 20} textAnchor="middle" fill="#fff" fontSize={8} fontWeight={700}>
            {target}
          </text>
        </g>
      )}

      {/* Coins (if any) */}
      {coins && coins.map((val, i) => {
        const collected = collectedCoins?.includes(i)
        return (
          <g key={i} style={{ opacity: collected ? 0.3 : 1, transition: 'opacity 0.3s' }}>
            <circle cx={toX(val)} cy={lineY - 20} r={10} fill={collected ? '#E2E8F0' : '#FFE66D'} stroke={collected ? '#CBD5E1' : '#F59E0B'} strokeWidth={1.5} />
            <text x={toX(val)} y={lineY - 16} textAnchor="middle" fill={collected ? '#CBD5E1' : '#92400E'} fontSize={8} fontWeight={700}>
              {val}
            </text>
          </g>
        )
      })}

      {/* Player character */}
      <g style={{ transition: 'transform 0.3s ease-out' }}>
        <text x={toX(playerPos)} y={lineY - 6} textAnchor="middle" fontSize={24}>
          🏃
        </text>
      </g>

      {/* Position indicator */}
      <text x={toX(playerPos)} y={lineY + 42} textAnchor="middle" fill="#1E293B" fontSize={13} fontWeight={800} fontFamily="Nunito, sans-serif">
        {playerPos.toFixed(2)}
      </text>
    </svg>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function DecimalDash({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [playerPos, setPlayerPos] = useState(0)
  const [solved, setSolved] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [collectedCoins, setCollectedCoins] = useState([])
  const [showExplanation, setShowExplanation] = useState(false)

  const task = TASKS[taskIndex]

  // Handle tap on number line
  const handleTap = useCallback((val) => {
    setPlayerPos(val)

    // For coin tasks, collect nearby coins
    if (task.coins) {
      const newCollected = [...collectedCoins]
      task.coins.forEach((coinVal, i) => {
        if (!newCollected.includes(i) && Math.abs(val - coinVal) < 0.08) {
          newCollected.push(i)
        }
      })
      setCollectedCoins(newCollected)

      // Check if all coins collected and player at target
      if (newCollected.length === task.coins.length && Math.abs(val - task.target) <= task.tolerance) {
        setSolved(true)
        setShowExplanation(true)
      }
      return
    }

    // Normal task: check if position is close to target
    if (Math.abs(val - task.target) <= task.tolerance) {
      setSolved(true)
      setShowExplanation(true)
    }
  }, [task, collectedCoins])

  // Confirm wrong attempt
  const handleConfirm = useCallback(() => {
    if (solved) return
    if (Math.abs(playerPos - task.target) > task.tolerance) {
      setMistakes(m => m + 1)
      setShowHint(true)
    }
  }, [playerPos, task, solved])

  // Next task
  const handleNext = useCallback(() => {
    const next = taskIndex + 1
    setTasksCompleted(tc => tc + 1)
    if (next >= TASKS.length) {
      const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
      onComplete({ stars, mistakes })
    } else {
      setTaskIndex(next)
      setPlayerPos(0)
      setSolved(false)
      setShowHint(false)
      setShowExplanation(false)
      setCollectedCoins([])
    }
  }, [taskIndex, mistakes, onComplete])

  const hints = [
    lang === 'zh'
      ? `目标是 ${task.target}。看看它在哪两个整数之间？`
      : `Target is ${task.target}. Which two whole numbers is it between?`,
    lang === 'zh'
      ? `每两个整数之间分成10小格，每格是0.1。数一数需要几格？`
      : `Between two whole numbers there are 10 small ticks (each is 0.1). Count how many you need!`,
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>🏃</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '小数冲刺' : 'Decimal Dash'}
        </h2>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          {taskIndex + 1} / {TASKS.length}
        </div>
      </div>

      {/* Instruction */}
      <div className="card" style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
        <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', fontWeight: 600, color: '#1E293B' }}>
          {task.instruction[lang]}
        </div>
        {task.coins && (
          <div style={{ marginTop: 8, fontSize: 14, color: '#64748B' }}>
            💰 {lang === 'zh' ? '收集' : 'Collect'}: {collectedCoins.length}/{task.coins.length}
          </div>
        )}
      </div>

      {/* Number Line */}
      <div className="card" style={{ maxWidth: 440, width: '100%', padding: '20px 12px' }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: '#64748B', marginBottom: 12, textAlign: 'center' }}>
          {lang === 'zh' ? '👆 点击数轴移动' : '👆 TAP the number line to move'}
        </div>
        <NumberLine
          range={task.range}
          target={task.target}
          playerPos={playerPos}
          coins={task.coins}
          collectedCoins={collectedCoins}
          onTap={handleTap}
          solved={solved}
        />
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className="card" style={{
          maxWidth: 400, width: '100%', textAlign: 'center',
          background: '#E0FFF8', border: '2px solid #4ECDC4',
          animation: 'bounce-in 0.4s',
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>🎯</div>
          <p style={{ fontSize: 15, color: '#1E293B', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
            {task.explanation[lang]}
          </p>
          <button className="btn btn-primary" onClick={handleNext} style={{ marginTop: 16 }}>
            {taskIndex < TASKS.length - 1
              ? (lang === 'zh' ? '继续跑！ →' : 'Keep running! →')
              : (lang === 'zh' ? '到达终点！' : 'Finish line!')
            }
          </button>
        </div>
      )}

      {/* Check button (when not yet solved) */}
      {!solved && playerPos > 0 && (
        <button className="btn btn-warning" onClick={handleConfirm}>
          {lang === 'zh' ? '确认位置' : 'Lock Position'} 📍
        </button>
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
          message={
            solved
              ? task.explanation[lang]
              : (lang === 'zh' ? '点击数轴上的位置让角色跑到那里！注意看刻度线。' : 'Tap on the number line to move there! Watch the tick marks.')
          }
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
