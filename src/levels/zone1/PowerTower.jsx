import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    type: 'simulate',
    instruction: {
      en: 'Press SPLIT to watch cells divide! Complete 3 rounds.',
      zh: '\u6309\u201C\u5206\u88C2\u201D\u770B\u7EC6\u80DE\u5206\u88C2\uFF01\u5B8C\u6210 3 \u8F6E\u3002',
    },
    base: 2,
    rounds: 3,
    explanation: {
      en: '2\u00B9=2, 2\u00B2=4, 2\u00B3=8 \u2014 each round doubles! That\'s the power of exponents!',
      zh: '2\u00B9=2, 2\u00B2=4, 2\u00B3=8\u2014\u2014\u6BCF\u8F6E\u7FFB\u500D\uFF01\u8FD9\u5C31\u662F\u6307\u6570\u7684\u529B\u91CF\uFF01',
    },
  },
  {
    type: 'simulate',
    instruction: {
      en: 'Keep splitting! Complete 4 rounds and feel the growth!',
      zh: '\u7EE7\u7EED\u5206\u88C2\uFF01\u5B8C\u6210 4 \u8F6E\uFF0C\u611F\u53D7\u589E\u957F\uFF01',
    },
    base: 2,
    rounds: 4,
    explanation: {
      en: '2\u2074=16! From 1 cell to 16 in just 4 rounds. Exponential growth is FAST!',
      zh: '2\u2074=16\uFF01\u4ECE 1 \u4E2A\u7EC6\u80DE\u5230 16 \u4E2A\u53EA\u7528\u4E86 4 \u8F6E\u3002\u6307\u6570\u589E\u957F\u8D85\u5FEB\uFF01',
    },
  },
  {
    type: 'predict',
    instruction: {
      en: 'You saw 3\u00B9=3. Now predict: what is 3\u00B2?',
      zh: '\u4F60\u770B\u5230\u4E86 3\u00B9=3\u3002\u73B0\u5728\u9884\u6D4B\uFF1A3\u00B2 \u7B49\u4E8E\u591A\u5C11\uFF1F',
    },
    base: 3,
    exponent: 2,
    showUpTo: 1,
    answer: 9,
    options: [6, 9, 12, 27],
    explanation: {
      en: '3\u00B2 = 3 \u00D7 3 = 9. Exponent means "multiply by itself" that many times!',
      zh: '3\u00B2 = 3 \u00D7 3 = 9\u3002\u6307\u6570\u7684\u610F\u601D\u662F\u201C\u81EA\u5DF1\u4E58\u81EA\u5DF1\u201D\u90A3\u4E48\u591A\u6B21\uFF01',
    },
  },
  {
    type: 'predict',
    instruction: {
      en: 'You know 2\u2074=16. What comes next? 2\u2075=?',
      zh: '\u4F60\u77E5\u9053 2\u2074=16\u3002\u4E0B\u4E00\u4E2A\u662F\u4EC0\u4E48\uFF1F2\u2075=\uFF1F',
    },
    base: 2,
    exponent: 5,
    showUpTo: 4,
    answer: 32,
    options: [20, 25, 32, 64],
    explanation: {
      en: '2\u2075 = 2\u2074 \u00D7 2 = 16 \u00D7 2 = 32. Each new exponent just multiplies one more time!',
      zh: '2\u2075 = 2\u2074 \u00D7 2 = 16 \u00D7 2 = 32\u3002\u6BCF\u589E\u52A0\u4E00\u4E2A\u6307\u6570\u5C31\u518D\u4E58\u4E00\u6B21\uFF01',
    },
  },
  {
    type: 'predict',
    instruction: {
      en: 'You saw 10\u00B9=10, 10\u00B2=100. What is 10\u00B3?',
      zh: '\u4F60\u770B\u5230\u4E86 10\u00B9=10\uFF0C10\u00B2=100\u300210\u00B3 \u7B49\u4E8E\u591A\u5C11\uFF1F',
    },
    base: 10,
    exponent: 3,
    showUpTo: 2,
    answer: 1000,
    options: [300, 1000, 10000, 30],
    explanation: {
      en: '10\u00B3 = 10 \u00D7 10 \u00D7 10 = 1000! Powers of 10 just add zeros!',
      zh: '10\u00B3 = 10 \u00D7 10 \u00D7 10 = 1000\uFF0110 \u7684\u6307\u6570\u5C31\u662F\u52A0\u96F6\uFF01',
    },
  },
]

// ─── Animated value hook ────────────────────────────────────
function useAnimatedValue(target, duration = 500) {
  const [value, setValue] = useState(target)
  const ref = useRef({ start: target, end: target, t0: 0, raf: 0 })

  useEffect(() => {
    const r = ref.current
    r.start = value
    r.end = target
    r.t0 = performance.now()
    cancelAnimationFrame(r.raf)

    function tick(now) {
      const p = Math.min(1, (now - r.t0) / duration)
      const ease = 1 - Math.pow(1 - p, 3)
      setValue(r.start + (r.end - r.start) * ease)
      if (p < 1) r.raf = requestAnimationFrame(tick)
    }
    r.raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(r.raf)
  }, [target, duration])

  return value
}

// ─── Cell positions within petri dish ───────────────────────
function cellPositions(count, cx, cy, radius) {
  if (count === 0) return []
  if (count === 1) return [{ x: cx, y: cy }]

  const positions = []
  let placed = 0
  const cellR = Math.max(6, Math.min(14, radius / (Math.sqrt(count) * 0.9)))

  // Center cell
  positions.push({ x: cx, y: cy })
  placed++

  let ring = 1
  while (placed < count) {
    const ringRadius = ring * cellR * 2.2
    const circumference = 2 * Math.PI * ringRadius
    const maxInRing = Math.max(6, Math.floor(circumference / (cellR * 2.2)))
    const inThisRing = Math.min(maxInRing, count - placed)

    for (let i = 0; i < inThisRing; i++) {
      const angle = (2 * Math.PI * i) / inThisRing - Math.PI / 2
      positions.push({
        x: cx + Math.cos(angle) * ringRadius,
        y: cy + Math.sin(angle) * ringRadius,
      })
      placed++
    }
    ring++
  }

  return positions.slice(0, count)
}

// ─── Superscript digit helper ───────────────────────────────
const SUPERSCRIPTS = {
  0: '\u2070', 1: '\u00B9', 2: '\u00B2', 3: '\u00B3', 4: '\u2074',
  5: '\u2075', 6: '\u2076', 7: '\u2077', 8: '\u2078', 9: '\u2079',
}
function toSuperscript(n) {
  return String(n).split('').map(d => SUPERSCRIPTS[d] || d).join('')
}

// ─── Petri Dish SVG ─────────────────────────────────────────
function PetriDish({ cellCount, splitCells, onCellClick, canClick, lang }) {
  const W = 300, H = 200
  const dishCx = W / 2, dishCy = H / 2 + 5
  const dishR = 80

  const cellR = Math.max(4, Math.min(12, dishR / (Math.sqrt(Math.max(cellCount, 1)) * 1.1)))
  const cells = cellPositions(cellCount, dishCx, dishCy, dishR - cellR - 4)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 380, display: 'block', margin: '0 auto' }}>
      <defs>
        <radialGradient id="labBg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#E0F7FA" />
          <stop offset="100%" stopColor="#B2EBF2" />
        </radialGradient>
        <radialGradient id="dishGrad" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="100%" stopColor="rgba(178,235,242,0.3)" />
        </radialGradient>
      </defs>

      <rect x={0} y={0} width={W} height={H} rx={8} fill="url(#labBg)" />

      {/* Grid lines */}
      {[50, 100, 150, 200, 250].map(x => (
        <line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} stroke="#B2EBF2" strokeWidth={0.5} opacity={0.5} />
      ))}
      {[50, 100, 150].map(y => (
        <line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} stroke="#B2EBF2" strokeWidth={0.5} opacity={0.5} />
      ))}

      {/* Petri dish */}
      <circle cx={dishCx} cy={dishCy} r={dishR + 4} fill="none" stroke="#94A3B8" strokeWidth={2} opacity={0.4} />
      <circle cx={dishCx} cy={dishCy} r={dishR} fill="url(#dishGrad)" stroke="#CBD5E1" strokeWidth={1.5} />

      {/* Cells — clickable for simulate */}
      {cells.map((pos, i) => {
        const isSplit = splitCells && splitCells.has(i)
        const clickable = canClick && !isSplit
        return (
          <g key={i} transform={`translate(${pos.x}, ${pos.y})`}
            onClick={clickable ? () => onCellClick(i) : undefined}
            style={{ cursor: clickable ? 'pointer' : 'default' }}>
            {/* Larger hit area */}
            {clickable && <circle cx={0} cy={0} r={cellR + 6} fill="transparent" />}
            <circle cx={0} cy={0} r={cellR}
              fill={isSplit ? '#2DD4A8' : '#4ECDC4'}
              opacity={isSplit ? 0.5 : 0.85}
              stroke={clickable ? '#FFE66D' : '#2DD4A8'} strokeWidth={clickable ? 1.5 : 0.8}>
              {clickable && (
                <animate attributeName="stroke-opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
              )}
            </circle>
            <circle cx={-cellR * 0.15} cy={-cellR * 0.15} r={cellR * 0.3}
              fill="rgba(255,255,255,0.4)" />
            {/* Split indicator */}
            {isSplit && (
              <text x={0} y={3} textAnchor="middle" fontSize={cellR * 0.8} fill="white" fontWeight={800}>{'\u2713'}</text>
            )}
          </g>
        )
      })}

      {/* Cell count label */}
      <text x={dishCx} y={18} textAnchor="middle" fontSize={14} fontWeight={800}
        fill="#0D9488" fontFamily="Nunito, sans-serif">
        {cellCount} {cellCount === 1 ? 'cell' : 'cells'}
      </text>

      {/* Hint for clickable */}
      {canClick && (
        <text x={dishCx} y={H - 6} textAnchor="middle" fontSize={9} fill="#64748B" fontFamily="Nunito, sans-serif">
          {lang === 'zh' ? '\u261D\uFE0F \u70B9\u51FB\u7EC6\u80DE\u8BA9\u5B83\u5206\u88C2' : '\u261D\uFE0F Tap cells to split them'}
        </text>
      )}

      {/* Decorations */}
      <text x={18} y={26} fontSize={18} opacity={0.2}>{'\uD83E\uDDEC'}</text>
      <text x={W - 30} y={26} fontSize={14} opacity={0.15}>{'\uD83D\uDD2C'}</text>
    </svg>
  )
}

// ─── Exponent Record Panel ──────────────────────────────────
function ExponentRecord({ base, currentRound, maxRound, lang }) {
  const records = []
  let val = 1
  for (let i = 1; i <= maxRound; i++) {
    val *= base
    records.push({ exp: i, result: val, revealed: i <= currentRound })
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6,
      background: '#F0F9FF', borderRadius: 10, padding: '10px 14px',
      border: '1.5px solid #BAE6FD', maxWidth: 200,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#0284C7', textAlign: 'center' }}>
        {lang === 'zh' ? '\u6307\u6570\u8BB0\u5F55' : 'Exponent Log'}
      </div>
      {records.map(r => (
        <div key={r.exp} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 15, fontWeight: r.revealed ? 700 : 400,
          color: r.revealed ? '#1E293B' : '#CBD5E1',
          transition: 'all 0.3s',
        }}>
          <span style={{ fontFamily: 'monospace' }}>
            {base}{toSuperscript(r.exp)}
          </span>
          <span>=</span>
          <span style={{
            color: r.exp === currentRound ? '#F59E0B' : r.revealed ? '#059669' : '#CBD5E1',
            fontSize: r.exp === currentRound ? 18 : 15,
            transition: 'all 0.3s',
          }}>
            {r.revealed ? r.result : '?'}
          </span>
          {r.revealed && r.exp < currentRound && (
            <span style={{ color: '#4ECDC4', fontSize: 12 }}>{'\u2713'}</span>
          )}
          {r.exp === currentRound && r.revealed && (
            <span style={{ color: '#F59E0B', fontSize: 12 }}>{'\u2190'}</span>
          )}
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
  const [cellCount, setCellCount] = useState(1)
  const [splitCells, setSplitCells] = useState(new Set())

  // Predict state
  const [selectedAnswer, setSelectedAnswer] = useState(null)

  const task = TASKS[taskIndex]

  // Click a cell to split it (simulate tasks)
  const handleCellClick = useCallback((cellIndex) => {
    if (solved || task.type !== 'simulate') return
    if (splitCells.has(cellIndex)) return

    const newSplit = new Set(splitCells)
    newSplit.add(cellIndex)
    setSplitCells(newSplit)

    // Check if all cells in current round are split
    if (newSplit.size >= cellCount) {
      // All cells split! Advance to next round
      const nextRound = currentRound + 1
      const newCount = Math.pow(task.base, nextRound)

      setTimeout(() => {
        setCurrentRound(nextRound)
        setCellCount(newCount)
        setSplitCells(new Set())

        if (nextRound >= task.rounds) {
          setTimeout(() => {
            setSolved(true)
            setShowExplanation(true)
          }, 400)
        }
      }, 300)
    }
  }, [task, cellCount, currentRound, splitCells, solved])

  // Predict answer
  const handlePredict = useCallback((val) => {
    if (solved) return
    setSelectedAnswer(val)

    if (val === task.answer) {
      setCellCount(task.answer)
      setCurrentRound(task.exponent)
      setTimeout(() => {
        setSolved(true)
        setShowExplanation(true)
      }, 400)
    } else {
      setMistakes(m => m + 1)
      setShowHint(true)
    }
  }, [task, solved])

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
      setSelectedAnswer(null)

      const nextTask = TASKS[next]
      if (nextTask.type === 'simulate') {
        setCurrentRound(0)
        setCellCount(1)
      } else if (nextTask.type === 'predict') {
        const showVal = Math.pow(nextTask.base, nextTask.showUpTo)
        setCurrentRound(nextTask.showUpTo)
        setCellCount(showVal)
      }
    }
  }, [taskIndex, mistakes, onComplete])

  // Initialize predict tasks on first render
  useEffect(() => {
    if (task.type === 'predict') {
      const showVal = Math.pow(task.base, task.showUpTo)
      setCurrentRound(task.showUpTo)
      setCellCount(showVal)
    }
  }, [taskIndex])

  // Hints
  const hints = task.type === 'simulate'
    ? [
        lang === 'zh'
          ? `\u70B9\u51FB\u6BCF\u4E2A\u7EC6\u80DE\u8BA9\u5B83\u5206\u88C2\u6210 ${task.base} \u4E2A\uFF01`
          : `Tap each cell to split it into ${task.base}!`,
        lang === 'zh'
          ? '\u6307\u6570 = \u91CD\u590D\u4E58\u6CD5\u30022\u00B3 \u5C31\u662F 2\u00D72\u00D72\uFF01'
          : 'Exponent = repeated multiplication. 2\u00B3 means 2\u00D72\u00D72!',
      ]
    : [
        lang === 'zh'
          ? `\u770B\u770B\u89C4\u5F8B\uFF1A\u6BCF\u8F6E\u90FD\u4E58\u4EE5 ${task.base}\u3002\u4E0A\u4E00\u8F6E\u7684\u7ED3\u679C \u00D7 ${task.base} = \uFF1F`
          : `See the pattern: multiply by ${task.base} each round. Last result \u00D7 ${task.base} = ?`,
        lang === 'zh'
          ? `${task.base}${toSuperscript(task.exponent)} = ${task.base}${toSuperscript(task.exponent - 1)} \u00D7 ${task.base}`
          : `${task.base}${toSuperscript(task.exponent)} = ${task.base}${toSuperscript(task.exponent - 1)} \u00D7 ${task.base}`,
      ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>{'\uD83E\uDDEC'}</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '\u6307\u6570\u4E4B\u5854' : 'Power Tower'}
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
      </div>

      {/* Petri Dish + Record Panel */}
      <div style={{
        display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
        alignItems: 'flex-start', maxWidth: 600, width: '100%',
      }}>
        <div className="card" style={{ flex: '1 1 300px', maxWidth: 420, padding: '12px 8px' }}>
          <PetriDish
            cellCount={cellCount}
            splitCells={task.type === 'simulate' ? splitCells : null}
            onCellClick={handleCellClick}
            canClick={task.type === 'simulate' && !solved}
            lang={lang}
          />
        </div>
        <ExponentRecord
          base={task.base}
          currentRound={currentRound}
          maxRound={task.type === 'simulate' ? task.rounds : task.exponent}
          lang={lang}
        />
      </div>

      {/* Simulate: no button — click cells directly in petri dish */}
      {task.type === 'simulate' && !solved && (
        <div style={{ fontSize: 14, color: '#64748B', textAlign: 'center' }}>
          {lang === 'zh'
            ? `\u{1F52C} \u7B2C ${currentRound + 1} \u8F6E\uFF1A\u5DF2\u5206\u88C2 ${splitCells.size}/${cellCount}`
            : `\u{1F52C} Round ${currentRound + 1}: ${splitCells.size}/${cellCount} split`}
        </div>
      )}

      {/* Predict: Option buttons */}
      {task.type === 'predict' && !solved && (
        <div>
          <div style={{ fontSize: 16, color: '#1E293B', textAlign: 'center', marginBottom: 10, fontWeight: 700 }}>
            {task.base}{toSuperscript(task.exponent)} = ?
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {task.options.map(val => (
              <button key={val} className="btn"
                onClick={() => handlePredict(val)}
                style={{
                  padding: '12px 22px', fontSize: 18, fontWeight: 800,
                  minWidth: 60,
                  background: selectedAnswer === val && val !== task.answer ? '#FEE2E2' : '#fff',
                  border: `2px solid ${selectedAnswer === val && val !== task.answer ? '#EF4444' : '#CBD5E1'}`,
                  color: selectedAnswer === val && val !== task.answer ? '#DC2626' : '#1E293B',
                  borderRadius: 10,
                }}>
                {val}
              </button>
            ))}
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
          <div style={{ fontSize: 20, marginBottom: 6 }}>{'\uD83E\uDDEA'}</div>
          <p style={{ fontSize: 15, color: '#1E293B', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
            {task.explanation[lang]}
          </p>
          <button className="btn btn-primary" onClick={handleNext} style={{ marginTop: 16 }}>
            {taskIndex < TASKS.length - 1
              ? (lang === 'zh' ? '\u4E0B\u4E00\u8F6E\u5B9E\u9A8C\uFF01 \u2192' : 'Next experiment! \u2192')
              : (lang === 'zh' ? '\u5B9E\u9A8C\u5B8C\u6210\uFF01' : 'Experiment complete!')}
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
                ? (lang === 'zh' ? '\u70B9\u51FB\u6BCF\u4E2A\u7EC6\u80DE\u8BA9\u5B83\u5206\u88C2\uFF01' : 'Tap each cell to make it split!')
                : (lang === 'zh' ? '\u770B\u770B\u89C4\u5F8B\uFF0C\u9884\u6D4B\u4E0B\u4E00\u4E2A\u6307\u6570\u7684\u7ED3\u679C\uFF01' : 'See the pattern, predict the next power!')
          }
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
