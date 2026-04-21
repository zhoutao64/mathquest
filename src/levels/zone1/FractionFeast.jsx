import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    instruction: { en: 'Cut the cake in half! One slice for the customer.', zh: '把蛋糕一切两半！给客人一块。' },
    targetNumerator: 1,
    targetDenominator: 2,
    requiredCuts: 1,
    explanation: { en: '1 cut = 2 equal pieces. You gave 1 out of 2 = 1/2!', zh: '1刀 = 2等份。给了2份中的1份 = 1/2！' },
  },
  {
    instruction: { en: 'Cut twice to make 4 pieces. Give 1 piece!', zh: '切两刀变成4块，给客人1块！' },
    targetNumerator: 1,
    targetDenominator: 4,
    requiredCuts: 2,
    explanation: { en: '2 cuts = 4 equal pieces. 1 out of 4 = 1/4. More cuts = smaller pieces!', zh: '2刀 = 4等份。4份中的1份 = 1/4。切越多，块越小！' },
  },
  {
    instruction: { en: 'Cut twice, but give 3 pieces this time!', zh: '还是切两刀，但这次给3块！' },
    targetNumerator: 3,
    targetDenominator: 4,
    requiredCuts: 2,
    explanation: { en: '3 out of 4 pieces = 3/4. Same cuts, different amount served!', zh: '4块中给3块 = 3/4。同样切法，给的数量不同！' },
  },
  {
    instruction: { en: 'Cut 3 times. The customer wants 1/3 of the cake!', zh: '切3刀！客人要蛋糕的1/3！' },
    targetNumerator: 2,
    targetDenominator: 6,
    requiredCuts: 3,
    explanation: { en: '3 cuts = 6 pieces. 2 out of 6 = 2/6 = 1/3! Same amount, different fractions!', zh: '3刀 = 6份。6份中选2份 = 2/6 = 1/3！不同分数，同样大小！' },
  },
  {
    instruction: { en: 'Big order! Cut 4 times and give 5 pieces!', zh: '大订单！切4刀，给客人5块！' },
    targetNumerator: 5,
    targetDenominator: 8,
    requiredCuts: 4,
    explanation: { en: '4 cuts = 8 pieces. 5 out of 8 = 5/8. More than half the cake!', zh: '4刀 = 8份。8份中的5份 = 5/8。超过一半的蛋糕！' },
  },
]

// ─── Utility Functions ───────────────────────────────────────
function pointToLineDistance(px, py, x1, y1, x2, y2) {
  const A = px - x1
  const B = py - y1
  const C = x2 - x1
  const D = y2 - y1
  const dot = A * C + B * D
  const lenSq = C * C + D * D
  if (lenSq === 0) return Math.hypot(px - x1, py - y1)
  const t = Math.max(0, Math.min(1, dot / lenSq))
  const projX = x1 + t * C
  const projY = y1 + t * D
  return Math.hypot(px - projX, py - projY)
}

function lineLength(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1)
}

// ─── Cake SVG with Gesture ───────────────────────────────────
function CakeSVG({ cuts, selected, phase, onSliceClick, onCut, maxCuts }) {
  const svgRef = useRef(null)
  const [dragStart, setDragStart] = useState(null)
  const [dragEnd, setDragEnd] = useState(null)
  const [shakeClass, setShakeClass] = useState('')

  const SIZE = 300
  const cx = SIZE / 2, cy = SIZE / 2
  const radius = 115

  // Total slices based on cuts
  const totalSlices = cuts * 2

  // Get evenly distributed cut angles
  const getCutAngles = () => {
    if (cuts === 0) return []
    const angles = []
    for (let i = 0; i < cuts; i++) {
      angles.push((i * 180) / cuts)
    }
    return angles
  }

  // Convert pointer event to SVG coordinates
  const svgPoint = (e) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * SIZE
    const y = ((e.clientY - rect.top) / rect.height) * SIZE
    return { x, y }
  }

  const handlePointerDown = (e) => {
    if (phase !== 'cut') return
    if (cuts >= maxCuts) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const pt = svgPoint(e)
    setDragStart(pt)
    setDragEnd(pt)
  }

  const handlePointerMove = (e) => {
    if (!dragStart || phase !== 'cut') return
    e.preventDefault()
    const pt = svgPoint(e)
    setDragEnd(pt)
  }

  const handlePointerUp = (e) => {
    if (!dragStart || phase !== 'cut') return
    e.preventDefault()
    const pt = svgPoint(e)

    // Check validity of cut
    const dist = pointToLineDistance(cx, cy, dragStart.x, dragStart.y, pt.x, pt.y)
    const len = lineLength(dragStart.x, dragStart.y, pt.x, pt.y)

    if (dist < radius * 0.35 && len > radius * 0.8) {
      // Valid cut!
      onCut()
    } else {
      // Invalid — shake feedback
      setShakeClass('shake-once')
      setTimeout(() => setShakeClass(''), 400)
    }

    setDragStart(null)
    setDragEnd(null)
  }

  // Render cake slices
  const renderSlices = () => {
    if (totalSlices === 0) {
      // Whole cake, no cuts yet
      return (
        <circle cx={cx} cy={cy} r={radius} fill="#FFBE7A" stroke="#E8A050" strokeWidth={2} />
      )
    }

    const cutAngles = getCutAngles()
    const sliceAngle = 360 / totalSlices

    return Array.from({ length: totalSlices }, (_, i) => {
      const startDeg = cutAngles[0] + i * sliceAngle - 90
      const endDeg = startDeg + sliceAngle
      const startRad = (startDeg * Math.PI) / 180
      const endRad = (endDeg * Math.PI) / 180
      const x1 = cx + radius * Math.cos(startRad)
      const y1 = cy + radius * Math.sin(startRad)
      const x2 = cx + radius * Math.cos(endRad)
      const y2 = cy + radius * Math.sin(endRad)
      const largeArc = sliceAngle > 180 ? 1 : 0
      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
      const isSelected = selected.includes(i)

      const baseColors = ['#FFD4A8', '#FFBE7A', '#FFC994', '#FFB366', '#FFD4A8', '#FFBE7A', '#FFC994', '#FFB366']
      const fill = isSelected ? '#4ECDC4' : baseColors[i % baseColors.length]

      return (
        <path
          key={i}
          d={path}
          fill={fill}
          stroke="#fff"
          strokeWidth={2}
          style={{
            cursor: phase === 'select' ? 'pointer' : 'default',
            transition: 'fill 0.2s, transform 0.15s',
            transformOrigin: `${cx}px ${cy}px`,
            transform: isSelected ? 'scale(1.03)' : 'scale(1)',
          }}
          onClick={() => phase === 'select' && onSliceClick(i)}
        />
      )
    })
  }

  // Render cut lines
  const renderCutLines = () => {
    const cutAngles = getCutAngles()
    return cutAngles.map((angle, i) => {
      const rad = ((angle - 90) * Math.PI) / 180
      const x1 = cx + radius * Math.cos(rad)
      const y1 = cy + radius * Math.sin(rad)
      const x2 = cx - radius * Math.cos(rad)
      const y2 = cy - radius * Math.sin(rad)
      return (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="rgba(139,90,43,0.4)" strokeWidth={2}
          style={{ transition: 'all 0.3s ease' }}
        />
      )
    })
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={shakeClass}
      style={{
        width: '100%', maxWidth: 300, display: 'block', margin: '0 auto',
        touchAction: 'none', userSelect: 'none',
        cursor: phase === 'cut' && cuts < maxCuts ? 'crosshair' : 'default',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Cake shadow */}
      <circle cx={cx} cy={cy + 5} r={radius + 3} fill="rgba(0,0,0,0.08)" />

      {/* Cake slices */}
      {renderSlices()}

      {/* Cut lines */}
      {totalSlices > 0 && renderCutLines()}

      {/* Drag preview line */}
      {dragStart && dragEnd && (
        <line
          x1={dragStart.x} y1={dragStart.y}
          x2={dragEnd.x} y2={dragEnd.y}
          stroke="#FF6B6B" strokeWidth={3}
          strokeDasharray="8 4" strokeLinecap="round"
          opacity={0.8}
        />
      )}

      {/* Cherry decoration */}
      <circle cx={cx} cy={cy - 6} r={9} fill="#FF6B6B" />
      <circle cx={cx - 2} cy={cy - 9} r={3} fill="rgba(255,255,255,0.5)" />

      {/* Cut counter badge */}
      {phase === 'cut' && (
        <g>
          <circle cx={SIZE - 30} cy={30} r={18} fill="#fff" stroke="#E2E8F0" strokeWidth={2} />
          <text x={SIZE - 30} y={30} textAnchor="middle" dominantBaseline="central"
            fontSize={14} fontWeight={800} fill="#1E293B" fontFamily="Nunito, sans-serif">
            {cuts}/{maxCuts}
          </text>
        </g>
      )}
    </svg>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function FractionFeast({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [phase, setPhase] = useState('cut') // 'cut' | 'select' | 'correct'
  const [cuts, setCuts] = useState(0)
  const [selected, setSelected] = useState([])
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [invalidCut, setInvalidCut] = useState(false)

  const task = TASKS[taskIndex]
  const totalSlices = cuts * 2

  // Handle a valid cut
  const handleCut = useCallback(() => {
    const newCuts = cuts + 1
    setCuts(newCuts)
    setInvalidCut(false)
    if (newCuts >= task.requiredCuts) {
      // All cuts done, move to select phase
      setTimeout(() => setPhase('select'), 400)
    }
  }, [cuts, task])

  // Handle slice click in select phase
  const handleSliceClick = useCallback((i) => {
    if (phase !== 'select') return
    setSelected(prev =>
      prev.includes(i) ? prev.filter(s => s !== i) : [...prev, i]
    )
  }, [phase])

  // Check answer
  const handleCheck = useCallback(() => {
    if (selected.length === task.targetNumerator) {
      setPhase('correct')
    } else {
      setMistakes(m => m + 1)
      setShowHint(true)
    }
  }, [selected, task])

  // Next task
  const handleNext = useCallback(() => {
    const next = taskIndex + 1
    setTasksCompleted(tc => tc + 1)
    if (next >= TASKS.length) {
      const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
      onComplete({ stars, mistakes })
    } else {
      setTaskIndex(next)
      setPhase('cut')
      setCuts(0)
      setSelected([])
      setShowHint(false)
      setInvalidCut(false)
    }
  }, [taskIndex, mistakes, onComplete])

  // Professor messages per phase
  const professorMsg = {
    cut: lang === 'zh'
      ? `用手指划过蛋糕中心来切！需要切 ${task.requiredCuts} 刀（= ${task.requiredCuts * 2} 等份）`
      : `Swipe through the center to cut! Need ${task.requiredCuts} cut${task.requiredCuts > 1 ? 's' : ''} (= ${task.requiredCuts * 2} pieces)`,
    select: lang === 'zh'
      ? `很好！现在点击你要给客人的 ${task.targetNumerator} 块蛋糕`
      : `Great! Now tap ${task.targetNumerator} piece${task.targetNumerator > 1 ? 's' : ''} to serve the customer`,
    correct: task.explanation[lang],
  }

  const hints = [
    lang === 'zh'
      ? (phase === 'cut' ? '从蛋糕一边划到另一边，要穿过中心哦！' : `客人要 ${task.targetNumerator}/${task.targetDenominator}，选 ${task.targetNumerator} 块`)
      : (phase === 'cut' ? 'Swipe from one side to the other, through the center!' : `Customer wants ${task.targetNumerator}/${task.targetDenominator}, select ${task.targetNumerator} pieces`),
    lang === 'zh'
      ? `每一刀穿过中心，把蛋糕分成2份。${task.requiredCuts}刀 = ${task.requiredCuts * 2}份`
      : `Each cut through the center splits into 2. ${task.requiredCuts} cuts = ${task.requiredCuts * 2} pieces`,
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>🍰</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '分数盛宴' : 'Fraction Feast'}
        </h2>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          {taskIndex + 1} / {TASKS.length}
        </div>
      </div>

      {/* Customer order */}
      <div className="card" style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: '#64748B', marginBottom: 6 }}>
          📋 {lang === 'zh' ? '顾客订单' : 'CUSTOMER ORDER'}
        </div>
        <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.05rem)', color: '#1E293B', fontWeight: 600 }}>
          {task.instruction[lang]}
        </div>
        <div style={{
          fontSize: 'clamp(2rem, 8vw, 3rem)', fontWeight: 900, color: '#4ECDC4',
          marginTop: 8, fontFamily: 'Nunito, sans-serif',
        }}>
          <span>{task.targetNumerator}</span>
          <span style={{ margin: '0 4px', color: '#CBD5E1' }}>/</span>
          <span>{task.targetDenominator}</span>
        </div>
      </div>

      {/* Cake area */}
      <div className="card" style={{ maxWidth: 380, width: '100%', padding: '16px 12px' }}>
        {phase === 'cut' && (
          <div style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 8 }}>
            ✂️ {lang === 'zh' ? '划过蛋糕中心来切割！' : 'Swipe through the center to cut!'}
          </div>
        )}
        {phase === 'select' && (
          <div style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 8 }}>
            👆 {lang === 'zh' ? '点击选取要给客人的蛋糕块' : 'Tap slices to serve the customer'}
          </div>
        )}
        <CakeSVG
          cuts={cuts}
          selected={selected}
          phase={phase}
          onSliceClick={handleSliceClick}
          onCut={handleCut}
          maxCuts={task.requiredCuts}
        />
        {/* Selection count */}
        {phase === 'select' && (
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 16, fontWeight: 700, color: '#1E293B' }}>
            {lang === 'zh' ? '已选' : 'Selected'}: {selected.length} / {totalSlices}
            {selected.length === task.targetNumerator && (
              <span style={{ marginLeft: 8, color: '#4ECDC4' }}>
                = {task.targetNumerator}/{task.targetDenominator} ✓
              </span>
            )}
          </div>
        )}
      </div>

      {/* Explanation card */}
      {phase === 'correct' && (
        <div className="card" style={{
          maxWidth: 400, width: '100%', textAlign: 'center',
          background: '#E0FFF8', border: '2px solid #4ECDC4',
          animation: 'bounce-in 0.4s',
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>🎉</div>
          <p style={{ fontSize: 15, color: '#1E293B', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
            {task.explanation[lang]}
          </p>
          <button className="btn btn-primary" onClick={handleNext} style={{ marginTop: 16 }}>
            {taskIndex < TASKS.length - 1
              ? (lang === 'zh' ? '下一位客人 →' : 'Next Customer →')
              : (lang === 'zh' ? '完成！' : 'Finish!')
            }
          </button>
        </div>
      )}

      {/* Confirm button */}
      {phase === 'select' && selected.length > 0 && (
        <button className="btn btn-primary" onClick={handleCheck}>
          {lang === 'zh' ? '确认送出' : 'Serve!'} 🍽️
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
          message={professorMsg[phase]}
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
