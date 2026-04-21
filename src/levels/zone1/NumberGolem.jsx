import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Phase 1: Shield Break Data ─────────────────────────────
const SHIELD_PIECES = [
  { angle: 0, span: 90, fraction: '1/4', value: 0.25 },
  { angle: 90, span: 90, fraction: '1/4', value: 0.25 },
  { angle: 180, span: 90, fraction: '1/4', value: 0.25 },
  { angle: 270, span: 90, fraction: '1/4', value: 0.25 },
]
const MISSING_INDICES = [1, 3] // which pieces are missing
const TOOLKIT_PIECES = [
  { fraction: '1/4', value: 0.25, correct: true },
  { fraction: '1/3', value: 0.333, correct: false },
  { fraction: '1/4', value: 0.25, correct: true },
  { fraction: '1/6', value: 0.167, correct: false },
]

// ─── Phase 2: Number Barrage Data ───────────────────────────
const BARRAGE_NUMBERS = [
  { display: '-2', value: -2 },
  { display: '1/2', value: 0.5 },
  { display: '-1.5', value: -1.5 },
  { display: '3/4', value: 0.75 },
  { display: '√4', value: 2 },
]

// ─── Phase 3: Power Core Data ───────────────────────────────
const POWER_CHALLENGES = [
  { expression: { en: '2^? = 8', zh: '2^? = 8' }, answer: 3, min: 1, max: 6, base: 2 },
  { expression: { en: '√? = 3', zh: '√? = 3' }, answer: 9, min: 1, max: 16, base: null },
  { expression: { en: '?² = 25', zh: '?² = 25' }, answer: 5, min: 1, max: 8, base: null },
]

// ─── Golem Avatar ───────────────────────────────────────────
function GolemAvatar({ emotion, x, y, size }) {
  const eyeColor = emotion === 'friendly' ? '#4ADE80' : emotion === 'angry' ? '#EF4444' : '#3B82F6'
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Body */}
      <rect x={-size / 2} y={-size / 2} width={size} height={size} rx={size * 0.15}
        fill="#64748B" stroke="#475569" strokeWidth={2} />
      {/* Face cracks */}
      <line x1={-size * 0.3} y1={-size * 0.1} x2={-size * 0.1} y2={size * 0.1} stroke="#94A3B8" strokeWidth={1.5} />
      <line x1={size * 0.1} y1={-size * 0.2} x2={size * 0.3} y2={0} stroke="#94A3B8" strokeWidth={1.5} />
      {/* Eyes */}
      <circle cx={-size * 0.18} cy={-size * 0.1} r={size * 0.08} fill={eyeColor}>
        <animate attributeName="r" values={`${size * 0.07};${size * 0.09};${size * 0.07}`} dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={size * 0.18} cy={-size * 0.1} r={size * 0.08} fill={eyeColor}>
        <animate attributeName="r" values={`${size * 0.07};${size * 0.09};${size * 0.07}`} dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Mouth */}
      {emotion === 'angry' ? (
        <line x1={-size * 0.15} y1={size * 0.15} x2={size * 0.15} y2={size * 0.15} stroke={eyeColor} strokeWidth={2} strokeLinecap="round" />
      ) : (
        <path d={`M ${-size * 0.12} ${size * 0.12} Q 0 ${size * 0.22} ${size * 0.12} ${size * 0.12}`}
          fill="none" stroke={eyeColor} strokeWidth={2} strokeLinecap="round" />
      )}
    </g>
  )
}

// ─── HP Bar ─────────────────────────────────────────────────
function HPBar({ phase, maxPhase, x, y, width }) {
  const segW = width / maxPhase
  return (
    <g>
      <text x={x} y={y - 6} fill="#64748B" fontSize={10} fontWeight={700}>HP</text>
      {Array.from({ length: maxPhase }, (_, i) => (
        <rect key={i} x={x + i * segW + 1} y={y} width={segW - 2} height={14} rx={3}
          fill={i >= phase ? '#4ADE80' : '#E2E8F0'}
          stroke={i >= phase ? '#16A34A' : '#CBD5E1'} strokeWidth={1} />
      ))}
    </g>
  )
}

// ─── Arc Path Helper ────────────────────────────────────────
function arcPath(cx, cy, r, startAngle, endAngle) {
  const toRad = (deg) => (deg - 90) * Math.PI / 180
  const x1 = cx + r * Math.cos(toRad(startAngle))
  const y1 = cy + r * Math.sin(toRad(startAngle))
  const x2 = cx + r * Math.cos(toRad(endAngle))
  const y2 = cy + r * Math.sin(toRad(endAngle))
  const large = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
}

// ─── Phase 1: Shield Break ──────────────────────────────────
function ShieldBreakPhase({ svgRef, onComplete, mistakes, setMistakes, lang }) {
  const W = 400, H = 300
  const shieldCX = W / 2, shieldCY = 100, shieldR = 65
  const [filled, setFilled] = useState(new Set())
  const [dragPiece, setDragPiece] = useState(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [wrongFlash, setWrongFlash] = useState(null)
  const dragging = useRef(false)
  const pieceIdx = useRef(null)

  const getSvgPos = useCallback((e) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    return pt.matrixTransform(svg.getScreenCTM().inverse())
  }, [svgRef])

  const handlePieceDown = useCallback((e, idx) => {
    e.preventDefault()
    e.target.setPointerCapture(e.pointerId)
    dragging.current = true
    pieceIdx.current = idx
    const pos = getSvgPos(e)
    setDragPiece(idx)
    setDragPos(pos)
  }, [getSvgPos])

  const handlePieceMove = useCallback((e) => {
    if (!dragging.current) return
    e.preventDefault()
    setDragPos(getSvgPos(e))
  }, [getSvgPos])

  const handlePieceUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    const idx = pieceIdx.current
    const piece = TOOLKIT_PIECES[idx]

    // Check if dropped near a missing slot
    const dx = dragPos.x - shieldCX
    const dy = dragPos.y - shieldCY
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < shieldR + 20 && piece.correct) {
      // Find which missing slot to fill
      const unfilled = MISSING_INDICES.filter(i => !filled.has(i))
      if (unfilled.length > 0) {
        const newFilled = new Set(filled)
        newFilled.add(unfilled[0])
        setFilled(newFilled)
        if (newFilled.size === MISSING_INDICES.length) {
          setTimeout(() => onComplete(), 600)
        }
      }
    } else if (dist < shieldR + 20 && !piece.correct) {
      setMistakes(m => m + 1)
      setWrongFlash(idx)
      setTimeout(() => setWrongFlash(null), 500)
    }
    setDragPiece(null)
  }, [dragPos, filled, onComplete, setMistakes])

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', maxWidth: 440, display: 'block', margin: '0 auto', touchAction: 'none' }}>
      <rect x={0} y={0} width={W} height={H} fill="#1E1B4B" rx={8} />

      {/* Golem */}
      <GolemAvatar emotion="angry" x={shieldCX} y={36} size={40} />

      {/* Shield */}
      {SHIELD_PIECES.map((piece, i) => {
        const isMissing = MISSING_INDICES.includes(i) && !filled.has(i)
        return (
          <path key={i}
            d={arcPath(shieldCX, shieldCY, shieldR, piece.angle, piece.angle + piece.span)}
            fill={isMissing ? 'rgba(255,255,255,0.05)' : '#6366F1'}
            stroke={isMissing ? '#EF4444' : '#818CF8'}
            strokeWidth={isMissing ? 2 : 1}
            strokeDasharray={isMissing ? '6,3' : '0'}
          />
        )
      })}
      {/* Shield center */}
      <circle cx={shieldCX} cy={shieldCY} r={15} fill="#4F46E5" stroke="#818CF8" strokeWidth={1.5} />
      <text x={shieldCX} y={shieldCY + 4} textAnchor="middle" fill="white" fontSize={10} fontWeight={800}>
        {filled.size}/{MISSING_INDICES.length}
      </text>

      {/* Phase label */}
      <text x={W / 2} y={188} textAnchor="middle" fill="#A5B4FC" fontSize={12} fontWeight={700}>
        {lang === 'zh' ? '拖动分数碎片修补盾牌！' : 'Drag fraction pieces to repair the shield!'}
      </text>

      {/* Toolkit tray */}
      <rect x={40} y={200} width={W - 80} height={60} rx={8} fill="rgba(255,255,255,0.08)" stroke="#4F46E5" strokeWidth={1} />
      {TOOLKIT_PIECES.map((piece, i) => {
        const px = 80 + i * 70
        const py = 230
        const isBeingDragged = dragPiece === i
        const isFlashing = wrongFlash === i
        return (
          <g key={i} transform={isBeingDragged ? `translate(${dragPos.x - px}, ${dragPos.y - py})` : ''}
            style={{ cursor: 'grab', touchAction: 'none' }}
            onPointerDown={(e) => handlePieceDown(e, i)}
            onPointerMove={handlePieceMove}
            onPointerUp={handlePieceUp}>
            <circle cx={px} cy={py} r={24}
              fill={isFlashing ? '#FCA5A5' : '#6366F1'} stroke={isFlashing ? '#EF4444' : '#A5B4FC'} strokeWidth={2}>
              {isFlashing && <animate attributeName="r" values="24;28;24" dur="0.3s" repeatCount="1" />}
            </circle>
            <text x={px} y={py + 5} textAnchor="middle" fill="white" fontSize={13} fontWeight={800}>
              {piece.fraction}
            </text>
          </g>
        )
      })}

      <HPBar phase={0} maxPhase={3} x={10} y={H - 22} width={120} />
    </svg>
  )
}

// ─── Phase 2: Number Barrage ────────────────────────────────
function NumberBarragePhase({ svgRef, onComplete, mistakes, setMistakes, lang }) {
  const W = 400, H = 300
  const lineY = 200
  const lineX1 = 40, lineX2 = 360
  const lineW = lineX2 - lineX1
  const range = [-3, 3]
  const xScale = lineW / (range[1] - range[0])

  const [currentIdx, setCurrentIdx] = useState(0)
  const [placed, setPlaced] = useState([])
  const [numberPos, setNumberPos] = useState({ x: W / 2, y: 60 })
  const dragging = useRef(false)

  const num = BARRAGE_NUMBERS[currentIdx]
  const valToX = (v) => lineX1 + (v - range[0]) * xScale

  const getSvgPos = useCallback((e) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    return pt.matrixTransform(svg.getScreenCTM().inverse())
  }, [svgRef])

  const handleDown = useCallback((e) => {
    e.preventDefault()
    e.target.setPointerCapture(e.pointerId)
    dragging.current = true
  }, [])

  const handleMove = useCallback((e) => {
    if (!dragging.current) return
    e.preventDefault()
    setNumberPos(getSvgPos(e))
  }, [getSvgPos])

  const handleUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false

    // Check if near the number line
    if (Math.abs(numberPos.y - lineY) < 40) {
      // Convert x to value
      const val = range[0] + (numberPos.x - lineX1) / xScale
      const target = BARRAGE_NUMBERS[currentIdx].value
      const tolerance = 0.3

      if (Math.abs(val - target) <= tolerance) {
        // Correct!
        const newPlaced = [...placed, { ...BARRAGE_NUMBERS[currentIdx], placedX: valToX(target) }]
        setPlaced(newPlaced)
        const nextIdx = currentIdx + 1
        if (nextIdx >= BARRAGE_NUMBERS.length) {
          setTimeout(() => onComplete(), 500)
        } else {
          setCurrentIdx(nextIdx)
          setNumberPos({ x: W / 2, y: 60 })
        }
      } else {
        setMistakes(m => m + 1)
        setNumberPos({ x: W / 2, y: 60 })
      }
    } else {
      setNumberPos({ x: W / 2, y: 60 })
    }
  }, [numberPos, currentIdx, placed, onComplete, setMistakes, valToX, xScale])

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', maxWidth: 440, display: 'block', margin: '0 auto', touchAction: 'none' }}>
      <rect x={0} y={0} width={W} height={H} fill="#1E1B4B" rx={8} />

      <GolemAvatar emotion="angry" x={W / 2} y={30} size={36} />

      {/* Number line */}
      <line x1={lineX1} y1={lineY} x2={lineX2} y2={lineY} stroke="#A5B4FC" strokeWidth={2.5} />
      {Array.from({ length: range[1] - range[0] + 1 }, (_, i) => {
        const v = range[0] + i
        const x = valToX(v)
        return (
          <g key={v}>
            <line x1={x} y1={lineY - 8} x2={x} y2={lineY + 8} stroke="#A5B4FC" strokeWidth={1.5} />
            <text x={x} y={lineY + 24} textAnchor="middle" fill="#A5B4FC" fontSize={12} fontWeight={700}>{v}</text>
          </g>
        )
      })}

      {/* Already placed numbers */}
      {placed.map((p, i) => (
        <g key={i}>
          <circle cx={p.placedX} cy={lineY} r={16} fill="#4ADE80" stroke="#16A34A" strokeWidth={2} />
          <text x={p.placedX} y={lineY + 5} textAnchor="middle" fill="white" fontSize={10} fontWeight={800}>
            {p.display}
          </text>
        </g>
      ))}

      {/* Current falling number */}
      {currentIdx < BARRAGE_NUMBERS.length && (
        <g style={{ cursor: 'grab', touchAction: 'none' }}
          onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp}>
          <circle cx={numberPos.x} cy={numberPos.y} r={24}
            fill="#F472B6" stroke="white" strokeWidth={2.5}>
            <animate attributeName="r" values="22;26;22" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <text x={numberPos.x} y={numberPos.y + 5} textAnchor="middle" fill="white" fontSize={14} fontWeight={800}>
            {num.display}
          </text>
        </g>
      )}

      {/* Instructions */}
      <text x={W / 2} y={H - 40} textAnchor="middle" fill="#A5B4FC" fontSize={11} fontWeight={600}>
        {lang === 'zh'
          ? `拖动数字到数轴上正确的位置！(${currentIdx + 1}/${BARRAGE_NUMBERS.length})`
          : `Drag the number to its position on the line! (${currentIdx + 1}/${BARRAGE_NUMBERS.length})`}
      </text>

      <HPBar phase={1} maxPhase={3} x={10} y={H - 22} width={120} />
    </svg>
  )
}

// ─── Phase 3: Power Core ────────────────────────────────────
function PowerCorePhase({ svgRef, onComplete, mistakes, setMistakes, lang }) {
  const W = 400, H = 300
  const [challengeIdx, setChallengeIdx] = useState(0)
  const [sliderVal, setSliderVal] = useState(1)
  const [solved, setSolved] = useState(false)
  const dragging = useRef(false)
  const challenge = POWER_CHALLENGES[challengeIdx]

  const trackX = 60, trackW = W - 120, trackY = 180
  const steps = challenge.max - challenge.min
  const stepW = trackW / steps
  const valToX = (v) => trackX + (v - challenge.min) * stepW

  const getSvgX = useCallback((e) => {
    const svg = svgRef.current
    if (!svg) return 0
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    return pt.matrixTransform(svg.getScreenCTM().inverse()).x
  }, [svgRef])

  const xToVal = useCallback((x) => {
    const clamped = Math.max(trackX, Math.min(trackX + trackW, x))
    return Math.round((clamped - trackX) / stepW) + challenge.min
  }, [stepW, challenge.min])

  const handleDown = useCallback((e) => {
    if (solved) return
    e.preventDefault()
    e.target.setPointerCapture(e.pointerId)
    dragging.current = true
    setSliderVal(xToVal(getSvgX(e)))
  }, [solved, getSvgX, xToVal])

  const handleMove = useCallback((e) => {
    if (!dragging.current) return
    e.preventDefault()
    setSliderVal(xToVal(getSvgX(e)))
  }, [getSvgX, xToVal])

  const handleUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false

    if (sliderVal === challenge.answer) {
      setSolved(true)
      setTimeout(() => {
        const next = challengeIdx + 1
        if (next >= POWER_CHALLENGES.length) {
          onComplete()
        } else {
          setChallengeIdx(next)
          setSliderVal(POWER_CHALLENGES[next].min)
          setSolved(false)
        }
      }, 800)
    } else {
      setMistakes(m => m + 1)
    }
  }, [sliderVal, challenge, challengeIdx, onComplete, setMistakes])

  // Compute display
  let computedDisplay = ''
  const c = challenge
  if (c.base === 2) {
    computedDisplay = `2^${sliderVal} = ${Math.pow(2, sliderVal)}`
  } else if (c.expression.en.startsWith('√')) {
    computedDisplay = `√${sliderVal} = ${Number.isInteger(Math.sqrt(sliderVal)) ? Math.sqrt(sliderVal) : Math.sqrt(sliderVal).toFixed(2)}`
  } else {
    computedDisplay = `${sliderVal}² = ${sliderVal * sliderVal}`
  }

  const isCorrect = sliderVal === challenge.answer

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', maxWidth: 440, display: 'block', margin: '0 auto', touchAction: 'none' }}>
      <rect x={0} y={0} width={W} height={H} fill="#1E1B4B" rx={8} />

      <GolemAvatar emotion={solved ? 'friendly' : 'angry'} x={W / 2} y={36} size={40} />

      {/* Expression */}
      <text x={W / 2} y={90} textAnchor="middle" fill="#FFE66D" fontSize={24} fontWeight={900}>
        {challenge.expression[lang]}
      </text>

      {/* Computed value */}
      <text x={W / 2} y={120} textAnchor="middle"
        fill={isCorrect ? '#4ADE80' : '#A5B4FC'} fontSize={18} fontWeight={700}>
        {computedDisplay}
        {isCorrect && ' ✅'}
      </text>

      {/* Challenge counter */}
      <text x={W / 2} y={145} textAnchor="middle" fill="#64748B" fontSize={11}>
        {lang === 'zh' ? `第 ${challengeIdx + 1}/${POWER_CHALLENGES.length} 题` : `Challenge ${challengeIdx + 1}/${POWER_CHALLENGES.length}`}
      </text>

      {/* Slider track */}
      <rect x={trackX} y={trackY} width={trackW} height={8} rx={4} fill="rgba(255,255,255,0.15)" />
      <rect x={trackX} y={trackY} width={valToX(sliderVal) - trackX} height={8} rx={4}
        fill={isCorrect ? '#4ADE80' : '#F472B6'} opacity={0.6} />

      {/* Tick marks */}
      {Array.from({ length: steps + 1 }, (_, i) => {
        const v = challenge.min + i
        const tx = valToX(v)
        return (
          <g key={v}>
            <line x1={tx} y1={trackY - 3} x2={tx} y2={trackY + 11} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
            <text x={tx} y={trackY + 26} textAnchor="middle" fill="#A5B4FC" fontSize={10} fontWeight={600}>
              {v}
            </text>
          </g>
        )
      })}

      {/* Slider hit area */}
      <rect x={trackX - 10} y={trackY - 20} width={trackW + 20} height={54}
        fill="transparent" style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp} />

      {/* Thumb */}
      <circle cx={valToX(sliderVal)} cy={trackY + 4} r={14}
        fill={isCorrect ? '#4ADE80' : '#F472B6'} stroke="white" strokeWidth={3}
        style={{ pointerEvents: 'none', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
      <text x={valToX(sliderVal)} y={trackY + 8} textAnchor="middle" fill="white" fontSize={11} fontWeight={800}
        style={{ pointerEvents: 'none' }}>
        {sliderVal}
      </text>

      {/* Instructions */}
      <text x={W / 2} y={H - 40} textAnchor="middle" fill="#A5B4FC" fontSize={11} fontWeight={600}>
        {lang === 'zh' ? '拖动滑块解方程，摧毁能量核心！' : 'Drag the slider to solve and destroy the power core!'}
      </text>

      <HPBar phase={2} maxPhase={3} x={10} y={H - 22} width={120} />
    </svg>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function NumberGolem({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'
  const svgRef = useRef(null)

  const [phase, setPhase] = useState(1)
  const [mistakes, setMistakes] = useState(0)
  const [showVictory, setShowVictory] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const transitionToNextPhase = useCallback((nextPhase) => {
    setTransitioning(true)
    setTimeout(() => {
      setPhase(nextPhase)
      setTransitioning(false)
    }, 600)
  }, [])

  const handlePhase1Complete = useCallback(() => {
    transitionToNextPhase(2)
  }, [transitionToNextPhase])

  const handlePhase2Complete = useCallback(() => {
    transitionToNextPhase(3)
  }, [transitionToNextPhase])

  const handlePhase3Complete = useCallback(() => {
    setShowVictory(true)
  }, [])

  const handleFinish = useCallback(() => {
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
    onComplete({ stars, mistakes })
  }, [mistakes, onComplete])

  const phaseNames = {
    1: { en: 'Phase 1: Shield Break', zh: '第一阶段：破盾' },
    2: { en: 'Phase 2: Number Barrage', zh: '第二阶段：数字弹幕' },
    3: { en: 'Phase 3: Power Core', zh: '第三阶段：能量核心' },
  }

  const hints = phase === 1
    ? [
        lang === 'zh' ? '拖动 1/4 碎片到盾牌的缺口处！' : 'Drag the 1/4 pieces to the gaps in the shield!',
        lang === 'zh' ? '注意：只有正确的分数才能填补空缺！' : 'Only the correct fractions will fill the gaps!',
      ]
    : phase === 2
      ? [
          lang === 'zh' ? '把数字拖到数轴上正确的位置！' : 'Drag each number to its correct position on the line!',
          lang === 'zh' ? '记住：负数在左边，分数在整数之间！' : 'Remember: negatives on the left, fractions between integers!',
        ]
      : [
          lang === 'zh' ? '拖动滑块找到让等式成立的值！' : 'Drag the slider to find the value that makes the equation true!',
          lang === 'zh' ? '2³ 意思是 2×2×2，√9 意思是"什么数的平方等于9"' : '2³ means 2×2×2, √9 means "what squared equals 9"',
        ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 12,
      background: 'linear-gradient(180deg, #0F0A2E, #1E1B4B)',
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 36, marginBottom: 4 }}>👾</div>
        <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', fontWeight: 900, color: '#FFE66D', margin: 0 }}>
          {lang === 'zh' ? '数字巨石怪' : 'Number Golem'}
        </h2>
        {!showVictory && (
          <div style={{ fontSize: 14, color: '#A5B4FC', marginTop: 4, fontWeight: 600 }}>
            {phaseNames[phase]?.[lang]}
          </div>
        )}
      </div>

      {/* Transition overlay */}
      {transitioning && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
        }}>
          <div style={{ fontSize: 48, animation: 'float 0.6s ease-in-out' }}>⚔️</div>
        </div>
      )}

      {/* Phase content */}
      {!showVictory && (
        <div className="card" style={{ maxWidth: 480, width: '100%', padding: '12px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {phase === 1 && (
            <ShieldBreakPhase svgRef={svgRef} onComplete={handlePhase1Complete}
              mistakes={mistakes} setMistakes={setMistakes} lang={lang} />
          )}
          {phase === 2 && (
            <NumberBarragePhase svgRef={svgRef} onComplete={handlePhase2Complete}
              mistakes={mistakes} setMistakes={setMistakes} lang={lang} />
          )}
          {phase === 3 && (
            <PowerCorePhase svgRef={svgRef} onComplete={handlePhase3Complete}
              mistakes={mistakes} setMistakes={setMistakes} lang={lang} />
          )}
        </div>
      )}

      {/* Victory screen */}
      {showVictory && (
        <div className="card" style={{
          maxWidth: 400, width: '100%', textAlign: 'center',
          background: 'rgba(74, 222, 128, 0.15)', border: '2px solid #4ADE80',
          animation: 'bounce-in 0.5s',
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
          <h3 style={{ color: '#4ADE80', fontSize: 20, fontWeight: 900, margin: '0 0 8px' }}>
            {lang === 'zh' ? '巨石怪被解放了！' : 'The Golem is freed!'}
          </h3>
          <p style={{ color: '#A5B4FC', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
            {lang === 'zh'
              ? '你用数学的力量击败了 Glitch 的控制！数字巨石怪恢复了友善，第一块水晶碎片出现了！'
              : "You used the power of math to break Glitch's control! The Number Golem is friendly again, and the first Crystal Shard has appeared!"}
          </p>
          <div style={{ fontSize: 36, marginBottom: 12 }}>💎</div>
          <button className="btn btn-primary" onClick={handleFinish}
            style={{ background: '#4ADE80', color: '#0F0A2E', border: 'none', fontWeight: 800 }}>
            {lang === 'zh' ? '获取水晶碎片！' : 'Claim the Crystal Shard!'}
          </button>
        </div>
      )}

      {/* Professor Pi */}
      {!showVictory && (
        <div style={{ maxWidth: 420, width: '100%', marginTop: 8 }}>
          <ProfessorPi
            message={
              phase === 1
                ? (lang === 'zh' ? '拖动正确的分数碎片修补盾牌的裂缝！' : 'Drag the correct fraction pieces to repair the shield cracks!')
                : phase === 2
                  ? (lang === 'zh' ? '把每个数字拖到数轴上正确的位置！' : 'Drag each number to the right spot on the number line!')
                  : (lang === 'zh' ? '拖动滑块解开方程，摧毁能量核心！' : 'Slide to solve equations and destroy the power core!')
            }
            hints={hints}
            showHint={mistakes > 0}
          />
        </div>
      )}
    </div>
  )
}
