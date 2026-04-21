import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Smooth animation hook ──────────────────────────────────
function useAnimatedValue(target, duration = 500) {
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
    type: 'position',
    instruction: { en: 'Dive to -2!', zh: '下潜到 -2！' },
    target: -2,
    startPos: 0,
    range: [-5, 5],
    tolerance: 0.3,
    explanation: {
      en: '-2 is 2 units below the surface. Below zero = negative!',
      zh: '-2 在水面以下2格。低于零 = 负数！',
    },
  },
  {
    type: 'position',
    instruction: { en: 'Rise to 3!', zh: '上升到 3！' },
    target: 3,
    startPos: -2,
    range: [-5, 5],
    tolerance: 0.3,
    explanation: {
      en: '3 is above the surface! Positive = above zero, like flying above water!',
      zh: '3 在水面以上！正数 = 在零上面，就像飞出水面！',
    },
  },
  {
    type: 'comparison',
    instruction: { en: 'Which is deeper: -3 or -1?', zh: '哪个更深：-3 还是 -1？' },
    options: [-3, -1],
    answer: -3,
    startPos: 0,
    range: [-5, 5],
    explanation: {
      en: '-3 is deeper than -1. The more negative, the deeper (smaller)!',
      zh: '-3 比 -1 更深。越是负数，越深（越小）！',
    },
  },
  {
    type: 'position',
    instruction: { en: "You're at -2. Dive 3 more. Where are you?", zh: '你在 -2，再下潜 3 格。你在哪里？' },
    target: -5,
    startPos: -2,
    range: [-7, 3],
    tolerance: 0.3,
    explanation: {
      en: '-2 + (-3) = -5. Starting at -2 and going down 3 more!',
      zh: '-2 + (-3) = -5。从 -2 再往下 3 格！',
    },
  },
  {
    type: 'position',
    instruction: { en: "You're at -4. Rise 6. Where are you?", zh: '你在 -4，上升 6 格。你在哪里？' },
    target: 2,
    startPos: -4,
    range: [-6, 4],
    tolerance: 0.3,
    explanation: {
      en: '-4 + 6 = 2. You crossed zero! From underwater back to the sky!',
      zh: '-4 + 6 = 2。你穿过了零！从水下回到了天空！',
    },
  },
]

// ─── Vertical Number Line SVG ────────────────────────────────
function DepthChart({ range, target, playerPos, animatedPos, isAnimating, onTap, solved, task }) {
  const [min, max] = range
  const W = 200, H = 400
  const padTop = 30, padBottom = 30
  const lineX = 100

  const toY = (val) => padTop + ((max - val) / (max - min)) * (H - padTop - padBottom)
  const zeroY = toY(0)
  const goingUp = animatedPos < playerPos

  // Click handler
  const handleClick = (e) => {
    if (solved || task.type === 'comparison') return
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const clickY = ((e.clientY - rect.top) / rect.height) * H
    const val = max - ((clickY - padTop) / (H - padTop - padBottom)) * (max - min)
    const clamped = Math.max(min, Math.min(max, val))
    onTap(Math.round(clamped))
  }

  // Ticks
  const ticks = []
  for (let v = min; v <= max; v++) {
    ticks.push(v)
  }

  const subY = toY(animatedPos)
  const isUnderwater = animatedPos < 0

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 220, display: 'block', margin: '0 auto', cursor: solved ? 'default' : 'pointer' }}
      onClick={handleClick}>

      {/* Sky background */}
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#E0F2FE" />
        </linearGradient>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E6091" />
          <stop offset="100%" stopColor="#0C1B33" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect x={0} y={0} width={W} height={zeroY} fill="url(#skyGrad)" />
      {/* Water */}
      <rect x={0} y={zeroY} width={W} height={H - zeroY} fill="url(#waterGrad)" />

      {/* Clouds */}
      <ellipse cx={40} cy={20} rx={22} ry={10} fill="rgba(255,255,255,0.7)" />
      <ellipse cx={55} cy={18} rx={16} ry={8} fill="rgba(255,255,255,0.5)" />
      <ellipse cx={160} cy={30} rx={18} ry={8} fill="rgba(255,255,255,0.6)" />

      {/* Birds */}
      <path d="M 30 40 Q 34 36 38 40" fill="none" stroke="#64748B" strokeWidth={1} opacity={0.5} />
      <path d="M 36 38 Q 40 34 44 38" fill="none" stroke="#64748B" strokeWidth={1} opacity={0.5} />

      {/* Water surface waves */}
      <path d={`M 0 ${zeroY} Q 25 ${zeroY - 4} 50 ${zeroY} T 100 ${zeroY} T 150 ${zeroY} T 200 ${zeroY}`}
        fill="none" stroke="#60A5FA" strokeWidth={2} opacity={0.6}>
        <animateTransform attributeName="transform" type="translate" values="0,0;-25,0;0,0" dur="3s" repeatCount="indefinite" />
      </path>
      <path d={`M -20 ${zeroY + 2} Q 5 ${zeroY + 6} 30 ${zeroY + 2} T 80 ${zeroY + 2} T 130 ${zeroY + 2} T 180 ${zeroY + 2} T 220 ${zeroY + 2}`}
        fill="none" stroke="#93C5FD" strokeWidth={1.5} opacity={0.4}>
        <animateTransform attributeName="transform" type="translate" values="0,0;20,0;0,0" dur="4s" repeatCount="indefinite" />
      </path>

      {/* Seaweed */}
      <path d={`M 30 ${H - 10} Q 25 ${H - 40} 32 ${H - 60} Q 38 ${H - 80} 28 ${H - 95}`}
        fill="none" stroke="#4ADE80" strokeWidth={3} strokeLinecap="round" opacity={0.7}>
        <animate attributeName="d"
          values={`M 30 ${H - 10} Q 25 ${H - 40} 32 ${H - 60} Q 38 ${H - 80} 28 ${H - 95};M 30 ${H - 10} Q 35 ${H - 40} 28 ${H - 60} Q 22 ${H - 80} 32 ${H - 95};M 30 ${H - 10} Q 25 ${H - 40} 32 ${H - 60} Q 38 ${H - 80} 28 ${H - 95}`}
          dur="4s" repeatCount="indefinite" />
      </path>
      <path d={`M 170 ${H - 10} Q 175 ${H - 35} 168 ${H - 55} Q 162 ${H - 70} 172 ${H - 80}`}
        fill="none" stroke="#86EFAC" strokeWidth={2.5} strokeLinecap="round" opacity={0.6}>
        <animate attributeName="d"
          values={`M 170 ${H - 10} Q 175 ${H - 35} 168 ${H - 55} Q 162 ${H - 70} 172 ${H - 80};M 170 ${H - 10} Q 165 ${H - 35} 172 ${H - 55} Q 178 ${H - 70} 168 ${H - 80};M 170 ${H - 10} Q 175 ${H - 35} 168 ${H - 55} Q 162 ${H - 70} 172 ${H - 80}`}
          dur="5s" repeatCount="indefinite" />
      </path>

      {/* Fish */}
      <g opacity={0.6}>
        <ellipse cx={155} cy={toY(-2) + 5} rx={8} ry={4} fill="#FB923C" />
        <polygon points={`${155 + 8},${toY(-2) + 5} ${155 + 14},${toY(-2) + 1} ${155 + 14},${toY(-2) + 9}`} fill="#FB923C" />
        <circle cx={152} cy={toY(-2) + 4} r={1} fill="#1E293B" />
        <animateTransform attributeName="transform" type="translate" values="0,0;-15,3;0,0" dur="6s" repeatCount="indefinite" />
      </g>
      <g opacity={0.5}>
        <ellipse cx={45} cy={toY(-4) - 5} rx={6} ry={3} fill="#F472B6" />
        <polygon points={`${45 - 6},${toY(-4) - 5} ${45 - 11},${toY(-4) - 8} ${45 - 11},${toY(-4) - 2}`} fill="#F472B6" />
        <circle cx={47} cy={toY(-4) - 6} r={0.8} fill="#1E293B" />
        <animateTransform attributeName="transform" type="translate" values="0,0;12,-2;0,0" dur="7s" repeatCount="indefinite" />
      </g>

      {/* Vertical number line */}
      <line x1={lineX} y1={padTop} x2={lineX} y2={H - padBottom} stroke="rgba(255,255,255,0.3)" strokeWidth={2} />

      {/* Tick marks with labels */}
      {ticks.map(v => {
        const y = toY(v)
        const isZero = v === 0
        return (
          <g key={v}>
            <line x1={lineX - (isZero ? 14 : 8)} y1={y} x2={lineX + (isZero ? 14 : 8)} y2={y}
              stroke={isZero ? '#FFE66D' : 'rgba(255,255,255,0.5)'} strokeWidth={isZero ? 3 : 1.5} />
            <text x={lineX - 22} y={y + 4} textAnchor="end"
              fill={isZero ? '#FFE66D' : (v < 0 ? '#93C5FD' : '#FDE68A')}
              fontSize={isZero ? 16 : 13} fontWeight={isZero ? 800 : 600} fontFamily="Nunito, sans-serif">
              {v}
            </text>
          </g>
        )
      })}

      {/* Zero label */}
      <text x={lineX + 20} y={zeroY + 4} fill="#FFE66D" fontSize={10} fontWeight={700} fontFamily="Nunito, sans-serif" opacity={0.8}>
        SEA LEVEL
      </text>

      {/* Comparison markers */}
      {task.type === 'comparison' && task.options.map((val, i) => (
        <g key={i}>
          <line x1={lineX - 20} y1={toY(val)} x2={lineX + 20} y2={toY(val)}
            stroke="#FF6B6B" strokeWidth={2} strokeDasharray="4,3" opacity={0.8} />
          <text x={lineX + 28} y={toY(val) + 4} fill="#FF6B6B" fontSize={14} fontWeight={800} fontFamily="Nunito, sans-serif">
            {val}
          </text>
        </g>
      ))}

      {/* Target flag when solved */}
      {solved && task.type === 'position' && (
        <g>
          <line x1={lineX + 12} y1={toY(target)} x2={lineX + 12} y2={toY(target) - 20} stroke="#4ECDC4" strokeWidth={2} />
          <rect x={lineX + 12} y={toY(target) - 20} width={24} height={14} rx={3} fill="#4ECDC4" />
          <text x={lineX + 24} y={toY(target) - 10} textAnchor="middle" fill="#fff" fontSize={9} fontWeight={700}>
            {target}
          </text>
        </g>
      )}

      {/* Bubbles when moving underwater */}
      {isAnimating && isUnderwater && (
        <g>
          {[0, 1, 2, 3].map(i => (
            <circle key={i} cx={lineX + (i % 2 === 0 ? -8 : 8) + (i * 3 - 4)} cy={subY - 15 - i * 8} r={2 + i * 0.5}
              fill="rgba(147,197,253,0.5)" stroke="rgba(255,255,255,0.3)" strokeWidth={0.5}>
              <animate attributeName="cy" values={`${subY - 15 - i * 8};${subY - 40 - i * 8}`} dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0" dur="1s" repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      )}

      {/* Submarine */}
      <g transform={`translate(${lineX}, ${subY})`}>
        <g transform={goingUp && isAnimating ? 'rotate(-15)' : (!goingUp && isAnimating ? 'rotate(15)' : '')}>
          {/* Body */}
          <ellipse cx={0} cy={0} rx={22} ry={10} fill="#FFE66D" stroke="#F59E0B" strokeWidth={1.5} />
          {/* Conning tower */}
          <rect x={-5} y={-16} width={10} height={8} rx={3} fill="#FCD34D" stroke="#F59E0B" strokeWidth={1} />
          {/* Periscope */}
          <line x1={0} y1={-16} x2={0} y2={-22} stroke="#92400E" strokeWidth={2} strokeLinecap="round" />
          <line x1={0} y1={-22} x2={5} y2={-22} stroke="#92400E" strokeWidth={2} strokeLinecap="round" />
          <circle cx={5} cy={-22} r={2} fill="#60A5FA" stroke="#92400E" strokeWidth={1} />
          {/* Porthole */}
          <circle cx={-6} cy={0} r={4} fill="#87CEEB" stroke="#92400E" strokeWidth={1} />
          <circle cx={-6} cy={0} r={2.5} fill="#BFDBFE" />
          <circle cx={6} cy={0} r={3} fill="#87CEEB" stroke="#92400E" strokeWidth={1} />
          <circle cx={6} cy={0} r={1.8} fill="#BFDBFE" />
          {/* Propeller */}
          <g transform="translate(22, 0)">
            {isAnimating ? (
              <>
                <line x1={0} y1={-5} x2={4} y2={-5} stroke="#92400E" strokeWidth={2} strokeLinecap="round">
                  <animate attributeName="y1" values="-5;-3;-5" dur="0.2s" repeatCount="indefinite" />
                  <animate attributeName="y2" values="-5;-3;-5" dur="0.2s" repeatCount="indefinite" />
                </line>
                <line x1={0} y1={5} x2={4} y2={5} stroke="#92400E" strokeWidth={2} strokeLinecap="round">
                  <animate attributeName="y1" values="5;3;5" dur="0.2s" repeatCount="indefinite" />
                  <animate attributeName="y2" values="5;3;5" dur="0.2s" repeatCount="indefinite" />
                </line>
              </>
            ) : (
              <>
                <line x1={0} y1={-5} x2={4} y2={-5} stroke="#92400E" strokeWidth={2} strokeLinecap="round" />
                <line x1={0} y1={5} x2={4} y2={5} stroke="#92400E" strokeWidth={2} strokeLinecap="round" />
              </>
            )}
          </g>
        </g>
      </g>

      {/* Position indicator */}
      <text x={lineX} y={subY + 22} textAnchor="middle" fill="#fff" fontSize={14} fontWeight={800}
        fontFamily="Nunito, sans-serif" stroke="#0C1B33" strokeWidth={3} paintOrder="stroke">
        {isAnimating ? animatedPos.toFixed(1) : playerPos}
      </text>
    </svg>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function NegativePlunge({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [playerPos, setPlayerPos] = useState(TASKS[0].startPos)
  const { display: animatedPos, isAnimating, reset: resetAnim } = useAnimatedValue(playerPos)
  const [solved, setSolved] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [chosenOption, setChosenOption] = useState(null)

  const task = TASKS[taskIndex]

  // Handle tap on depth chart (position tasks)
  const handleTap = useCallback((val) => {
    setPlayerPos(val)
    if (Math.abs(val - task.target) <= task.tolerance) {
      setSolved(true)
      setShowExplanation(true)
    }
  }, [task])

  // Handle comparison choice
  const handleChoice = useCallback((val) => {
    setChosenOption(val)
    if (val === task.answer) {
      setPlayerPos(val)
      setSolved(true)
      setShowExplanation(true)
    } else {
      setMistakes(m => m + 1)
      setShowHint(true)
    }
  }, [task])

  // Confirm wrong attempt (position tasks)
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
      setPlayerPos(TASKS[next].startPos)
      resetAnim(TASKS[next].startPos)
      setSolved(false)
      setShowHint(false)
      setShowExplanation(false)
      setChosenOption(null)
    }
  }, [taskIndex, mistakes, onComplete, resetAnim])

  const hints = task.type === 'comparison'
    ? [
        lang === 'zh'
          ? '想一想：哪个数字离零更远？更远 = 更深！'
          : 'Think: which number is farther from zero? Farther = deeper!',
        lang === 'zh'
          ? '在数轴上，越往下数字越小。-3 在 -1 的下面。'
          : 'On the number line, going down means smaller numbers. -3 is below -1.',
      ]
    : [
        lang === 'zh'
          ? `目标是 ${task.target}。它在水面的${task.target < 0 ? '下' : '上'}方！`
          : `Target is ${task.target}. It's ${task.target < 0 ? 'below' : 'above'} the surface!`,
        lang === 'zh'
          ? `从零开始数 ${Math.abs(task.target)} 格${task.target < 0 ? '往下' : '往上'}。`
          : `Count ${Math.abs(task.target)} marks ${task.target < 0 ? 'down from' : 'up from'} zero.`,
      ]

  const hasMovedFromStart = playerPos !== task.startPos

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>🤿</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '负数深潜' : 'Negative Plunge'}
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
      </div>

      {/* Depth Chart */}
      <div className="card" style={{ maxWidth: 280, width: '100%', padding: '12px 8px' }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: '#64748B', marginBottom: 8, textAlign: 'center' }}>
          {task.type === 'comparison'
            ? (lang === 'zh' ? '👀 观察深度图' : '👀 Look at the depth chart')
            : (lang === 'zh' ? '👆 点击深度图移动潜水艇' : '👆 TAP the depth chart to move')}
        </div>
        <DepthChart
          range={task.range}
          target={task.target}
          playerPos={playerPos}
          animatedPos={animatedPos}
          isAnimating={isAnimating}
          onTap={handleTap}
          solved={solved}
          task={task}
        />
      </div>

      {/* Comparison buttons */}
      {task.type === 'comparison' && !solved && (
        <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
          {task.options.map(val => (
            <button key={val} className="btn"
              onClick={() => handleChoice(val)}
              style={{
                padding: '12px 28px', fontSize: 20, fontWeight: 800,
                background: chosenOption === val && val !== task.answer ? '#FEE2E2' : '#fff',
                border: `2px solid ${chosenOption === val && val !== task.answer ? '#EF4444' : '#CBD5E1'}`,
                color: '#1E293B',
              }}>
              {val}
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
              ? (lang === 'zh' ? '继续下潜！ →' : 'Keep diving! →')
              : (lang === 'zh' ? '浮出水面！' : 'Surface!')}
          </button>
        </div>
      )}

      {/* Confirm button (position tasks, not solved, has moved) */}
      {!solved && task.type === 'position' && hasMovedFromStart && (
        <button className="btn btn-warning" onClick={handleConfirm}>
          {lang === 'zh' ? '确认深度' : 'Lock Depth'} 📍
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
              : task.type === 'comparison'
                ? (lang === 'zh' ? '哪个位置更深？记住：越是负数越深！' : 'Which position is deeper? Remember: more negative = deeper!')
                : (lang === 'zh' ? '点击深度图移动潜水艇！注意看水面零点的位置。' : 'Tap the depth chart to move the submarine! Watch the zero at sea level.')
          }
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
