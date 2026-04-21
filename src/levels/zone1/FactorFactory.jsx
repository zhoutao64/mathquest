import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    type: 'select_factors',
    instruction: { en: 'Pack 12 apples: drag the slider to find ALL box sizes that work!', zh: '装 12 个苹果：拖动滑块找出所有合适的箱子大小！' },
    totalApples: 12,
    sliderRange: [1, 6],
    answers: [1, 2, 3, 4, 6],
    explanation: {
      en: 'Factors of 12: 1, 2, 3, 4, 6. They divide 12 perfectly — no leftovers!',
      zh: '12 的因数：1、2、3、4、6。它们能整除 12——没有剩余！',
    },
  },
  {
    type: 'yes_no',
    instruction: { en: 'Can 8 apples fit perfectly into boxes of 3? Drag the leftover apples into a box!', zh: '8 个苹果能恰好装进每箱 3 个的箱子吗？试着把剩余苹果塞进箱子！' },
    totalApples: 8,
    boxSize: 3,
    answer: false,
    fullBoxes: 2,
    remainder: 2,
    explanation: {
      en: '8 ÷ 3 = 2 boxes with 2 left over. 3 is NOT a factor of 8!',
      zh: '8 ÷ 3 = 2 箱余 2 个。3 不是 8 的因数！',
    },
  },
  {
    type: 'select_factors',
    instruction: { en: 'Pack 15 apples: drag the slider to find which sizes work!', zh: '装 15 个苹果：拖动滑块找出合适的大小！' },
    totalApples: 15,
    sliderRange: [2, 7],
    answers: [3, 5],
    explanation: {
      en: 'Factors of 15 (from range): 3 and 5. 15÷3=5 boxes, 15÷5=3 boxes!',
      zh: '15 的因数（范围内）：3 和 5。15÷3=5 箱，15÷5=3 箱！',
    },
  },
  {
    type: 'gcf',
    instruction: { en: 'Find the BIGGEST box that works for BOTH 12 and 8!', zh: '找能同时装 12 个和 8 个苹果的最大箱子！' },
    groups: [12, 8],
    sliderRange: [1, 6],
    answer: 4,
    explanation: {
      en: 'GCF(12, 8) = 4. Boxes of 4 fit both: 12÷4=3 and 8÷4=2!',
      zh: '最大公因数(12, 8) = 4。每箱 4 个都能装完：12÷4=3，8÷4=2！',
    },
  },
  {
    type: 'gcf',
    instruction: { en: 'Find the GCF of 18 and 24! Drag to the biggest that fits both.', zh: '找出 18 和 24 的最大公因数！拖到最大的能整除两者的数。' },
    groups: [18, 24],
    sliderRange: [1, 9],
    answer: 6,
    explanation: {
      en: 'GCF(18, 24) = 6. 18÷6=3 boxes, 24÷6=4 boxes. Biggest that works for both!',
      zh: '最大公因数(18, 24) = 6。18÷6=3 箱，24÷6=4 箱。最大的公共因数！',
    },
  },
]

// ─── Apple SVG ───────────────────────────────────────────────
function Apple({ x, y, size = 12, dimmed, shake }) {
  return (
    <g transform={`translate(${x}, ${y})`} opacity={dimmed ? 0.25 : 1}>
      {shake && (
        <animateTransform attributeName="transform" type="translate"
          values={`${x},${y}; ${x + 3},${y}; ${x - 3},${y}; ${x},${y}`}
          dur="0.3s" repeatCount="1" />
      )}
      <circle cx={0} cy={0} r={size / 2} fill="#EF4444" />
      <circle cx={-size / 5} cy={-size / 5} r={size / 5} fill="rgba(255,255,255,0.3)" />
      <line x1={0} y1={-size / 2} x2={1.5} y2={-size / 2 - 3} stroke="#92400E" strokeWidth={1.2} strokeLinecap="round" />
      <ellipse cx={3} cy={-size / 2 - 2} rx={3} ry={1.5} fill="#4ADE80" transform={`rotate(25,3,${-size / 2 - 2})`} />
    </g>
  )
}

// ─── Box with apples ────────────────────────────────────────
function PackingBox({ x, y, boxSize, filledCount, width = 50, height = 36 }) {
  const isFull = filledCount === boxSize
  const hasRemainder = filledCount > 0 && filledCount < boxSize
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={0} y={0} width={width} height={height} rx={4}
        fill={isFull ? '#D1FAE5' : hasRemainder ? '#FEE2E2' : '#F3F4F6'}
        stroke={isFull ? '#4ECDC4' : hasRemainder ? '#EF4444' : '#CBD5E1'}
        strokeWidth={1.5} strokeDasharray={isFull ? '0' : '4,2'} />
      {Array.from({ length: filledCount }).map((_, i) => (
        <circle key={i}
          cx={8 + (i % Math.min(boxSize, 4)) * 11}
          cy={height / 2 + Math.floor(i / Math.min(boxSize, 4)) * 11 - (boxSize > 4 ? 4 : 0)}
          r={4} fill="#EF4444" opacity={0.8} />
      ))}
      {isFull && (
        <g transform={`translate(${width - 10}, -6)`}>
          <circle cx={0} cy={0} r={7} fill="#4ECDC4" />
          <path d="M -3 0 L -1 3 L 4 -3" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" />
        </g>
      )}
      {hasRemainder && (
        <g transform={`translate(${width - 10}, -6)`}>
          <circle cx={0} cy={0} r={7} fill="#EF4444" />
          <path d="M -3 -3 L 3 3 M 3 -3 L -3 3" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" />
        </g>
      )}
    </g>
  )
}

// ─── Draggable Slider (SVG) ─────────────────────────────────
function Slider({ svgRef, min, max, value, onChange, y, width, disabled }) {
  const trackX = 40
  const trackW = width - 80
  const steps = max - min
  const stepW = trackW / steps

  const valToX = (v) => trackX + (v - min) * stepW
  const xToVal = (x) => {
    const clamped = Math.max(trackX, Math.min(trackX + trackW, x))
    return Math.round((clamped - trackX) / stepW) + min
  }

  const dragging = useRef(false)

  const getSvgX = useCallback((e) => {
    const svg = svgRef.current
    if (!svg) return 0
    const pt = svg.createSVGPoint()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    pt.x = clientX
    pt.y = clientY
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
    return svgP.x
  }, [svgRef])

  const handlePointerDown = useCallback((e) => {
    if (disabled) return
    e.preventDefault()
    e.target.setPointerCapture(e.pointerId)
    dragging.current = true
    const svgX = getSvgX(e)
    onChange(xToVal(svgX))
  }, [disabled, getSvgX, onChange, xToVal])

  const handlePointerMove = useCallback((e) => {
    if (!dragging.current) return
    e.preventDefault()
    const svgX = getSvgX(e)
    onChange(xToVal(svgX))
  }, [getSvgX, onChange, xToVal])

  const handlePointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  const cx = valToX(value)

  return (
    <g>
      {/* Track background */}
      <rect x={trackX} y={y} width={trackW} height={8} rx={4} fill="#E2E8F0" />
      {/* Active fill */}
      <rect x={trackX} y={y} width={cx - trackX} height={8} rx={4} fill="#F472B6" opacity={0.5} />
      {/* Tick marks and labels */}
      {Array.from({ length: steps + 1 }, (_, i) => {
        const v = min + i
        const tx = valToX(v)
        return (
          <g key={v}>
            <line x1={tx} y1={y - 2} x2={tx} y2={y + 10} stroke="#94A3B8" strokeWidth={1} />
            <text x={tx} y={y + 22} textAnchor="middle" fill="#64748B" fontSize={11} fontWeight={700}>
              {v}
            </text>
          </g>
        )
      })}
      {/* Invisible wide hit area for easier dragging */}
      <rect x={trackX - 10} y={y - 20} width={trackW + 20} height={54}
        fill="transparent" style={{ cursor: disabled ? 'default' : 'grab', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      {/* Thumb */}
      <circle cx={cx} cy={y + 4} r={14}
        fill={disabled ? '#CBD5E1' : '#F472B6'} stroke="white" strokeWidth={3}
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))', pointerEvents: 'none' }}
      />
      <text x={cx} y={y + 8} textAnchor="middle" fill="white" fontSize={11} fontWeight={800}
        style={{ pointerEvents: 'none' }}>
        {value}
      </text>
    </g>
  )
}

// ─── Draggable Remainder Apple (yes_no task) ────────────────
function DraggableApple({ svgRef, startX, startY, targetBox, onDrop }) {
  const [pos, setPos] = useState({ x: startX, y: startY })
  const [dropped, setDropped] = useState(false)
  const [bouncing, setBouncing] = useState(false)
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })

  const getSvgPos = useCallback((e) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
    return { x: svgP.x, y: svgP.y }
  }, [svgRef])

  const handleDown = useCallback((e) => {
    if (dropped || bouncing) return
    e.preventDefault()
    e.target.setPointerCapture(e.pointerId)
    dragging.current = true
    const svgP = getSvgPos(e)
    offset.current = { x: pos.x - svgP.x, y: pos.y - svgP.y }
  }, [dropped, bouncing, getSvgPos, pos])

  const handleMove = useCallback((e) => {
    if (!dragging.current) return
    e.preventDefault()
    const svgP = getSvgPos(e)
    setPos({ x: svgP.x + offset.current.x, y: svgP.y + offset.current.y })
  }, [getSvgPos])

  const handleUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    // Check if dropped onto the target box area
    const dx = pos.x - targetBox.x
    const dy = pos.y - targetBox.y
    if (Math.abs(dx) < targetBox.w / 2 + 15 && Math.abs(dy) < targetBox.h / 2 + 15) {
      // Bounce back — can't fit!
      setBouncing(true)
      onDrop(false)
      setTimeout(() => {
        setPos({ x: startX, y: startY })
        setBouncing(false)
      }, 500)
    } else {
      setPos({ x: startX, y: startY })
    }
  }, [pos, targetBox, startX, startY, onDrop])

  return (
    <g style={{ cursor: dropped ? 'default' : 'grab', touchAction: 'none' }}
      onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp}>
      <circle cx={pos.x} cy={pos.y} r={10} fill="#EF4444"
        stroke={bouncing ? '#FF0000' : 'transparent'} strokeWidth={bouncing ? 3 : 0}>
        {bouncing && (
          <animate attributeName="r" values="10;14;10" dur="0.3s" repeatCount="1" />
        )}
      </circle>
      <circle cx={pos.x - 3} cy={pos.y - 3} r={3} fill="rgba(255,255,255,0.3)" />
    </g>
  )
}

// ─── Factory Scene SVG ───────────────────────────────────────
function FactoryScene({ svgRef, task, sliderValue, foundFactors, lang, onSliderChange, solved,
  remainderDropped, onRemainderDrop }) {
  const W = 380, H = 300
  const isGcf = task.type === 'gcf'
  const isYesNo = task.type === 'yes_no'
  const beltY = 110

  // Compute packing for current slider value
  const computePacking = (total, boxSize) => {
    const fullBoxes = Math.floor(total / boxSize)
    const remainder = total % boxSize
    return { fullBoxes, remainder, isFactor: remainder === 0 }
  }

  let packing1 = null, packing2 = null
  if (isGcf && sliderValue) {
    packing1 = computePacking(task.groups[0], sliderValue)
    packing2 = computePacking(task.groups[1], sliderValue)
  } else if (!isGcf && !isYesNo && sliderValue) {
    packing1 = computePacking(task.totalApples, sliderValue)
  } else if (isYesNo) {
    packing1 = computePacking(task.totalApples, task.boxSize)
  }

  // Render boxes for a group
  const renderBoxes = (packing, boxSize, startX, startY, maxW) => {
    if (!packing) return null
    const total = packing.fullBoxes + (packing.remainder > 0 ? 1 : 0)
    if (total === 0) return null
    const boxW = Math.min(50, (maxW - 10) / total)
    const boxes = []
    for (let i = 0; i < packing.fullBoxes && i < 10; i++) {
      boxes.push(
        <PackingBox key={i} x={startX + i * (boxW + 3)} y={startY}
          boxSize={boxSize} filledCount={boxSize} width={boxW} height={34} />
      )
    }
    if (packing.remainder > 0) {
      boxes.push(
        <PackingBox key="rem" x={startX + packing.fullBoxes * (boxW + 3)} y={startY}
          boxSize={boxSize} filledCount={packing.remainder} width={boxW} height={34} />
      )
    }
    return boxes
  }

  // Apple positions
  const applePositions = (count, sx, sy, cols = 6) => {
    const sp = 18
    return Array.from({ length: count }, (_, i) => ({
      x: sx + (i % cols) * sp,
      y: sy + Math.floor(i / cols) * sp,
    }))
  }

  const bothFit = isGcf && packing1 && packing2 && packing1.isFactor && packing2.isFactor

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', maxWidth: 420, display: 'block', margin: '0 auto', touchAction: 'none' }}>
      {/* Background */}
      <rect x={0} y={0} width={W} height={H} fill="#F8FAFC" rx={8} />
      {[40, 80].map(y => (
        <line key={y} x1={0} y1={y} x2={W} y2={y} stroke="#E2E8F0" strokeWidth={0.5} />
      ))}

      {/* Factory sign */}
      <rect x={W / 2 - 60} y={4} width={120} height={18} rx={4} fill="#F472B6" />
      <text x={W / 2} y={16} textAnchor="middle" fill="white" fontSize={10} fontWeight={800} fontFamily="Nunito, sans-serif">
        {lang === 'zh' ? '因数工厂' : 'FACTOR FACTORY'}
      </text>

      {/* Gears */}
      <g transform="translate(20, 12)" opacity={0.3}>
        <circle cx={0} cy={0} r={8} fill="none" stroke="#94A3B8" strokeWidth={2} />
        <animateTransform attributeName="transform" type="rotate" from="0 20 12" to="360 20 12" dur="8s" repeatCount="indefinite" />
      </g>

      {/* GCF labels */}
      {isGcf && (
        <>
          <line x1={W / 2} y1={25} x2={W / 2} y2={beltY - 5} stroke="#CBD5E1" strokeWidth={1} strokeDasharray="4,3" />
          <text x={W / 4} y={28} textAnchor="middle" fill="#64748B" fontSize={12} fontWeight={700}>
            {task.groups[0]} {lang === 'zh' ? '个' : ''}
          </text>
          <text x={3 * W / 4} y={28} textAnchor="middle" fill="#64748B" fontSize={12} fontWeight={700}>
            {task.groups[1]} {lang === 'zh' ? '个' : ''}
          </text>
        </>
      )}

      {/* Apples */}
      {isGcf ? (
        <>
          {applePositions(task.groups[0], 30, 36, 5).map((p, i) => (
            <Apple key={`a1-${i}`} x={p.x} y={p.y} dimmed={packing1?.isFactor} />
          ))}
          {applePositions(task.groups[1], 220, 36, 5).map((p, i) => (
            <Apple key={`a2-${i}`} x={p.x} y={p.y} dimmed={packing2?.isFactor} />
          ))}
        </>
      ) : (
        <>
          {applePositions(
            isYesNo ? task.totalApples : task.totalApples,
            W / 2 - (Math.min(isYesNo ? task.totalApples : task.totalApples, 6) * 18) / 2 + 9, 36, 6
          ).map((p, i) => (
            <Apple key={`a-${i}`} x={p.x} y={p.y} dimmed={packing1?.isFactor} />
          ))}
        </>
      )}

      {/* Conveyor belt */}
      <rect x={10} y={beltY} width={W - 20} height={16} rx={3} fill="#475569" />
      <line x1={10} y1={beltY + 5} x2={W - 10} y2={beltY + 5} stroke="#64748B" strokeWidth={0.5} strokeDasharray="8,6">
        <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1s" repeatCount="indefinite" />
      </line>
      <line x1={10} y1={beltY + 11} x2={W - 10} y2={beltY + 11} stroke="#64748B" strokeWidth={0.5} strokeDasharray="8,6">
        <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1s" repeatCount="indefinite" />
      </line>
      {[50, 120, 190, 260, 330].map(cx => (
        <circle key={cx} cx={cx} cy={beltY + 8} r={5} fill="#94A3B8" stroke="#334155" strokeWidth={0.8}>
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${cx} ${beltY + 8}`} to={`360 ${cx} ${beltY + 8}`} dur="2s" repeatCount="indefinite" />
        </circle>
      ))}

      {/* Box area for slider tasks */}
      {!isYesNo && sliderValue && (
        <g>
          {!isGcf && (
            <>
              <text x={W / 2} y={beltY + 32} textAnchor="middle" fill="#64748B" fontSize={11} fontWeight={600}>
                {task.totalApples} ÷ {sliderValue} = {packing1.fullBoxes}{packing1.remainder > 0 ? ` R${packing1.remainder}` : ''}
              </text>
              {renderBoxes(packing1, sliderValue, 20, beltY + 38, W - 40)}
              <text x={W / 2} y={beltY + 82} textAnchor="middle"
                fill={packing1.isFactor ? '#059669' : '#DC2626'}
                fontSize={13} fontWeight={800}>
                {packing1.isFactor
                  ? (lang === 'zh' ? '✅ 刚好装满！' : '✅ Perfect fit!')
                  : (lang === 'zh' ? `❌ 余 ${packing1.remainder} 个` : `❌ ${packing1.remainder} left over`)}
              </text>
            </>
          )}
          {isGcf && packing1 && packing2 && (
            <>
              <text x={W / 4} y={beltY + 32} textAnchor="middle" fill="#64748B" fontSize={10} fontWeight={600}>
                {task.groups[0]} ÷ {sliderValue} = {packing1.fullBoxes}{packing1.remainder > 0 ? `R${packing1.remainder}` : ''}
              </text>
              <text x={3 * W / 4} y={beltY + 32} textAnchor="middle" fill="#64748B" fontSize={10} fontWeight={600}>
                {task.groups[1]} ÷ {sliderValue} = {packing2.fullBoxes}{packing2.remainder > 0 ? `R${packing2.remainder}` : ''}
              </text>
              {renderBoxes(packing1, sliderValue, 10, beltY + 38, W / 2 - 15)}
              {renderBoxes(packing2, sliderValue, W / 2 + 5, beltY + 38, W / 2 - 15)}
              <text x={W / 4} y={beltY + 82} textAnchor="middle"
                fill={packing1.isFactor ? '#059669' : '#DC2626'} fontSize={11} fontWeight={800}>
                {packing1.isFactor ? '✅' : `❌ R${packing1.remainder}`}
              </text>
              <text x={3 * W / 4} y={beltY + 82} textAnchor="middle"
                fill={packing2.isFactor ? '#059669' : '#DC2626'} fontSize={11} fontWeight={800}>
                {packing2.isFactor ? '✅' : `❌ R${packing2.remainder}`}
              </text>
              {bothFit && (
                <text x={W / 2} y={beltY + 98} textAnchor="middle" fill="#D97706" fontSize={14} fontWeight={900}>
                  {lang === 'zh' ? '✨ 两组都装满！' : '✨ Both fit!'}
                </text>
              )}
            </>
          )}
        </g>
      )}

      {/* Yes/No task: show fixed packing + draggable remainder */}
      {isYesNo && (
        <g>
          <text x={W / 2} y={beltY + 32} textAnchor="middle" fill="#64748B" fontSize={11} fontWeight={600}>
            {task.totalApples} ÷ {task.boxSize} = ?
          </text>
          {renderBoxes(packing1, task.boxSize, 20, beltY + 38, W - 40)}
          {/* Remainder apples to drag */}
          {task.remainder > 0 && !remainderDropped && (
            <>
              <text x={W / 2} y={beltY + 86} textAnchor="middle" fill="#DC2626" fontSize={11} fontWeight={700}>
                {lang === 'zh' ? `⬆ 拖余下的 ${task.remainder} 个苹果试试！` : `⬆ Drag the ${task.remainder} leftover apples into a box!`}
              </text>
              {Array.from({ length: task.remainder }).map((_, i) => (
                <DraggableApple key={i} svgRef={svgRef}
                  startX={W / 2 - (task.remainder - 1) * 14 + i * 28}
                  startY={beltY + 106}
                  targetBox={{
                    x: 20 + packing1.fullBoxes * 53 + 25,
                    y: beltY + 55,
                    w: 50, h: 34,
                  }}
                  onDrop={onRemainderDrop}
                />
              ))}
            </>
          )}
          {remainderDropped && (
            <text x={W / 2} y={beltY + 96} textAnchor="middle" fill="#DC2626" fontSize={13} fontWeight={900}>
              {lang === 'zh' ? '❌ 装不下！不是因数！' : "❌ Won't fit! NOT a factor!"}
            </text>
          )}
        </g>
      )}

      {/* Found factors badges */}
      {task.type === 'select_factors' && foundFactors.length > 0 && (
        <g>
          {foundFactors.sort((a, b) => a - b).map((f, i) => (
            <g key={f} transform={`translate(${20 + i * 36}, ${H - 24})`}>
              <rect x={0} y={0} width={30} height={20} rx={10} fill="#D1FAE5" stroke="#4ECDC4" strokeWidth={1.5} />
              <text x={15} y={14} textAnchor="middle" fill="#059669" fontSize={11} fontWeight={800}>{f}</text>
            </g>
          ))}
        </g>
      )}

      {/* Slider (select_factors and gcf) */}
      {!isYesNo && (
        <Slider svgRef={svgRef}
          min={task.sliderRange[0]} max={task.sliderRange[1]}
          value={sliderValue || task.sliderRange[0]}
          onChange={onSliderChange}
          y={H - 50}
          width={W}
          disabled={solved}
        />
      )}
    </svg>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function FactorFactory({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'
  const svgRef = useRef(null)

  const [taskIndex, setTaskIndex] = useState(0)
  const [solved, setSolved] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)

  const [foundFactors, setFoundFactors] = useState([])
  const [testedValues, setTestedValues] = useState(new Set())
  const [sliderValue, setSliderValue] = useState(null)
  const [remainderDropped, setRemainderDropped] = useState(false)

  // Lock-in timer for slider: when user stops sliding for 600ms, lock in the value
  const lockTimer = useRef(null)
  const lastSliderValue = useRef(null)

  const task = TASKS[taskIndex]

  // Initialize slider to first value
  useEffect(() => {
    if (task.type !== 'yes_no') {
      setSliderValue(task.sliderRange[0])
    }
  }, [taskIndex, task])

  // Handle slider change with auto-lock
  const handleSliderChange = useCallback((val) => {
    if (solved) return
    setSliderValue(val)
    lastSliderValue.current = val

    if (lockTimer.current) clearTimeout(lockTimer.current)
    lockTimer.current = setTimeout(() => {
      // Lock in this value
      const currentTask = TASKS[taskIndex]
      if (currentTask.type === 'select_factors') {
        handleSelectFactorLock(val, currentTask)
      } else if (currentTask.type === 'gcf') {
        handleGcfLock(val, currentTask)
      }
    }, 600)
  }, [solved, taskIndex])

  // Lock in a slider value for select_factors
  const handleSelectFactorLock = useCallback((val, t) => {
    if (foundFactors.includes(val) || testedValues.has(val)) return
    setTestedValues(prev => new Set([...prev, val]))

    const remainder = t.totalApples % val
    if (remainder === 0) {
      const newFound = [...foundFactors, val]
      setFoundFactors(newFound)
      if (newFound.length === t.answers.length) {
        setTimeout(() => {
          setSolved(true)
          setShowExplanation(true)
        }, 400)
      }
    } else {
      setMistakes(m => m + 1)
      setShowHint(true)
    }
  }, [foundFactors, testedValues])

  // Lock in a slider value for gcf
  const handleGcfLock = useCallback((val, t) => {
    if (testedValues.has(val)) return
    setTestedValues(prev => new Set([...prev, val]))

    const r1 = t.groups[0] % val
    const r2 = t.groups[1] % val
    if (r1 === 0 && r2 === 0 && val === t.answer) {
      setSolved(true)
      setShowExplanation(true)
    } else if (r1 !== 0 || r2 !== 0) {
      setMistakes(m => m + 1)
      setShowHint(true)
    }
    // If both divide but not the biggest — no penalty, keep exploring
  }, [testedValues])

  // Yes/No: remainder drag result
  const handleRemainderDrop = useCallback((fits) => {
    if (!fits) {
      setRemainderDropped(true)
      setTimeout(() => {
        setSolved(true)
        setShowExplanation(true)
      }, 800)
    }
  }, [])

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
      setFoundFactors([])
      setTestedValues(new Set())
      setSliderValue(null)
      setRemainderDropped(false)
    }
  }, [taskIndex, mistakes, onComplete])

  // Hints
  const hints = task.type === 'select_factors'
    ? [
        lang === 'zh' ? `拖动滑块到不同数字，看能不能把 ${task.totalApples} 个苹果恰好装满！` : `Drag the slider to different numbers — can ${task.totalApples} apples fit perfectly?`,
        lang === 'zh' ? '能整除的（没余数）就是因数！' : 'If it divides evenly (no remainder), it\'s a factor!',
      ]
    : task.type === 'yes_no'
      ? [
          lang === 'zh' ? '试试把多余的苹果拖进箱子！' : 'Try dragging the leftover apples into a box!',
          lang === 'zh' ? '如果塞不进去，说明不是因数！' : "If they don't fit, it's NOT a factor!",
        ]
      : [
          lang === 'zh' ? '拖动滑块测试每个数字——找到两组都能整除的最大数！' : 'Drag the slider to test each number — find the biggest that divides BOTH!',
          lang === 'zh' ? '两组都是 ✅ 的才行，而且要最大的！' : 'Both groups need ✅, and pick the BIGGEST!',
        ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 12,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>🏭</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '因数工厂' : 'Factor Factory'}
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
        {task.type === 'select_factors' && (
          <div style={{ marginTop: 6, fontSize: 14, color: '#64748B' }}>
            🎯 {lang === 'zh' ? '已找到' : 'Found'}: {foundFactors.length}/{task.answers.length}
          </div>
        )}
      </div>

      {/* Factory Scene with integrated slider */}
      <div className="card" style={{ maxWidth: 460, width: '100%', padding: '12px 8px' }}>
        <FactoryScene
          svgRef={svgRef}
          task={task}
          sliderValue={sliderValue}
          foundFactors={foundFactors}
          lang={lang}
          onSliderChange={handleSliderChange}
          solved={solved}
          remainderDropped={remainderDropped}
          onRemainderDrop={handleRemainderDrop}
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
              ? (lang === 'zh' ? '下一批！ →' : 'Next shipment! →')
              : (lang === 'zh' ? '工厂完工！' : 'Factory complete!')}
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
              : task.type === 'yes_no'
                ? (lang === 'zh' ? '拖拽剩余的苹果试试能不能塞进箱子！' : 'Drag the leftover apples — can they fit in the box?')
                : (lang === 'zh' ? '拖动粉色滑块试试不同的箱子大小！' : 'Drag the pink slider to try different box sizes!')
          }
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
