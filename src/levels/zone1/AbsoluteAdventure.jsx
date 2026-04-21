import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Smooth animation hook ──────────────────────────────────
function useAnimatedValue(target, duration = 400) {
  const [display, setDisplay] = useState(target)
  const rafRef = useRef(null)
  const fromRef = useRef(target)

  useEffect(() => {
    const from = fromRef.current
    if (from === target) return

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const startTime = performance.now()
    const startVal = from

    const animate = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startVal + (target - startVal) * eased

      setDisplay(current)
      fromRef.current = current

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        fromRef.current = target
        setDisplay(target)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  const reset = useCallback((val) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    fromRef.current = val
    setDisplay(val)
  }, [])

  return { display, isAnimating: display !== target, reset }
}

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    type: 'distance',
    instruction: { en: 'Drag the explorer to position 4. How many steps from home?', zh: '\u62D6\u52A8\u63A2\u9669\u5BB6\u5230\u4F4D\u7F6E 4\u3002\u79BB\u5BB6\u6709\u591A\u5C11\u6B65\uFF1F' },
    target: 4,
    range: [-6, 6],
    explanation: {
      en: '|4| = 4. It\'s 4 steps from zero \u2014 distance is always positive!',
      zh: '|4| = 4\u3002\u79BB\u96F6\u6709 4 \u6B65\u2014\u2014\u8DDD\u79BB\u6C38\u8FDC\u662F\u6B63\u6570\uFF01',
    },
  },
  {
    type: 'distance',
    instruction: { en: 'Now drag to -3. Count your steps from home!', zh: '\u73B0\u5728\u62D6\u5230 -3\u3002\u4ECE\u5BB6\u6570\u6B65\u6570\uFF01' },
    target: -3,
    range: [-6, 6],
    explanation: {
      en: '|-3| = 3. Even though -3 is negative, the distance is still 3!',
      zh: '|-3| = 3\u3002\u867D\u7136 -3 \u662F\u8D1F\u6570\uFF0C\u4F46\u8DDD\u79BB\u8FD8\u662F 3\uFF01',
    },
  },
  {
    type: 'comparison',
    instruction: { en: 'Drag to -5, then to 3. Who is farther from home?', zh: '\u5148\u62D6\u5230 -5\uFF0C\u518D\u62D6\u5230 3\u3002\u8C01\u79BB\u5BB6\u66F4\u8FDC\uFF1F' },
    positions: [-5, 3],
    answer: -5,
    range: [-6, 6],
    explanation: {
      en: '|-5| = 5 and |3| = 3. -5 is farther! More negative doesn\'t mean closer \u2014 it means MORE steps!',
      zh: '|-5| = 5\uFF0C|3| = 3\u3002-5 \u66F4\u8FDC\uFF01\u66F4\u5927\u7684\u8D1F\u6570\u4E0D\u4EE3\u8868\u66F4\u8FD1\u2014\u2014\u800C\u662F\u6B65\u6570\u66F4\u591A\uFF01',
    },
  },
  {
    type: 'find_both',
    instruction: { en: 'Drag the explorer to find ALL numbers exactly 2 steps from home!', zh: '\u62D6\u52A8\u63A2\u9669\u5BB6\u627E\u51FA\u6240\u6709\u8DDD\u79BB\u5BB6\u6070\u597D 2 \u6B65\u7684\u6570\u5B57\uFF01' },
    targetDistance: 2,
    answers: [2, -2],
    range: [-6, 6],
    explanation: {
      en: 'Both 2 and -2 are exactly 2 steps from zero! |2| = |-2| = 2. Two answers!',
      zh: '2 \u548C -2 \u90FD\u8DDD\u79BB\u96F6\u6070\u597D 2 \u6B65\uFF01|2| = |-2| = 2\u3002\u4E24\u4E2A\u7B54\u6848\uFF01',
    },
  },
  {
    type: 'comparison',
    instruction: { en: 'Drag to -4, then to 2. Who is closer to home?', zh: '\u5148\u62D6\u5230 -4\uFF0C\u518D\u62D6\u5230 2\u3002\u8C01\u79BB\u5BB6\u66F4\u8FD1\uFF1F' },
    positions: [-4, 2],
    answer: 2,
    isCloser: true,
    range: [-6, 6],
    explanation: {
      en: '|-4| = 4 and |2| = 2. 2 is closer! Smaller absolute value = closer to home.',
      zh: '|-4| = 4\uFF0C|2| = 2\u30022 \u66F4\u8FD1\uFF01\u7EDD\u5BF9\u503C\u8D8A\u5C0F = \u79BB\u5BB6\u8D8A\u8FD1\u3002',
    },
  },
]

// ─── Distance Arc ────────────────────────────────────────────
function DistanceArc({ fromX, toX, lineY, distance, color, lang }) {
  const midX = (fromX + toX) / 2
  const arcTop = lineY - 38
  const d = `M ${fromX} ${lineY} Q ${midX} ${arcTop} ${toX} ${lineY}`

  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeDasharray="5,3" opacity={0.8} />
      <rect x={midX - 22} y={arcTop - 12} width={44} height={18} rx={9} fill="white" stroke={color} strokeWidth={1} />
      <text x={midX} y={arcTop + 1} textAnchor="middle" fill={color} fontSize={11} fontWeight={800} fontFamily="Nunito, sans-serif">
        {distance} {lang === 'zh' ? '\u6B65' : 'steps'}
      </text>
    </g>
  )
}

// ─── Footprints between 0 and explorer ──────────────────────
function Footprints({ fromX, toX, lineY, count }) {
  if (count <= 0) return null
  const step = (toX - fromX) / count
  return (
    <g opacity={0.35}>
      {Array.from({ length: count }, (_, i) => {
        const x = fromX + (i + 0.5) * step
        return (
          <g key={i} transform={`translate(${x}, ${lineY + 8})`}>
            <ellipse cx={-1.5} cy={0} rx={2} ry={3} fill="#92400E" />
            <ellipse cx={1.5} cy={-1} rx={2} ry={3} fill="#92400E" />
          </g>
        )
      })}
    </g>
  )
}

// ─── Adventure Number Line SVG (with drag) ──────────────────
function AdventureNumberLine({
  range, task, explorerPos, animatedPos, isDragging, isWalking,
  onDragStart, onDragMove, onDragEnd,
  solved, foundPositions, measuredArcs, showArcs, lang,
}) {
  const [min, max] = range
  const W = 380, H = 180
  const pad = 24
  const lineY = 120
  const svgRef = useRef(null)

  const toX = (val) => pad + ((val - min) / (max - min)) * (W - 2 * pad)
  const toVal = (svgX) => {
    const raw = min + ((svgX - pad) / (W - 2 * pad)) * (max - min)
    return Math.round(Math.max(min, Math.min(max, raw)))
  }

  const getSvgX = (e) => {
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    return ((e.clientX - rect.left) / rect.width) * W
  }

  const handlePointerDown = (e) => {
    if (solved) return
    e.currentTarget.setPointerCapture(e.pointerId)
    onDragStart(toVal(getSvgX(e)))
  }

  const handlePointerMove = (e) => {
    if (!isDragging || solved) return
    onDragMove(toVal(getSvgX(e)))
  }

  const handlePointerUp = () => {
    if (!isDragging) return
    onDragEnd()
  }

  const facingRight = animatedPos <= explorerPos
  const liveSteps = Math.abs(Math.round(animatedPos))

  const ticks = []
  for (let v = min; v <= max; v++) ticks.push(v)

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
      style={{
        width: '100%', maxWidth: 420, display: 'block', margin: '0 auto',
        cursor: !solved ? 'grab' : 'default',
        touchAction: 'none',
      }}
      onPointerDown={!solved ? handlePointerDown : undefined}
      onPointerMove={!solved ? handlePointerMove : undefined}
      onPointerUp={!solved ? handlePointerUp : undefined}>

      {/* Sky */}
      <defs>
        <linearGradient id="advSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#E0F7FA" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={lineY + 8} fill="url(#advSky)" />

      {/* Grass */}
      <rect x={0} y={lineY + 8} width={W} height={H - lineY - 8} fill="#86EFAC" />
      <rect x={0} y={lineY + 4} width={W} height={8} fill="#4ADE80" />

      {/* Sun */}
      <circle cx={W - 30} cy={24} r={14} fill="#FBBF24" opacity={0.9} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
        const rad = angle * Math.PI / 180
        return (
          <line key={angle}
            x1={W - 30 + Math.cos(rad) * 18} y1={24 + Math.sin(rad) * 18}
            x2={W - 30 + Math.cos(rad) * 23} y2={24 + Math.sin(rad) * 23}
            stroke="#FBBF24" strokeWidth={2} strokeLinecap="round" opacity={0.6}>
            <animate attributeName="opacity" values="0.6;0.3;0.6" dur="3s" repeatCount="indefinite" begin={`${angle / 360}s`} />
          </line>
        )
      })}

      {/* Clouds */}
      <ellipse cx={60} cy={22} rx={22} ry={9} fill="white" opacity={0.6} />
      <ellipse cx={78} cy={19} rx={14} ry={7} fill="white" opacity={0.4} />
      <ellipse cx={200} cy={30} rx={18} ry={8} fill="white" opacity={0.5} />

      {/* Trees */}
      <g transform={`translate(${pad - 12}, ${lineY - 10})`}>
        <rect x={-2} y={0} width={4} height={14} fill="#92400E" />
        <circle cx={0} cy={-6} r={10} fill="#22C55E" opacity={0.7} />
      </g>
      <g transform={`translate(${W - pad + 12}, ${lineY - 10})`}>
        <rect x={-2} y={0} width={4} height={14} fill="#92400E" />
        <circle cx={0} cy={-6} r={10} fill="#22C55E" opacity={0.7} />
      </g>

      {/* Path / Number line */}
      <line x1={pad} y1={lineY} x2={W - pad} y2={lineY} stroke="#D4A76A" strokeWidth={4} strokeLinecap="round" />
      <line x1={pad} y1={lineY} x2={W - pad} y2={lineY} stroke="#E8C98E" strokeWidth={2} strokeLinecap="round" />

      {/* Target markers */}
      {task.type === 'distance' && !solved && (
        <g>
          <circle cx={toX(task.target)} cy={lineY} r={14} fill="#FF6B6B" opacity={0.15}>
            <animate attributeName="r" values="12;16;12" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={toX(task.target)} cy={lineY - 8} r={6} fill="#FF6B6B" stroke="#fff" strokeWidth={1.5} />
          <text x={toX(task.target)} y={lineY - 20} textAnchor="middle" fill="#FF6B6B" fontSize={13} fontWeight={800}>
            {task.target}
          </text>
        </g>
      )}

      {task.type === 'comparison' && task.positions.map((pos, i) => {
        const measured = measuredArcs && measuredArcs.find(a => a.position === pos)
        return (
          <g key={pos}>
            {!measured && (
              <circle cx={toX(pos)} cy={lineY} r={14} fill={i === 0 ? '#FF6B6B' : '#60A5FA'} opacity={0.12}>
                <animate attributeName="r" values="12;16;12" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={toX(pos)} cy={lineY - 8} r={6}
              fill={i === 0 ? '#FF6B6B' : '#60A5FA'} stroke="#fff" strokeWidth={1.5} />
            <text x={toX(pos)} y={lineY - 20} textAnchor="middle"
              fill={i === 0 ? '#FF6B6B' : '#60A5FA'} fontSize={13} fontWeight={800}>
              {pos}
            </text>
          </g>
        )
      })}

      {/* Tick marks */}
      {ticks.map(v => {
        const x = toX(v)
        const isZero = v === 0
        const isFound = foundPositions && foundPositions.includes(v)
        return (
          <g key={v}>
            {isFound && (
              <circle cx={x} cy={lineY} r={12} fill="#4ECDC4" opacity={0.3}>
                <animate attributeName="r" values="12;15;12" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
            <line x1={x} y1={lineY - (isZero ? 10 : 6)} x2={x} y2={lineY + (isZero ? 10 : 6)}
              stroke={isZero ? '#F59E0B' : '#92400E'} strokeWidth={isZero ? 3 : 1.5} />
            <text x={x} y={lineY + 20} textAnchor="middle"
              fill={isZero ? '#92400E' : '#64748B'}
              fontSize={isZero ? 14 : 11} fontWeight={isZero ? 800 : 600} fontFamily="Nunito, sans-serif">
              {v}
            </text>
            {isZero && (
              <>
                <text x={x} y={lineY - 18} textAnchor="middle" fontSize={16}>{'\uD83C\uDFE0'}</text>
                <text x={x} y={lineY - 32} textAnchor="middle" fill="#92400E" fontSize={9} fontWeight={700} fontFamily="Nunito, sans-serif">
                  HOME
                </text>
              </>
            )}
          </g>
        )
      })}

      {/* Footprints */}
      {explorerPos !== 0 && (
        <Footprints fromX={toX(0)} toX={toX(explorerPos)} lineY={lineY} count={Math.abs(explorerPos)} />
      )}

      {/* Live distance arc while dragging */}
      {isDragging && explorerPos !== 0 && (
        <DistanceArc
          fromX={toX(0)} toX={toX(explorerPos)} lineY={lineY - 30}
          distance={Math.abs(explorerPos)}
          color={explorerPos < 0 ? '#FF6B6B' : '#4ECDC4'}
          lang={lang}
        />
      )}

      {/* Locked measured arcs */}
      {measuredArcs && measuredArcs.map((arc, i) => (
        <DistanceArc key={i} fromX={toX(0)} toX={toX(arc.position)}
          lineY={lineY - 30 - i * 22} distance={arc.distance} color={arc.color} lang={lang} />
      ))}

      {/* Arcs for find_both */}
      {showArcs && showArcs.map((arc, i) => (
        <DistanceArc key={`fb-${i}`} fromX={toX(0)} toX={toX(arc.position)}
          lineY={lineY - 30 - i * 22} distance={arc.distance} color={arc.color} lang={lang} />
      ))}

      {/* Step counter above explorer */}
      {explorerPos !== 0 && (
        <g>
          <rect x={toX(animatedPos) - 20} y={lineY - 78} width={40} height={22} rx={11}
            fill={isDragging ? '#F59E0B' : '#4ECDC4'} opacity={0.95} />
          <text x={toX(animatedPos)} y={lineY - 63} textAnchor="middle" fill="white"
            fontSize={13} fontWeight={800} fontFamily="Nunito, sans-serif">
            {liveSteps}
          </text>
          <polygon points={`${toX(animatedPos) - 5},${lineY - 57} ${toX(animatedPos) + 5},${lineY - 57} ${toX(animatedPos)},${lineY - 52}`}
            fill={isDragging ? '#F59E0B' : '#4ECDC4'} />
        </g>
      )}

      {/* Explorer character */}
      <g transform={`translate(${toX(animatedPos)}, ${lineY - 22})`}>
        <g transform={facingRight ? '' : 'scale(-1,1)'} style={{ transformOrigin: '0px 11px' }}>
          <ellipse cx={0} cy={-14} rx={8} ry={3} fill="#92400E" />
          <rect x={-5} y={-18} width={10} height={5} rx={2} fill="#B45309" />
          <circle cx={0} cy={-6} r={7} fill="#FFD4A8" />
          <circle cx={-2} cy={-7} r={1.2} fill="#1E293B" />
          <circle cx={3} cy={-7} r={1.2} fill="#1E293B" />
          <path d="M -1 -3 Q 1 0 3 -3" fill="none" stroke="#D97706" strokeWidth={0.8} strokeLinecap="round" />
          <rect x={-4} y={1} width={8} height={11} rx={3} fill="#60A5FA" />
          <rect x={-7} y={2} width={4} height={8} rx={2} fill="#F59E0B" stroke="#D97706" strokeWidth={0.5} />
          {isWalking ? (
            <>
              <line x1={-2} y1={12} x2={-5} y2={20} stroke="#374151" strokeWidth={2.5} strokeLinecap="round">
                <animate attributeName="x2" values="-5;1;-5" dur="0.3s" repeatCount="indefinite" />
              </line>
              <line x1={2} y1={12} x2={5} y2={20} stroke="#374151" strokeWidth={2.5} strokeLinecap="round">
                <animate attributeName="x2" values="5;-1;5" dur="0.3s" repeatCount="indefinite" />
              </line>
              <line x1={-4} y1={4} x2={-8} y2={9} stroke="#60A5FA" strokeWidth={2} strokeLinecap="round">
                <animate attributeName="x2" values="-8;-3;-8" dur="0.3s" repeatCount="indefinite" />
              </line>
              <line x1={4} y1={4} x2={8} y2={9} stroke="#60A5FA" strokeWidth={2} strokeLinecap="round">
                <animate attributeName="x2" values="8;3;8" dur="0.3s" repeatCount="indefinite" />
              </line>
            </>
          ) : (
            <>
              <line x1={-2} y1={12} x2={-3} y2={20} stroke="#374151" strokeWidth={2.5} strokeLinecap="round" />
              <line x1={2} y1={12} x2={3} y2={20} stroke="#374151" strokeWidth={2.5} strokeLinecap="round" />
              <line x1={-4} y1={4} x2={-7} y2={9} stroke="#60A5FA" strokeWidth={2} strokeLinecap="round" />
              <line x1={4} y1={4} x2={7} y2={9} stroke="#60A5FA" strokeWidth={2} strokeLinecap="round" />
            </>
          )}
        </g>
      </g>
    </svg>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function AbsoluteAdventure({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [explorerPos, setExplorerPos] = useState(0)
  const { display: animatedPos, isAnimating, reset: resetAnim } = useAnimatedValue(0)
  const [isDragging, setIsDragging] = useState(false)
  const [solved, setSolved] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [foundPositions, setFoundPositions] = useState([])
  const [showArcs, setShowArcs] = useState(null)
  const [measuredArcs, setMeasuredArcs] = useState([])
  const [compPhase, setCompPhase] = useState(0)

  const task = TASKS[taskIndex]

  const buildArc = (pos) => ({
    position: pos,
    distance: Math.abs(pos),
    color: pos < 0 ? '#FF6B6B' : '#4ECDC4',
  })

  // ─── Drag handlers ──────────────────────────────────────
  const handleDragStart = useCallback((val) => {
    setIsDragging(true)
    setExplorerPos(val)
    resetAnim(val)
  }, [resetAnim])

  const handleDragMove = useCallback((val) => {
    setExplorerPos(val)
    resetAnim(val)
  }, [resetAnim])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    const pos = explorerPos

    if (task.type === 'distance') {
      if (pos === task.target) {
        setMeasuredArcs([buildArc(pos)])
        setSolved(true)
        setShowExplanation(true)
      } else {
        setMistakes(m => m + 1)
        setShowHint(true)
        setExplorerPos(0)
        resetAnim(0)
      }
    } else if (task.type === 'comparison') {
      const targetPos = task.positions[compPhase]
      if (pos === targetPos) {
        const newArcs = [...measuredArcs, buildArc(pos)]
        setMeasuredArcs(newArcs)
        if (compPhase === 0) {
          setCompPhase(1)
          setTimeout(() => { setExplorerPos(0); resetAnim(0) }, 600)
        } else {
          setSolved(true)
          setShowExplanation(true)
        }
      } else {
        setMistakes(m => m + 1)
        setShowHint(true)
        setExplorerPos(0)
        resetAnim(0)
      }
    } else if (task.type === 'find_both') {
      if (task.answers.includes(pos) && !foundPositions.includes(pos)) {
        const newFound = [...foundPositions, pos]
        setFoundPositions(newFound)
        setShowArcs(newFound.map(p => buildArc(p)))
        if (newFound.length === task.answers.length) {
          setSolved(true)
          setShowExplanation(true)
        } else {
          setTimeout(() => { setExplorerPos(0); resetAnim(0) }, 500)
        }
      } else if (pos !== 0 && !foundPositions.includes(pos)) {
        setMistakes(m => m + 1)
        setShowHint(true)
        setExplorerPos(0)
        resetAnim(0)
      }
    }
  }, [explorerPos, task, compPhase, measuredArcs, foundPositions, resetAnim])

  // Next task
  const handleNext = useCallback(() => {
    const next = taskIndex + 1
    setTasksCompleted(tc => tc + 1)
    if (next >= TASKS.length) {
      const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
      onComplete({ stars, mistakes })
    } else {
      setTaskIndex(next)
      setExplorerPos(0)
      resetAnim(0)
      setSolved(false)
      setIsDragging(false)
      setShowHint(false)
      setShowExplanation(false)
      setFoundPositions([])
      setShowArcs(null)
      setMeasuredArcs([])
      setCompPhase(0)
    }
  }, [taskIndex, mistakes, onComplete, resetAnim])

  const hints = task.type === 'distance'
    ? [
        lang === 'zh' ? '\u62D6\u52A8\u63A2\u9669\u5BB6\u5230\u76EE\u6807\u4F4D\u7F6E\uFF0C\u770B\u770B\u8D70\u4E86\u591A\u5C11\u6B65\uFF01' : 'Drag the explorer to the target \u2014 count the steps!',
        lang === 'zh' ? '\u8DDD\u79BB\u6C38\u8FDC\u662F\u6B63\u6570\u3002\u4F60\u8D70\u4E86\u51E0\u6B65\uFF1F' : 'Distance is always positive. How many steps?',
      ]
    : task.type === 'comparison'
      ? [
          lang === 'zh' ? `\u5148\u62D6\u5230 ${task.positions[compPhase]}\uFF0C\u91CF\u4E00\u91CF\u8DDD\u79BB\uFF01` : `Drag to ${task.positions[compPhase]} and measure!`,
          lang === 'zh' ? '\u6BD4\u8F83\u4E24\u4E2A\u5F27\u7EBF\u7684\u6B65\u6570\uFF0C\u54EA\u4E2A\u66F4\u591A\uFF1F' : 'Compare the steps in both arcs \u2014 which has more?',
        ]
      : [
          lang === 'zh' ? '\u62D6\u5230\u8DDD\u79BB\u5BB6\u6070\u597D 2 \u6B65\u7684\u4F4D\u7F6E\uFF01\u4E24\u4E2A\u65B9\u5411\u90FD\u8BD5\u8BD5\u3002' : 'Drag to a spot exactly 2 steps from home! Try both directions.',
          lang === 'zh' ? '\u4E00\u4E2A\u6B63\u6570\uFF0C\u4E00\u4E2A\u8D1F\u6570\uFF0C\u4F46\u8DDD\u79BB\u76F8\u540C\u3002' : 'One positive, one negative \u2014 same distance.',
        ]

  const compHint = task.type === 'comparison' && !solved
    ? compPhase === 0
      ? (lang === 'zh' ? `\u{1F449} \u62D6\u5230 ${task.positions[0]}` : `\u{1F449} Drag to ${task.positions[0]}`)
      : (lang === 'zh' ? `\u{1F449} \u73B0\u5728\u62D6\u5230 ${task.positions[1]}` : `\u{1F449} Now drag to ${task.positions[1]}`)
    : null

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>{'\uD83D\uDCCF'}</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '\u7EDD\u5BF9\u503C\u63A2\u9669' : 'Absolute Adventure'}
        </h2>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          {taskIndex + 1} / {TASKS.length}
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
        <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', fontWeight: 600, color: '#1E293B' }}>
          {task.instruction[lang]}
        </div>
        {compHint && (
          <div style={{ marginTop: 8, fontSize: 14, color: '#F59E0B', fontWeight: 700 }}>{compHint}</div>
        )}
        {task.type === 'find_both' && (
          <div style={{ marginTop: 8, fontSize: 14, color: '#64748B' }}>
            {'\uD83C\uDFAF'} {lang === 'zh' ? '\u5DF2\u627E\u5230' : 'Found'}: {foundPositions.length}/{task.answers.length}
          </div>
        )}
      </div>

      <div className="card" style={{ maxWidth: 460, width: '100%', padding: '16px 8px' }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: '#64748B', marginBottom: 8, textAlign: 'center' }}>
          {lang === 'zh' ? '\u{1F449} \u62D6\u52A8\u63A2\u9669\u5BB6\u884C\u8D70' : '\u{1F449} DRAG the explorer to walk'}
        </div>
        <AdventureNumberLine
          range={task.range} task={task}
          explorerPos={explorerPos} animatedPos={animatedPos}
          isDragging={isDragging} isWalking={isAnimating || isDragging}
          onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}
          solved={solved} foundPositions={foundPositions}
          measuredArcs={measuredArcs} showArcs={showArcs} lang={lang}
        />
      </div>

      {showExplanation && (
        <div className="card" style={{
          maxWidth: 400, width: '100%', textAlign: 'center',
          background: '#E0FFF8', border: '2px solid #4ECDC4',
          animation: 'bounce-in 0.4s',
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>{'\uD83C\uDFAF'}</div>
          <p style={{ fontSize: 15, color: '#1E293B', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
            {task.explanation[lang]}
          </p>
          <button className="btn btn-primary" onClick={handleNext} style={{ marginTop: 16 }}>
            {taskIndex < TASKS.length - 1
              ? (lang === 'zh' ? '\u7EE7\u7EED\u63A2\u9669\uFF01 \u2192' : 'Keep exploring! \u2192')
              : (lang === 'zh' ? '\u63A2\u9669\u5B8C\u6210\uFF01' : 'Adventure complete!')}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {TASKS.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < tasksCompleted ? '#4ECDC4' : i === taskIndex ? '#FFE66D' : '#E2E8F0',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      <div style={{ maxWidth: 420, width: '100%', marginTop: 8 }}>
        <ProfessorPi
          message={
            solved ? task.explanation[lang]
              : task.type === 'distance'
                ? (lang === 'zh' ? '\u62D6\u52A8\u63A2\u9669\u5BB6\u5230\u76EE\u6807\u4F4D\u7F6E\uFF0C\u770B\u770B\u8D70\u4E86\u591A\u5C11\u6B65\uFF01' : 'Drag the explorer to the target \u2014 watch the steps count up!')
                : task.type === 'comparison'
                  ? (lang === 'zh' ? '\u5206\u522B\u62D6\u5230\u4E24\u4E2A\u4F4D\u7F6E\uFF0C\u6BD4\u8F83\u6B65\u6570\uFF01' : 'Drag to both positions and compare the steps!')
                  : (lang === 'zh' ? '\u62D6\u5230\u8DDD\u79BB\u5BB6\u6070\u597D 2 \u6B65\u7684\u4F4D\u7F6E\uFF01' : 'Drag to a spot exactly 2 steps from home!')
          }
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
