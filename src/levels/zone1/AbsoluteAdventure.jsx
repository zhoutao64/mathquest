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
    instruction: { en: 'How far is 4 from home?', zh: '4 离家有多远？' },
    position: 4,
    answer: 4,
    range: [-6, 6],
    explanation: {
      en: '|4| = 4. It\'s 4 steps from zero — distance is always positive!',
      zh: '|4| = 4。离零有 4 步——距离永远是正数！',
    },
  },
  {
    type: 'distance',
    instruction: { en: 'How far is -3 from home?', zh: '-3 离家有多远？' },
    position: -3,
    answer: 3,
    range: [-6, 6],
    explanation: {
      en: '|-3| = 3. Even though -3 is negative, the distance is 3!',
      zh: '|-3| = 3。虽然 -3 是负数，但距离是 3！',
    },
  },
  {
    type: 'comparison',
    instruction: { en: 'Who is farther from home: -5 or 3?', zh: '谁离家更远：-5 还是 3？' },
    positions: [-5, 3],
    answer: -5,
    range: [-6, 6],
    explanation: {
      en: '|-5| = 5 and |3| = 3. -5 is farther! More negative doesn\'t mean closer — it means MORE steps!',
      zh: '|-5| = 5，|3| = 3。-5 更远！更大的负数不代表更近——而是步数更多！',
    },
  },
  {
    type: 'find_both',
    instruction: { en: 'Find ALL numbers that are exactly 2 away from home!', zh: '找出所有距离家恰好 2 步的数字！' },
    targetDistance: 2,
    answers: [2, -2],
    range: [-6, 6],
    explanation: {
      en: 'Both 2 and -2 are exactly 2 steps from zero! |2| = |-2| = 2. Two answers!',
      zh: '2 和 -2 都距离零恰好 2 步！|2| = |-2| = 2。两个答案！',
    },
  },
  {
    type: 'comparison',
    instruction: { en: 'Who is closer to home: -4 or 2?', zh: '谁离家更近：-4 还是 2？' },
    positions: [-4, 2],
    answer: 2,
    isCloser: true,
    range: [-6, 6],
    explanation: {
      en: '|-4| = 4 and |2| = 2. 2 is closer! Smaller absolute value = closer to home.',
      zh: '|-4| = 4，|2| = 2。2 更近！绝对值越小 = 离家越近。',
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
        {distance} {lang === 'zh' ? '步' : 'steps'}
      </text>
    </g>
  )
}

// ─── Adventure Number Line SVG ───────────────────────────────
function AdventureNumberLine({ range, task, explorerPos, animatedPos, isWalking, onTap, solved, foundPositions, showArcs, lang }) {
  const [min, max] = range
  const W = 380, H = 180
  const pad = 24
  const lineY = 120

  const toX = (val) => pad + ((val - min) / (max - min)) * (W - 2 * pad)
  const facingRight = animatedPos <= explorerPos

  const handleClick = (e) => {
    if (solved) return
    if (task.type !== 'find_both') return
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const clickX = ((e.clientX - rect.left) / rect.width) * W
    const val = min + ((clickX - pad) / (W - 2 * pad)) * (max - min)
    const clamped = Math.max(min, Math.min(max, val))
    const snapped = Math.round(clamped)
    onTap(snapped)
  }

  const ticks = []
  for (let v = min; v <= max; v++) ticks.push(v)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 420, display: 'block', margin: '0 auto', cursor: task.type === 'find_both' && !solved ? 'pointer' : 'default' }}
      onClick={handleClick}>

      {/* Sky */}
      <defs>
        <linearGradient id="advSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#E0F7FA" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={lineY + 8} fill="url(#advSky)" />

      {/* Grass */}
      <rect x={0} y={lineY + 8} width={W} height={H - lineY - 8} fill="#86EFAC" rx={0} />
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

      {/* Tick marks */}
      {ticks.map(v => {
        const x = toX(v)
        const isZero = v === 0
        const isFound = foundPositions && foundPositions.includes(v)
        return (
          <g key={v}>
            {/* Found highlight */}
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
            {/* Home marker */}
            {isZero && (
              <>
                <text x={x} y={lineY - 18} textAnchor="middle" fontSize={16}>🏠</text>
                <text x={x} y={lineY - 32} textAnchor="middle" fill="#92400E" fontSize={9} fontWeight={700} fontFamily="Nunito, sans-serif">
                  HOME
                </text>
              </>
            )}
            {/* Tappable area for find_both */}
            {task.type === 'find_both' && !solved && v !== 0 && (
              <circle cx={x} cy={lineY} r={14} fill="transparent" cursor="pointer" />
            )}
          </g>
        )
      })}

      {/* Position markers for distance/comparison tasks */}
      {task.type === 'distance' && (
        <g>
          <circle cx={toX(task.position)} cy={lineY - 8} r={6} fill="#FF6B6B" stroke="#fff" strokeWidth={1.5} />
          <text x={toX(task.position)} y={lineY - 20} textAnchor="middle" fill="#FF6B6B" fontSize={13} fontWeight={800}>
            {task.position}
          </text>
        </g>
      )}

      {task.type === 'comparison' && task.positions.map((pos, i) => (
        <g key={pos}>
          <circle cx={toX(pos)} cy={lineY - 8} r={6}
            fill={i === 0 ? '#FF6B6B' : '#60A5FA'} stroke="#fff" strokeWidth={1.5} />
          <text x={toX(pos)} y={lineY - 20} textAnchor="middle"
            fill={i === 0 ? '#FF6B6B' : '#60A5FA'} fontSize={13} fontWeight={800}>
            {pos}
          </text>
        </g>
      ))}

      {/* Distance arcs */}
      {showArcs && showArcs.map((arc, i) => (
        <DistanceArc key={i} fromX={toX(0)} toX={toX(arc.position)}
          lineY={lineY - 30} distance={arc.distance} color={arc.color} lang={lang} />
      ))}

      {/* Explorer character */}
      <g transform={`translate(${toX(animatedPos)}, ${lineY - 22})`}>
        <g transform={facingRight ? '' : 'scale(-1,1)'} style={{ transformOrigin: '0px 11px' }}>
          {/* Hat */}
          <ellipse cx={0} cy={-14} rx={8} ry={3} fill="#92400E" />
          <rect x={-5} y={-18} width={10} height={5} rx={2} fill="#B45309" />
          {/* Head */}
          <circle cx={0} cy={-6} r={7} fill="#FFD4A8" />
          <circle cx={-2} cy={-7} r={1.2} fill="#1E293B" />
          <circle cx={3} cy={-7} r={1.2} fill="#1E293B" />
          <path d="M -1 -3 Q 1 0 3 -3" fill="none" stroke="#D97706" strokeWidth={0.8} strokeLinecap="round" />
          {/* Body */}
          <rect x={-4} y={1} width={8} height={11} rx={3} fill="#60A5FA" />
          {/* Backpack */}
          <rect x={-7} y={2} width={4} height={8} rx={2} fill="#F59E0B" stroke="#D97706" strokeWidth={0.5} />
          {/* Legs */}
          {isWalking ? (
            <>
              <line x1={-2} y1={12} x2={-5} y2={20} stroke="#374151" strokeWidth={2.5} strokeLinecap="round">
                <animate attributeName="x2" values="-5;1;-5" dur="0.3s" repeatCount="indefinite" />
              </line>
              <line x1={2} y1={12} x2={5} y2={20} stroke="#374151" strokeWidth={2.5} strokeLinecap="round">
                <animate attributeName="x2" values="5;-1;5" dur="0.3s" repeatCount="indefinite" />
              </line>
            </>
          ) : (
            <>
              <line x1={-2} y1={12} x2={-3} y2={20} stroke="#374151" strokeWidth={2.5} strokeLinecap="round" />
              <line x1={2} y1={12} x2={3} y2={20} stroke="#374151" strokeWidth={2.5} strokeLinecap="round" />
            </>
          )}
          {/* Arms */}
          {isWalking ? (
            <>
              <line x1={-4} y1={4} x2={-8} y2={9} stroke="#60A5FA" strokeWidth={2} strokeLinecap="round">
                <animate attributeName="x2" values="-8;-3;-8" dur="0.3s" repeatCount="indefinite" />
              </line>
              <line x1={4} y1={4} x2={8} y2={9} stroke="#60A5FA" strokeWidth={2} strokeLinecap="round">
                <animate attributeName="x2" values="8;3;8" dur="0.3s" repeatCount="indefinite" />
              </line>
            </>
          ) : (
            <>
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
  const [solved, setSolved] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [selectedDistance, setSelectedDistance] = useState(null)
  const [chosenOption, setChosenOption] = useState(null)
  const [foundPositions, setFoundPositions] = useState([])
  const [showArcs, setShowArcs] = useState(null)

  const task = TASKS[taskIndex]

  // Build arcs for display
  const buildArc = (pos) => ({
    position: pos,
    distance: Math.abs(pos),
    color: pos < 0 ? '#FF6B6B' : '#4ECDC4',
  })

  // Distance task: select how far
  const handleDistanceChoice = useCallback((val) => {
    setSelectedDistance(val)
    setExplorerPos(task.position)
    setShowArcs([buildArc(task.position)])

    if (val === task.answer) {
      setSolved(true)
      setShowExplanation(true)
    } else {
      setMistakes(m => m + 1)
      setShowHint(true)
    }
  }, [task])

  // Comparison task: pick farther/closer
  const handleComparisonChoice = useCallback((val) => {
    setChosenOption(val)
    setExplorerPos(val)
    setShowArcs(task.positions.map(p => buildArc(p)))

    if (val === task.answer) {
      setSolved(true)
      setShowExplanation(true)
    } else {
      setMistakes(m => m + 1)
      setShowHint(true)
    }
  }, [task])

  // Find-both task: tap number line positions
  const handleNumberTap = useCallback((val) => {
    if (task.answers.includes(val) && !foundPositions.includes(val)) {
      const newFound = [...foundPositions, val]
      setFoundPositions(newFound)
      setExplorerPos(val)
      setShowArcs(newFound.map(p => buildArc(p)))

      if (newFound.length === task.answers.length) {
        setSolved(true)
        setShowExplanation(true)
      }
    } else if (!task.answers.includes(val)) {
      setMistakes(m => m + 1)
      setShowHint(true)
    }
  }, [task, foundPositions])

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
      setShowHint(false)
      setShowExplanation(false)
      setSelectedDistance(null)
      setChosenOption(null)
      setFoundPositions([])
      setShowArcs(null)
    }
  }, [taskIndex, mistakes, onComplete, resetAnim])

  // Hints
  const hints = task.type === 'distance'
    ? [
        lang === 'zh' ? '从零数到那个数字，忽略负号！' : 'Count the steps from 0 — ignore the minus sign!',
        lang === 'zh' ? '距离永远是正数。你走了几步？' : 'Distance is always positive. How many steps?',
      ]
    : task.type === 'comparison'
      ? [
          lang === 'zh' ? '分别从零数到每个数字的步数。' : 'Count steps from 0 to each number separately.',
          lang === 'zh' ? '忽略正负号，哪个数字步数更多？' : 'Ignore the signs — which has more steps from zero?',
        ]
      : [
          lang === 'zh' ? '想想从零出发的两个方向！' : 'Think about BOTH directions from zero!',
          lang === 'zh' ? '一个正数，一个负数，但距离相同。' : 'One positive, one negative — same distance.',
        ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>📏</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '绝对值探险' : 'Absolute Adventure'}
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
        {task.type === 'find_both' && (
          <div style={{ marginTop: 8, fontSize: 14, color: '#64748B' }}>
            🎯 {lang === 'zh' ? '已找到' : 'Found'}: {foundPositions.length}/{task.answers.length}
          </div>
        )}
      </div>

      {/* Number Line */}
      <div className="card" style={{ maxWidth: 460, width: '100%', padding: '16px 8px' }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: '#64748B', marginBottom: 8, textAlign: 'center' }}>
          {task.type === 'find_both'
            ? (lang === 'zh' ? '👆 点击数轴上的数字' : '👆 TAP numbers on the line')
            : (lang === 'zh' ? '👀 观察数轴' : '👀 Look at the number line')
          }
        </div>
        <AdventureNumberLine
          range={task.range}
          task={task}
          explorerPos={explorerPos}
          animatedPos={animatedPos}
          isWalking={isAnimating}
          onTap={handleNumberTap}
          solved={solved}
          foundPositions={foundPositions}
          showArcs={showArcs}
          lang={lang}
        />
      </div>

      {/* Distance buttons */}
      {task.type === 'distance' && !solved && (
        <div>
          <div style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 8 }}>
            {lang === 'zh' ? '选择距离：' : 'Pick the distance:'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5, 6].map(val => (
              <button key={val} className="btn"
                onClick={() => handleDistanceChoice(val)}
                style={{
                  padding: '10px 18px', fontSize: 18, fontWeight: 800, minWidth: 48,
                  background: selectedDistance === val && val !== task.answer ? '#FEE2E2' : '#fff',
                  border: `2px solid ${selectedDistance === val && val !== task.answer ? '#EF4444' : '#CBD5E1'}`,
                  color: '#1E293B',
                }}>
                {val}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comparison buttons */}
      {task.type === 'comparison' && !solved && (
        <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
          {task.positions.map((pos, i) => (
            <button key={pos} className="btn"
              onClick={() => handleComparisonChoice(pos)}
              style={{
                padding: '12px 28px', fontSize: 20, fontWeight: 800,
                background: chosenOption === pos && pos !== task.answer ? '#FEE2E2' : '#fff',
                border: `2px solid ${chosenOption === pos && pos !== task.answer ? '#EF4444' : (i === 0 ? '#FF6B6B' : '#60A5FA')}`,
                color: '#1E293B',
              }}>
              {pos}
            </button>
          ))}
        </div>
      )}

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
              ? (lang === 'zh' ? '继续探险！ →' : 'Keep exploring! →')
              : (lang === 'zh' ? '探险完成！' : 'Adventure complete!')
            }
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
              : task.type === 'distance'
                ? (lang === 'zh' ? '从零（家）到那个数字有多少步？不管方向！' : 'How many steps from zero (home) to that number? Direction doesn\'t matter!')
                : task.type === 'comparison'
                  ? (lang === 'zh' ? '分别量一下到零的距离，再比较！' : 'Measure the distance from each to zero, then compare!')
                  : (lang === 'zh' ? '点击数轴上所有正确的位置！零的两边都看看。' : 'Tap all correct positions! Look on both sides of zero.')
          }
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
