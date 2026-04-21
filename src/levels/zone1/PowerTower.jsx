import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    type: 'simulate',
    instruction: {
      en: 'Press SPLIT to watch cells divide! Complete 3 rounds.',
      zh: '按"分裂"观察细胞分裂！完成 3 轮。',
    },
    base: 2,
    rounds: 3,
    explanation: {
      en: '2\u00B9=2, 2\u00B2=4, 2\u00B3=8 — each round DOUBLES! That\'s the power of exponents!',
      zh: '2\u00B9=2, 2\u00B2=4, 2\u00B3=8——每轮翻倍！这就是指数的力量！',
    },
  },
  {
    type: 'simulate',
    instruction: {
      en: 'Keep splitting! Watch how fast 4 rounds of doubling grows!',
      zh: '继续分裂！看看 4 轮翻倍增长有多快！',
    },
    base: 2,
    rounds: 4,
    explanation: {
      en: '2\u2074=16! From 1 cell to 16 in just 4 rounds. Exponential growth is explosive!',
      zh: '2\u2074=16！从 1 个细胞到 16 个只用了 4 轮。指数增长是爆发式的！',
    },
  },
  {
    type: 'predict',
    instruction: {
      en: 'Watch the pattern, then predict: what is 3\u00B2?',
      zh: '观察规律，然后预测：3\u00B2 等于多少？',
    },
    base: 3,
    exponent: 2,
    showUpTo: 1,
    answer: 9,
    options: [6, 9, 12, 27],
    explanation: {
      en: '3\u00B2 = 3 \u00D7 3 = 9. Not 3+3=6! Exponent means multiply, not add!',
      zh: '3\u00B2 = 3 \u00D7 3 = 9。不是 3+3=6！指数是乘法，不是加法！',
    },
  },
  {
    type: 'predict',
    instruction: {
      en: 'You know 2\u2074=16. What comes next? What is 2\u2075?',
      zh: '你已知 2\u2074=16。下一个是多少？2\u2075=?',
    },
    base: 2,
    exponent: 5,
    showUpTo: 4,
    answer: 32,
    options: [20, 24, 32, 64],
    explanation: {
      en: '2\u2075 = 2\u2074 \u00D7 2 = 16 \u00D7 2 = 32. Each new exponent just multiplies once more!',
      zh: '2\u2075 = 2\u2074 \u00D7 2 = 16 \u00D7 2 = 32。每增加一个指数就再乘一次！',
    },
  },
  {
    type: 'predict',
    instruction: {
      en: '10\u00B9=10, 10\u00B2=100... What is 10\u00B3?',
      zh: '10\u00B9=10, 10\u00B2=100……10\u00B3 等于多少？',
    },
    base: 10,
    exponent: 3,
    showUpTo: 2,
    answer: 1000,
    options: [30, 300, 1000, 10000],
    explanation: {
      en: '10\u00B3 = 10\u00D710\u00D710 = 1000. Powers of 10 just add zeros!',
      zh: '10\u00B3 = 10\u00D710\u00D710 = 1000。10 的指数就是加零！',
    },
  },
]

// ─── Superscript helper ─────────────────────────────────────
const SUPERSCRIPTS = { 0: '\u2070', 1: '\u00B9', 2: '\u00B2', 3: '\u00B3', 4: '\u2074', 5: '\u2075', 6: '\u2076', 7: '\u2077', 8: '\u2078', 9: '\u2079' }
function toSuper(n) {
  return String(n).split('').map(d => SUPERSCRIPTS[d] || d).join('')
}

// ─── Cell positions in a petri dish ─────────────────────────
function cellPositions(count, cx, cy, radius) {
  if (count === 0) return []
  if (count === 1) return [{ x: cx, y: cy }]

  const positions = []
  // Concentric rings
  let placed = 0
  let ring = 0
  const centerUsed = count > 0

  if (centerUsed) {
    positions.push({ x: cx, y: cy })
    placed = 1
  }

  while (placed < count) {
    ring++
    const r = Math.min(ring * (radius / 4), radius - 6)
    const perimeter = 2 * Math.PI * r
    const cellSize = Math.max(6, 14 - count * 0.3)
    const maxInRing = Math.max(6, Math.floor(perimeter / (cellSize + 2)))
    const inThisRing = Math.min(maxInRing, count - placed)

    for (let i = 0; i < inThisRing; i++) {
      const angle = (2 * Math.PI * i) / inThisRing + ring * 0.3
      positions.push({
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      })
      placed++
    }
  }
  return positions
}

// ─── Petri Dish SVG ─────────────────────────────────────────
function PetriDish({ cellCount, base, currentRound, maxRounds, lang }) {
  const W = 220, H = 220
  const dishCx = W / 2, dishCy = H / 2, dishR = 85

  const cellSize = cellCount <= 4 ? 10 : cellCount <= 8 ? 8 : cellCount <= 16 ? 6 : 5
  const cells = useMemo(() => cellPositions(cellCount, dishCx, dishCy, dishR - cellSize - 4), [cellCount, dishCx, dishCy, dishR, cellSize])

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 240, display: 'block', margin: '0 auto' }}>
      {/* Lab background */}
      <rect x={0} y={0} width={W} height={H} rx={8} fill="#F0FDFA" />
      {/* Grid lines */}
      {[44, 88, 132, 176].map(v => (
        <g key={v}>
          <line x1={v} y1={0} x2={v} y2={H} stroke="#CCFBF1" strokeWidth={0.5} />
          <line x1={0} y1={v} x2={W} y2={v} stroke="#CCFBF1" strokeWidth={0.5} />
        </g>
      ))}

      {/* Petri dish */}
      <circle cx={dishCx} cy={dishCy} r={dishR} fill="#ECFDF5" stroke="#A7F3D0" strokeWidth={2} />
      <circle cx={dishCx} cy={dishCy} r={dishR - 2} fill="none" stroke="#D1FAE5" strokeWidth={1} />

      {/* Cells */}
      {cells.map((pos, i) => (
        <g key={i}>
          <circle cx={pos.x} cy={pos.y} r={cellSize} fill="#4ECDC4" opacity={0.85}>
            <animate attributeName="r" values={`${cellSize * 0.8};${cellSize};${cellSize * 0.8}`}
              dur={`${1.5 + (i % 3) * 0.3}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={pos.x - cellSize * 0.25} cy={pos.y - cellSize * 0.25}
            r={cellSize * 0.3} fill="rgba(255,255,255,0.4)" />
          {/* Nucleus */}
          <circle cx={pos.x + cellSize * 0.1} cy={pos.y + cellSize * 0.1}
            r={cellSize * 0.25} fill="#14B8A6" opacity={0.6} />
        </g>
      ))}

      {/* Cell count label */}
      <text x={dishCx} y={H - 6} textAnchor="middle" fontSize={12} fontWeight={800}
        fill="#0D9488" fontFamily="Nunito, sans-serif">
        {cellCount} {lang === 'zh' ? '个细胞' : (cellCount === 1 ? 'cell' : 'cells')}
      </text>
    </svg>
  )
}

// ─── Exponent Record Panel ──────────────────────────────────
function RecordPanel({ base, records, currentRound, lang }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6,
      padding: '12px 16px', borderRadius: 12,
      background: '#F0F9FF', border: '2px solid #BAE6FD',
      minWidth: 140,
    }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#0284C7', textAlign: 'center', marginBottom: 4 }}>
        {lang === 'zh' ? '实验记录' : 'Lab Record'}
      </div>
      {/* Starting state */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 14, color: '#64748B',
        padding: '4px 8px', borderRadius: 6,
        background: '#F8FAFC',
      }}>
        <span style={{ fontWeight: 700 }}>{base}{toSuper(0)}</span>
        <span>=</span>
        <span style={{ fontWeight: 800 }}>1</span>
        <span style={{ marginLeft: 'auto', fontSize: 11 }}>{'\u2714'}</span>
      </div>
      {records.map((rec, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 14,
          color: i === currentRound - 1 ? '#0284C7' : '#334155',
          fontWeight: i === currentRound - 1 ? 800 : 600,
          padding: '4px 8px', borderRadius: 6,
          background: i === currentRound - 1 ? '#E0F2FE' : '#F8FAFC',
          border: i === currentRound - 1 ? '1.5px solid #60A5FA' : '1px solid transparent',
        }}>
          <span>{base}{toSuper(i + 1)}</span>
          <span>=</span>
          <span style={{ fontWeight: 800 }}>{rec.value}</span>
          {rec.revealed && <span style={{ marginLeft: 'auto', fontSize: 11 }}>{'\u2714'}</span>}
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function PowerTower({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [solved, setSolved] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)

  // Simulate state
  const [currentRound, setCurrentRound] = useState(0)
  const [records, setRecords] = useState([])

  // Predict state
  const [selectedAnswer, setSelectedAnswer] = useState(null)

  const task = TASKS[taskIndex]

  // Build initial records for predict tasks
  const predictRecords = useMemo(() => {
    if (task.type !== 'predict') return []
    const recs = []
    for (let i = 1; i <= task.showUpTo; i++) {
      recs.push({ value: Math.pow(task.base, i), revealed: true })
    }
    return recs
  }, [task])

  // Current cell count
  const cellCount = task.type === 'simulate'
    ? Math.pow(task.base, currentRound)
    : task.type === 'predict'
      ? Math.pow(task.base, task.showUpTo)
      : 1

  // Simulate: press split
  const handleSplit = useCallback(() => {
    if (solved) return
    const nextRound = currentRound + 1
    const value = Math.pow(task.base, nextRound)
    const newRecords = [...records, { value, revealed: true }]
    setCurrentRound(nextRound)
    setRecords(newRecords)

    if (nextRound >= task.rounds) {
      setTimeout(() => {
        setSolved(true)
        setShowExplanation(true)
      }, 500)
    }
  }, [task, currentRound, records, solved])

  // Predict: choose answer
  const handlePredict = useCallback((val) => {
    setSelectedAnswer(val)
    if (val === task.answer) {
      setSolved(true)
      setShowExplanation(true)
    } else {
      setMistakes(m => m + 1)
      setShowHint(true)
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
      setCurrentRound(0)
      setRecords([])
      setSelectedAnswer(null)
    }
  }, [taskIndex, mistakes, onComplete])

  // Hints
  const hints = task.type === 'simulate'
    ? [
        lang === 'zh'
          ? `每按一次分裂，细胞数量乘以 ${task.base}！`
          : `Each split multiplies the cells by ${task.base}!`,
        lang === 'zh'
          ? '指数 = 重复乘法。2³ 就是 2×2×2！'
          : 'Exponent = repeated multiplication. 2\u00B3 means 2\u00D72\u00D72!',
      ]
    : [
        lang === 'zh'
          ? `看看规律！每次都乘以 ${task.base}。上一个结果 × ${task.base} = ?`
          : `See the pattern! Each time, multiply by ${task.base}. Last result \u00D7 ${task.base} = ?`,
        lang === 'zh'
          ? `${task.base}${toSuper(task.exponent)} = ${task.base}${toSuper(task.exponent - 1)} × ${task.base}`
          : `${task.base}${toSuper(task.exponent)} = ${task.base}${toSuper(task.exponent - 1)} \u00D7 ${task.base}`,
      ]

  // Display records for current view
  const displayRecords = task.type === 'simulate' ? records : predictRecords

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>{'\uD83E\uDDEC'}</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '指数之塔' : 'Power Tower'}
        </h2>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          {taskIndex + 1} / {TASKS.length}
        </div>
      </div>

      {/* Instruction */}
      <div className="card" style={{ textAlign: 'center', maxWidth: 420, width: '100%' }}>
        <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', fontWeight: 600, color: '#1E293B' }}>
          {task.instruction[lang]}
        </div>
        {task.type === 'simulate' && (
          <div style={{ marginTop: 8, fontSize: 14, color: '#64748B' }}>
            {'\uD83E\uDD4F'} {lang === 'zh' ? '轮次' : 'Round'}: {currentRound}/{task.rounds}
          </div>
        )}
      </div>

      {/* Main content: Petri dish + Record panel */}
      <div style={{
        display: 'flex', gap: 16, alignItems: 'flex-start',
        flexWrap: 'wrap', justifyContent: 'center',
        maxWidth: 500, width: '100%',
      }}>
        <div className="card" style={{ padding: '12px 8px', flex: '1 1 240px', minWidth: 200 }}>
          <PetriDish
            cellCount={cellCount}
            base={task.base}
            currentRound={task.type === 'simulate' ? currentRound : task.showUpTo}
            maxRounds={task.type === 'simulate' ? task.rounds : task.exponent}
            lang={lang}
          />
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <RecordPanel
            base={task.base}
            records={displayRecords}
            currentRound={task.type === 'simulate' ? currentRound : task.showUpTo}
            lang={lang}
          />
        </div>
      </div>

      {/* Simulate: Split button */}
      {task.type === 'simulate' && !solved && (
        <button className="btn btn-primary" onClick={handleSplit}
          style={{
            padding: '14px 40px', fontSize: 18, fontWeight: 800,
            background: 'linear-gradient(135deg, #4ECDC4, #14B8A6)',
            border: 'none', color: 'white', borderRadius: 12,
            boxShadow: '0 4px 12px rgba(78,205,196,0.4)',
          }}>
          {'\uD83E\uDDA0'} {lang === 'zh' ? '分裂！' : 'SPLIT!'}
        </button>
      )}

      {/* Predict: question + options */}
      {task.type === 'predict' && !solved && (
        <div>
          <div style={{
            textAlign: 'center', marginBottom: 12,
            fontSize: 20, fontWeight: 800, color: '#0284C7',
          }}>
            {task.base}{toSuper(task.exponent)} = ?
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {task.options.map(val => {
              const isWrong = selectedAnswer === val && val !== task.answer
              return (
                <button key={val} className="btn"
                  onClick={() => handlePredict(val)}
                  style={{
                    padding: '12px 20px', fontSize: 18, fontWeight: 800, minWidth: 60,
                    background: isWrong ? '#FEE2E2' : '#fff',
                    border: `2px solid ${isWrong ? '#EF4444' : '#BAE6FD'}`,
                    color: isWrong ? '#DC2626' : '#1E293B',
                    borderRadius: 10,
                  }}>
                  {val.toLocaleString()}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Explanation */}
      {showExplanation && (
        <div className="card" style={{
          maxWidth: 400, width: '100%', textAlign: 'center',
          background: '#ECFDF5', border: '2px solid #4ECDC4',
          animation: 'bounce-in 0.4s',
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>{'\uD83E\uDDEC'}</div>
          <p style={{ fontSize: 15, color: '#1E293B', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
            {task.explanation[lang]}
          </p>
          <button className="btn btn-primary" onClick={handleNext} style={{ marginTop: 16 }}>
            {taskIndex < TASKS.length - 1
              ? (lang === 'zh' ? '下一轮实验！ \u2192' : 'Next experiment! \u2192')
              : (lang === 'zh' ? '实验完成！' : 'Experiment complete!')}
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
          message={
            solved
              ? task.explanation[lang]
              : task.type === 'simulate'
                ? (lang === 'zh' ? '按分裂按钮，看看细胞怎么增长！' : 'Press SPLIT and watch the cells grow!')
                : (lang === 'zh' ? '看看前几轮的规律，预测下一个！' : 'Look at the pattern from previous rounds, then predict!')
          }
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
