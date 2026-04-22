import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ProfessorPi from '../../components/ProfessorPi'

// ═══════════════════════════════════════════════════════════════
// PHASE 1: Shield Break — drag fraction pieces to fill gaps
// ═══════════════════════════════════════════════════════════════
const SHIELD_TASKS = [
  { gapFractions: [1 / 4], totalSlices: 4, pieces: ['1/4', '1/3', '1/6'], answer: '1/4' },
  { gapFractions: [1 / 3], totalSlices: 3, pieces: ['1/2', '1/3', '1/4'], answer: '1/3' },
]

// ═══════════════════════════════════════════════════════════════
// PHASE 2: Number Barrage — drag numbers to number line
// ═══════════════════════════════════════════════════════════════
const BARRAGE_NUMBERS = [
  { value: -2, label: '-2' },
  { value: 0.5, label: '1/2' },
  { value: -1.5, label: '-1.5' },
  { value: 0.75, label: '3/4' },
  { value: 2, label: '\u221A4' },
]

// ═══════════════════════════════════════════════════════════════
// PHASE 3: Power Core — slider to solve exponent expressions
// ═══════════════════════════════════════════════════════════════
const POWER_TASKS = [
  { expression: '2^? = 8', answer: 3, range: [1, 5], format: (v) => `2^${v} = ${Math.pow(2, v)}` },
  { expression: '\u221A? = 3', answer: 9, range: [1, 16], format: (v) => `\u221A${v} = ${Math.sqrt(v).toFixed(2)}` },
  { expression: '?\u00B2 = 25', answer: 5, range: [1, 8], format: (v) => `${v}\u00B2 = ${v * v}` },
]

// ─── Golem Avatar ────────────────────────────────────────────
function GolemFace({ x, y, size, emotion }) {
  const eyeColor = emotion === 'angry' ? '#EF4444' : emotion === 'friendly' ? '#4ADE80' : '#60A5FA'
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={-size / 2} y={-size / 2} width={size} height={size} rx={size * 0.2}
        fill="#64748B" stroke="#475569" strokeWidth={2} />
      {/* Eyes */}
      <circle cx={-size * 0.18} cy={-size * 0.08} r={size * 0.1} fill={eyeColor}>
        {emotion === 'angry' && <animate attributeName="r" values={`${size * 0.1};${size * 0.12};${size * 0.1}`} dur="0.5s" repeatCount="indefinite" />}
      </circle>
      <circle cx={size * 0.18} cy={-size * 0.08} r={size * 0.1} fill={eyeColor}>
        {emotion === 'angry' && <animate attributeName="r" values={`${size * 0.1};${size * 0.12};${size * 0.1}`} dur="0.5s" repeatCount="indefinite" />}
      </circle>
      {/* Mouth */}
      {emotion === 'angry' ? (
        <path d={`M ${-size * 0.15} ${size * 0.2} Q 0 ${size * 0.12} ${size * 0.15} ${size * 0.2}`}
          fill="none" stroke="#1E293B" strokeWidth={2} strokeLinecap="round" />
      ) : emotion === 'friendly' ? (
        <path d={`M ${-size * 0.15} ${size * 0.15} Q 0 ${size * 0.28} ${size * 0.15} ${size * 0.15}`}
          fill="none" stroke="#1E293B" strokeWidth={2} strokeLinecap="round" />
      ) : (
        <line x1={-size * 0.12} y1={size * 0.18} x2={size * 0.12} y2={size * 0.18}
          stroke="#1E293B" strokeWidth={2} strokeLinecap="round" />
      )}
      {/* Cracks (when damaged) */}
      {emotion === 'angry' && (
        <path d={`M ${-size * 0.35} ${-size * 0.3} L ${-size * 0.2} ${-size * 0.1} L ${-size * 0.3} ${size * 0.1}`}
          fill="none" stroke="#1E293B" strokeWidth={1.5} opacity={0.4} />
      )}
    </g>
  )
}

// ─── HP Bar ──────────────────────────────────────────────────
function HPBar({ phase, x, y, width }) {
  const segW = width / 3
  const colors = ['#EF4444', '#F59E0B', '#60A5FA']
  return (
    <g>
      <rect x={x} y={y} width={width} height={14} rx={7} fill="#1E293B" stroke="#475569" strokeWidth={1} />
      {[0, 1, 2].map(i => (
        <rect key={i} x={x + 2 + i * segW} y={y + 2} width={segW - 4} height={10} rx={5}
          fill={i >= phase ? colors[i] : '#334155'} opacity={i >= phase ? 1 : 0.3}>
          {i === phase && (
            <animate attributeName="opacity" values="0.7;1;0.7" dur="1s" repeatCount="indefinite" />
          )}
        </rect>
      ))}
      <text x={x + width / 2} y={y - 4} textAnchor="middle" fill="#94A3B8" fontSize={9} fontWeight={700}>
        HP
      </text>
    </g>
  )
}

// ─── Phase 1: Shield Break ───────────────────────────────────
function ShieldPhase({ svgRef, task, onPiecePlaced, placedPieces, lang }) {
  const W = 400, H = 300
  const centerX = W / 2, centerY = 110, shieldR = 60

  const pieces = task.pieces
  const dragging = useRef(null)
  const dragPos = useRef({ x: 0, y: 0 })
  const [, forceUpdate] = useState(0)

  const getSvgPos = useCallback((e) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    return pt.matrixTransform(svg.getScreenCTM().inverse())
  }, [svgRef])

  const handleDown = useCallback((piece, e) => {
    if (placedPieces.includes(piece)) return
    e.preventDefault()
    e.target.setPointerCapture(e.pointerId)
    dragging.current = piece
    const pos = getSvgPos(e)
    dragPos.current = { x: pos.x, y: pos.y }
    forceUpdate(n => n + 1)
  }, [getSvgPos, placedPieces])

  const handleMove = useCallback((e) => {
    if (!dragging.current) return
    e.preventDefault()
    const pos = getSvgPos(e)
    dragPos.current = { x: pos.x, y: pos.y }
    forceUpdate(n => n + 1)
  }, [getSvgPos])

  const handleUp = useCallback(() => {
    if (!dragging.current) return
    const piece = dragging.current
    // Check if dropped on shield center
    const dx = dragPos.current.x - centerX
    const dy = dragPos.current.y - centerY
    if (Math.sqrt(dx * dx + dy * dy) < shieldR + 20) {
      onPiecePlaced(piece)
    }
    dragging.current = null
    forceUpdate(n => n + 1)
  }, [centerX, centerY, shieldR, onPiecePlaced])

  // Draw pie slices
  const sliceAngle = (2 * Math.PI) / task.totalSlices
  const slices = Array.from({ length: task.totalSlices }, (_, i) => {
    const startAngle = i * sliceAngle - Math.PI / 2
    const endAngle = startAngle + sliceAngle
    const x1 = centerX + shieldR * Math.cos(startAngle)
    const y1 = centerY + shieldR * Math.sin(startAngle)
    const x2 = centerX + shieldR * Math.cos(endAngle)
    const y2 = centerY + shieldR * Math.sin(endAngle)
    const largeArc = sliceAngle > Math.PI ? 1 : 0
    return { path: `M ${centerX} ${centerY} L ${x1} ${y1} A ${shieldR} ${shieldR} 0 ${largeArc} 1 ${x2} ${y2} Z`, i }
  })

  // Which slice is the gap? Last one
  const gapIdx = task.totalSlices - 1
  const isGapFilled = placedPieces.includes(task.answer)

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', maxWidth: 440, display: 'block', margin: '0 auto', touchAction: 'none' }}
      onPointerMove={handleMove} onPointerUp={handleUp}>
      <rect x={0} y={0} width={W} height={H} fill="#1E293B" rx={8} />

      {/* Shield */}
      {slices.map(s => (
        <path key={s.i} d={s.path}
          fill={s.i === gapIdx && !isGapFilled ? 'none' : '#60A5FA'}
          stroke="#475569" strokeWidth={1.5}
          opacity={s.i === gapIdx && !isGapFilled ? 0.3 : 0.8}
          strokeDasharray={s.i === gapIdx && !isGapFilled ? '4,3' : '0'} />
      ))}

      {/* Shield glow when filled */}
      {isGapFilled && (
        <circle cx={centerX} cy={centerY} r={shieldR + 5} fill="none" stroke="#4ADE80" strokeWidth={3}>
          <animate attributeName="r" values={`${shieldR + 5};${shieldR + 10};${shieldR + 5}`} dur="0.6s" repeatCount="3" />
          <animate attributeName="opacity" values="1;0" dur="1.8s" fill="freeze" />
        </circle>
      )}

      {/* Gap label */}
      {!isGapFilled && (
        <text x={centerX} y={centerY + shieldR + 20} textAnchor="middle" fill="#F59E0B" fontSize={12} fontWeight={700}>
          {lang === 'zh' ? '缺口！拖拽碎片填补' : 'Gap! Drag a piece to fill'}
        </text>
      )}

      {/* Fraction pieces tray */}
      {pieces.map((piece, i) => {
        const isPlaced = placedPieces.includes(piece)
        const isDragging = dragging.current === piece
        const px = isDragging ? dragPos.current.x : 80 + i * 100
        const py = isDragging ? dragPos.current.y : H - 50
        return (
          <g key={piece} transform={`translate(${px}, ${py})`}
            style={{ cursor: isPlaced ? 'default' : 'grab', touchAction: 'none', opacity: isPlaced ? 0.3 : 1 }}
            onPointerDown={(e) => handleDown(piece, e)}>
            <rect x={-30} y={-18} width={60} height={36} rx={8}
              fill={isPlaced ? '#334155' : '#F8FAFC'} stroke={isDragging ? '#4ECDC4' : '#CBD5E1'} strokeWidth={isDragging ? 3 : 1.5} />
            <text x={0} y={5} textAnchor="middle" fill={isPlaced ? '#64748B' : '#1E293B'} fontSize={16} fontWeight={800}>
              {piece}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Phase 2: Number Barrage ─────────────────────────────────
function BarragePhase({ svgRef, numbers, currentIdx, onPlace, placedNumbers, lang }) {
  const W = 400, H = 280
  const lineY = 160
  const lineX1 = 40, lineX2 = 360
  const lineW = lineX2 - lineX1

  const valToX = (v) => lineX1 + ((v - (-3)) / 6) * lineW // range -3 to 3

  const dragging = useRef(false)
  const [dragX, setDragX] = useState(null)
  const [dragY, setDragY] = useState(null)

  const getSvgPos = useCallback((e) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    return pt.matrixTransform(svg.getScreenCTM().inverse())
  }, [svgRef])

  const current = currentIdx < numbers.length ? numbers[currentIdx] : null

  const handleDown = useCallback((e) => {
    if (!current) return
    e.preventDefault()
    e.target.setPointerCapture(e.pointerId)
    dragging.current = true
    const pos = getSvgPos(e)
    setDragX(pos.x)
    setDragY(pos.y)
  }, [current, getSvgPos])

  const handleMove = useCallback((e) => {
    if (!dragging.current) return
    e.preventDefault()
    const pos = getSvgPos(e)
    setDragX(pos.x)
    setDragY(pos.y)
  }, [getSvgPos])

  const handleUp = useCallback(() => {
    if (!dragging.current || !current) return
    dragging.current = false
    // Check if on the number line
    if (dragY > lineY - 30 && dragY < lineY + 30 && dragX > lineX1 - 10 && dragX < lineX2 + 10) {
      const placedVal = -3 + ((dragX - lineX1) / lineW) * 6
      const snapped = Math.round(placedVal * 4) / 4 // snap to 0.25
      onPlace(snapped)
    }
    setDragX(null)
    setDragY(null)
  }, [current, dragX, dragY, onPlace])

  // Ticks for -3 to 3
  const ticks = [-3, -2, -1, 0, 1, 2, 3]

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', maxWidth: 440, display: 'block', margin: '0 auto', touchAction: 'none' }}
      onPointerMove={handleMove} onPointerUp={handleUp}>
      <rect x={0} y={0} width={W} height={H} fill="#1E293B" rx={8} />

      {/* Number line */}
      <line x1={lineX1} y1={lineY} x2={lineX2} y2={lineY} stroke="#64748B" strokeWidth={2} />
      {ticks.map(v => (
        <g key={v}>
          <line x1={valToX(v)} y1={lineY - 8} x2={valToX(v)} y2={lineY + 8} stroke="#94A3B8" strokeWidth={1.5} />
          <text x={valToX(v)} y={lineY + 22} textAnchor="middle" fill="#CBD5E1" fontSize={11} fontWeight={600}>{v}</text>
        </g>
      ))}

      {/* Placed numbers */}
      {placedNumbers.map((p, i) => (
        <g key={i} transform={`translate(${valToX(p.placed)}, ${lineY - 20})`}>
          <circle cx={0} cy={0} r={14} fill={p.correct ? '#4ADE80' : '#EF4444'} opacity={0.8} />
          <text x={0} y={4} textAnchor="middle" fill="white" fontSize={10} fontWeight={800}>{p.label}</text>
        </g>
      ))}

      {/* Current falling number */}
      {current && (
        <g style={{ cursor: 'grab', touchAction: 'none' }} onPointerDown={handleDown}>
          <circle cx={dragX !== null ? dragX : W / 2} cy={dragY !== null ? dragY : 50}
            r={22} fill="#F472B6" stroke="white" strokeWidth={2}>
            {dragX === null && (
              <animate attributeName="cy" values="40;55;40" dur="1.5s" repeatCount="indefinite" />
            )}
          </circle>
          <text x={dragX !== null ? dragX : W / 2} y={(dragY !== null ? dragY : 50) + 5}
            textAnchor="middle" fill="white" fontSize={13} fontWeight={800}>
            {current.label}
          </text>
        </g>
      )}

      {/* Instruction */}
      <text x={W / 2} y={H - 15} textAnchor="middle" fill="#94A3B8" fontSize={11} fontWeight={600}>
        {current
          ? (lang === 'zh' ? `拖拽 ${current.label} 到数轴上` : `Drag ${current.label} to the number line`)
          : (lang === 'zh' ? '全部放置完成！' : 'All placed!')}
      </text>
    </svg>
  )
}

// ─── Phase 3: Power Core ─────────────────────────────────────
function PowerPhase({ svgRef, task, sliderValue, onSliderChange, solved, lang }) {
  const W = 400, H = 240
  const trackX = 50, trackW = W - 100, trackY = 160
  const [min, max] = task.range
  const steps = max - min
  const stepW = trackW / steps
  const valToX = (v) => trackX + (v - min) * stepW

  const dragging = useRef(false)

  const getSvgX = useCallback((e) => {
    const svg = svgRef.current
    if (!svg) return 0
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    return pt.matrixTransform(svg.getScreenCTM().inverse()).x
  }, [svgRef])

  const handleDown = useCallback((e) => {
    if (solved) return
    e.preventDefault()
    e.target.setPointerCapture(e.pointerId)
    dragging.current = true
    const x = getSvgX(e)
    const val = Math.round((x - trackX) / stepW) + min
    onSliderChange(Math.max(min, Math.min(max, val)))
  }, [solved, getSvgX, min, max, stepW, onSliderChange])

  const handleMove = useCallback((e) => {
    if (!dragging.current) return
    e.preventDefault()
    const x = getSvgX(e)
    const val = Math.round((x - trackX) / stepW) + min
    onSliderChange(Math.max(min, Math.min(max, val)))
  }, [getSvgX, min, max, stepW, onSliderChange])

  const handleUp = useCallback(() => {
    dragging.current = false
  }, [])

  const cx = valToX(sliderValue)
  const isCorrect = sliderValue === task.answer

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', maxWidth: 440, display: 'block', margin: '0 auto', touchAction: 'none' }}>
      <rect x={0} y={0} width={W} height={H} fill="#1E293B" rx={8} />

      {/* Expression */}
      <text x={W / 2} y={45} textAnchor="middle" fill="#F59E0B" fontSize={28} fontWeight={900} fontFamily="monospace">
        {task.expression}
      </text>

      {/* Live result */}
      <text x={W / 2} y={85} textAnchor="middle"
        fill={isCorrect ? '#4ADE80' : '#CBD5E1'} fontSize={20} fontWeight={800}>
        {task.format(sliderValue)}
      </text>
      {isCorrect && (
        <text x={W / 2} y={115} textAnchor="middle" fill="#4ADE80" fontSize={16} fontWeight={900}>
          {lang === 'zh' ? '\u2728 正确！' : '\u2728 Correct!'}
        </text>
      )}

      {/* Slider track */}
      <rect x={trackX} y={trackY} width={trackW} height={8} rx={4} fill="#334155" />
      <rect x={trackX} y={trackY} width={cx - trackX} height={8} rx={4} fill="#F59E0B" opacity={0.5} />

      {/* Ticks */}
      {Array.from({ length: steps + 1 }, (_, i) => {
        const v = min + i
        const tx = valToX(v)
        return (
          <g key={v}>
            <line x1={tx} y1={trackY - 3} x2={tx} y2={trackY + 11} stroke="#64748B" strokeWidth={1} />
            <text x={tx} y={trackY + 24} textAnchor="middle" fill="#94A3B8" fontSize={10} fontWeight={600}>{v}</text>
          </g>
        )
      })}

      {/* Hit area */}
      <rect x={trackX - 10} y={trackY - 25} width={trackW + 20} height={60}
        fill="transparent" style={{ cursor: solved ? 'default' : 'grab', touchAction: 'none' }}
        onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp} />

      {/* Thumb */}
      <circle cx={cx} cy={trackY + 4} r={14}
        fill={isCorrect ? '#4ADE80' : '#F59E0B'} stroke="white" strokeWidth={3}
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))', pointerEvents: 'none' }} />
      <text x={cx} y={trackY + 8} textAnchor="middle" fill="white" fontSize={11} fontWeight={800}
        style={{ pointerEvents: 'none' }}>{sliderValue}</text>
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function NumberGolem({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'
  const svgRef = useRef(null)

  const [phase, setPhase] = useState(1) // 1, 2, 3
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)

  // Phase 1 state
  const [shieldTaskIdx, setShieldTaskIdx] = useState(0)
  const [placedPieces, setPlacedPieces] = useState([])

  // Phase 2 state
  const [barrageIdx, setBarrageIdx] = useState(0)
  const [placedNumbers, setPlacedNumbers] = useState([])

  // Phase 3 state
  const [powerTaskIdx, setPowerTaskIdx] = useState(0)
  const [sliderValue, setSliderValue] = useState(1)

  const [phaseComplete, setPhaseComplete] = useState(false)
  const [allDone, setAllDone] = useState(false)

  // Phase 1: piece placed
  const handlePiecePlaced = useCallback((piece) => {
    const task = SHIELD_TASKS[shieldTaskIdx]
    if (piece === task.answer) {
      const newPlaced = [...placedPieces, piece]
      setPlacedPieces(newPlaced)
      if (shieldTaskIdx + 1 >= SHIELD_TASKS.length) {
        setTimeout(() => {
          setPhaseComplete(true)
          setTimeout(() => { setPhase(2); setPhaseComplete(false) }, 1200)
        }, 600)
      } else {
        setTimeout(() => {
          setShieldTaskIdx(idx => idx + 1)
          setPlacedPieces([])
        }, 600)
      }
    } else {
      setMistakes(m => m + 1)
      setShowHint(true)
    }
  }, [shieldTaskIdx, placedPieces])

  // Phase 2: number placed
  const handleNumberPlace = useCallback((snappedVal) => {
    const num = BARRAGE_NUMBERS[barrageIdx]
    const correct = Math.abs(snappedVal - num.value) < 0.3
    setPlacedNumbers(prev => [...prev, { label: num.label, placed: correct ? num.value : snappedVal, correct }])

    if (!correct) {
      setMistakes(m => m + 1)
      setShowHint(true)
    }

    if (barrageIdx + 1 >= BARRAGE_NUMBERS.length) {
      setTimeout(() => {
        setPhaseComplete(true)
        setTimeout(() => { setPhase(3); setPhaseComplete(false); setSliderValue(POWER_TASKS[0].range[0]) }, 1200)
      }, 600)
    } else {
      setTimeout(() => setBarrageIdx(idx => idx + 1), 400)
    }
  }, [barrageIdx])

  // Phase 3: slider change
  const lockTimer = useRef(null)
  const handleSliderChange = useCallback((val) => {
    setSliderValue(val)
    if (lockTimer.current) clearTimeout(lockTimer.current)
    lockTimer.current = setTimeout(() => {
      const task = POWER_TASKS[powerTaskIdx]
      if (val === task.answer) {
        if (powerTaskIdx + 1 >= POWER_TASKS.length) {
          setTimeout(() => setAllDone(true), 600)
        } else {
          setTimeout(() => {
            setPowerTaskIdx(idx => idx + 1)
            setSliderValue(POWER_TASKS[powerTaskIdx + 1].range[0])
          }, 600)
        }
      }
    }, 500)
  }, [powerTaskIdx])

  // Final completion
  const handleFinish = useCallback(() => {
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
    onComplete({ stars, mistakes })
  }, [mistakes, onComplete])

  const golemEmotion = allDone ? 'friendly' : phase === 1 ? 'angry' : 'serious'

  const phaseTitle = phase === 1
    ? (lang === 'zh' ? 'Phase 1: 破盾' : 'Phase 1: Shield Break')
    : phase === 2
      ? (lang === 'zh' ? 'Phase 2: 数字弹幕' : 'Phase 2: Number Barrage')
      : (lang === 'zh' ? 'Phase 3: 能量核心' : 'Phase 3: Power Core')

  const phaseInstruction = phase === 1
    ? (lang === 'zh' ? '拖拽正确的分数碎片填补盾牌缺口！' : 'Drag the correct fraction piece to fill the shield gap!')
    : phase === 2
      ? (lang === 'zh' ? '拖拽数字到数轴上的正确位置！' : 'Drag each number to its correct position on the number line!')
      : (lang === 'zh' ? '拖动滑块解出等式！' : 'Drag the slider to solve the equation!')

  const hints = phase === 1
    ? [
        lang === 'zh' ? '看看缺口的大小，选择匹配的分数！' : 'Look at the gap size and pick the matching fraction!',
        lang === 'zh' ? '盾牌被分成几等份？缺了几份？' : 'How many equal slices? How many are missing?',
      ]
    : phase === 2
      ? [
          lang === 'zh' ? '负数在 0 的左边，正数在右边！' : 'Negatives go left of 0, positives go right!',
          lang === 'zh' ? '1/2 = 0.5，在 0 和 1 之间' : '1/2 = 0.5, between 0 and 1',
        ]
      : [
          lang === 'zh' ? '移动滑块直到等式成立！' : 'Move the slider until the equation is true!',
          lang === 'zh' ? '观察实时结果来找到正确答案' : 'Watch the live result to find the right answer',
        ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 12,
    }}>
      {/* Golem header */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <svg viewBox="0 0 200 80" style={{ width: 200, height: 80 }}>
          <GolemFace x={100} y={35} size={50} emotion={golemEmotion} />
          <HPBar phase={phase - 1} x={10} y={65} width={180} />
        </svg>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: '4px 0 0' }}>
          {lang === 'zh' ? '数字巨石怪' : 'Number Golem'}
        </h2>
      </div>

      {/* Phase title & instruction */}
      {!allDone && (
        <div className="card" style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
          <div style={{ fontSize: 12, color: '#F59E0B', fontWeight: 800, marginBottom: 4, textTransform: 'uppercase' }}>
            {phaseTitle}
          </div>
          <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', fontWeight: 600, color: '#1E293B' }}>
            {phaseInstruction}
          </div>
        </div>
      )}

      {/* Phase transition animation */}
      {phaseComplete && (
        <div style={{
          textAlign: 'center', padding: 20, animation: 'bounce-in 0.4s',
          fontSize: 24, fontWeight: 900, color: '#4ECDC4',
        }}>
          {lang === 'zh' ? '\u2728 阶段完成！' : '\u2728 Phase Complete!'}
        </div>
      )}

      {/* Phase content */}
      {!phaseComplete && !allDone && (
        <div className="card" style={{ maxWidth: 460, width: '100%', padding: '12px 8px', background: '#0F172A' }}>
          {phase === 1 && (
            <ShieldPhase svgRef={svgRef} task={SHIELD_TASKS[shieldTaskIdx]}
              onPiecePlaced={handlePiecePlaced} placedPieces={placedPieces} lang={lang} />
          )}
          {phase === 2 && (
            <BarragePhase svgRef={svgRef} numbers={BARRAGE_NUMBERS} currentIdx={barrageIdx}
              onPlace={handleNumberPlace} placedNumbers={placedNumbers} lang={lang} />
          )}
          {phase === 3 && (
            <PowerPhase svgRef={svgRef} task={POWER_TASKS[powerTaskIdx]}
              sliderValue={sliderValue} onSliderChange={handleSliderChange}
              solved={false} lang={lang} />
          )}
        </div>
      )}

      {/* Victory */}
      {allDone && (
        <div className="card" style={{
          maxWidth: 400, width: '100%', textAlign: 'center',
          background: 'linear-gradient(135deg, #E0FFF8, #DBEAFE)', border: '2px solid #4ECDC4',
          animation: 'bounce-in 0.4s',
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{'\uD83C\uDF1F'}</div>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: '#059669', margin: '0 0 8px' }}>
            {lang === 'zh' ? '巨石怪被解放了！' : 'The Golem is freed!'}
          </h3>
          <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 16px', lineHeight: 1.6 }}>
            {lang === 'zh'
              ? '你用数学的力量打破了 Glitch 的控制。第一块水晶碎片已经恢复！'
              : "You broke Glitch's control with the power of math. The first Crystal Shard is restored!"}
          </p>
          <button className="btn btn-primary" onClick={handleFinish}>
            {lang === 'zh' ? '获得水晶碎片！' : 'Claim the Crystal Shard!'}
          </button>
        </div>
      )}

      {/* Phase progress */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
        {[1, 2, 3].map(p => (
          <div key={p} style={{
            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: p < phase ? '#4ECDC4' : p === phase ? '#F59E0B' : '#E2E8F0',
            color: p <= phase ? 'white' : '#94A3B8', fontSize: 13, fontWeight: 800,
            transition: 'background 0.3s',
          }}>
            {p < phase ? '\u2713' : p}
          </div>
        ))}
      </div>

      {/* Professor Pi */}
      {!allDone && (
        <div style={{ maxWidth: 420, width: '100%', marginTop: 8 }}>
          <ProfessorPi
            message={lang === 'zh' ? '用你学到的所有知识打败巨石怪！' : 'Use everything you\'ve learned to defeat the Golem!'}
            hints={hints} showHint={showHint} />
        </div>
      )}
    </div>
  )
}
