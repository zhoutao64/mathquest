import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    type: 'perfect',
    totalTiles: 4,
    answer: 2,
    maxDim: 4,
    instruction: { en: '4 tiles in the garden! Drag the corner to build a square that fits them all.', zh: '花园里有 4 块瓷砖！拖动角落，拼成一个正方形。' },
    explanation: { en: '\u221A4 = 2. A 2\u00D72 square has exactly 4 tiles. The side length IS the square root!', zh: '\u221A4 = 2。一个 2\u00D72 的正方形恰好有 4 块瓷砖。边长就是平方根！' },
  },
  {
    type: 'perfect',
    totalTiles: 9,
    answer: 3,
    maxDim: 5,
    instruction: { en: '9 tiles this time! Can you build a perfect square?', zh: '这次有 9 块！你能拼出完美正方形吗？' },
    explanation: { en: '\u221A9 = 3. Three rows of three \u2014 a 3\u00D73 perfect square!', zh: '\u221A9 = 3。三行三列——一个 3\u00D73 的完美正方形！' },
  },
  {
    type: 'perfect',
    totalTiles: 16,
    answer: 4,
    maxDim: 6,
    instruction: { en: '16 tiles! The garden is growing. Find the side length.', zh: '16 块瓷砖！花园在变大。找到边长。' },
    explanation: { en: '\u221A16 = 4. The square root reverses squaring: 4\u00B2 = 16, so \u221A16 = 4.', zh: '\u221A16 = 4。平方根是平方的逆运算：4\u00B2 = 16，所以 \u221A16 = 4。' },
  },
  {
    type: 'perfect',
    totalTiles: 25,
    answer: 5,
    maxDim: 7,
    instruction: { en: "25 tiles! You're a master gardener now!", zh: '25 块瓷砖！你是大师级园丁了！' },
    explanation: { en: '\u221A25 = 5. Notice the pattern: 1, 4, 9, 16, 25 are all perfect squares!', zh: '\u221A25 = 5。注意规律：1、4、9、16、25 都是完全平方数！' },
  },
  {
    type: 'imperfect',
    totalTiles: 12,
    answer: null,
    maxDim: 5,
    instruction: { en: '12 tiles. Can you make a perfect square? Try all sizes!', zh: '12 块瓷砖。能拼成完美正方形吗？试试所有大小！' },
    explanation: { en: '12 is NOT a perfect square! \u221A12 is between 3 and 4. Not all numbers have neat square roots.', zh: '12 不是完全平方数！\u221A12 在 3 和 4 之间。不是所有数字都有整数平方根。' },
  },
]

// ─── Tile component ──────────────────────────────────────────
function Tile({ x, y, size, placed, remainder }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={-size / 2} y={-size / 2} width={size} height={size} rx={2}
        fill={remainder ? '#FCA5A5' : placed ? '#86EFAC' : '#A3E635'}
        stroke={remainder ? '#EF4444' : '#15803D'} strokeWidth={1}
        opacity={placed ? 1 : 0.7}>
        {remainder && (
          <animate attributeName="opacity" values="0.7;1;0.7" dur="0.8s" repeatCount="indefinite" />
        )}
      </rect>
      {placed && (
        <text x={0} y={2} textAnchor="middle" dominantBaseline="middle" fill="#15803D" fontSize={size * 0.45} fontWeight={800}>
          {'\uD83C\uDF3F'}
        </text>
      )}
    </g>
  )
}

// ─── Garden Scene SVG ────────────────────────────────────────
function GardenScene({ svgRef, task, sideLength, onDrag, solved, triedSizes, lang }) {
  const W = 400, H = 340
  const gridOriginX = 60
  const gridOriginY = 50
  const cellSize = Math.min(36, (W - 140) / task.maxDim)
  const gridW = sideLength * cellSize
  const gridH = sideLength * cellSize
  const placed = sideLength * sideLength
  const remainder = Math.max(0, task.totalTiles - placed)
  const overflow = Math.max(0, placed - task.totalTiles)
  const tilesInGrid = Math.min(placed, task.totalTiles)
  const isFit = sideLength * sideLength === task.totalTiles

  const dragging = useRef(false)

  const getSvgPos = useCallback((e) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    return pt.matrixTransform(svg.getScreenCTM().inverse())
  }, [svgRef])

  const handleDown = useCallback((e) => {
    if (solved) return
    e.preventDefault()
    e.target.setPointerCapture(e.pointerId)
    dragging.current = true
  }, [solved])

  const handleMove = useCallback((e) => {
    if (!dragging.current) return
    e.preventDefault()
    const pos = getSvgPos(e)
    const dx = pos.x - gridOriginX
    const dy = pos.y - gridOriginY
    const dist = Math.max(dx, dy)
    const newSide = Math.max(1, Math.min(task.maxDim, Math.round(dist / cellSize)))
    onDrag(newSide)
  }, [getSvgPos, cellSize, task.maxDim, onDrag])

  const handleUp = useCallback(() => {
    dragging.current = false
  }, [])

  const gridTiles = []
  for (let r = 0; r < sideLength; r++) {
    for (let c = 0; c < sideLength; c++) {
      const idx = r * sideLength + c
      if (idx < tilesInGrid) {
        gridTiles.push(
          <Tile key={`g-${r}-${c}`}
            x={gridOriginX + c * cellSize + cellSize / 2}
            y={gridOriginY + r * cellSize + cellSize / 2}
            size={cellSize - 4} placed={true} />
        )
      }
    }
  }

  const remainderTiles = []
  for (let i = 0; i < remainder; i++) {
    remainderTiles.push(
      <Tile key={`r-${i}`}
        x={gridOriginX + i * (cellSize * 0.7) + cellSize / 2}
        y={gridOriginY + gridH + 30 + cellSize / 2}
        size={cellSize - 4} placed={false} remainder={true} />
    )
  }

  const handleX = gridOriginX + gridW
  const handleY = gridOriginY + gridH

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', maxWidth: 440, display: 'block', margin: '0 auto', touchAction: 'none' }}>
      <rect x={0} y={0} width={W} height={H} fill="#FEF9EF" rx={8} />
      <rect x={gridOriginX - 10} y={gridOriginY - 10} width={task.maxDim * cellSize + 20} height={task.maxDim * cellSize + 20}
        fill="#D4A373" rx={6} opacity={0.3} />

      <rect x={W / 2 - 55} y={4} width={110} height={18} rx={4} fill="#4ECDC4" />
      <text x={W / 2} y={16} textAnchor="middle" fill="white" fontSize={10} fontWeight={800}>
        {lang === 'zh' ? '平方根花园' : 'ROOT GARDEN'}
      </text>

      <rect x={gridOriginX} y={gridOriginY} width={gridW} height={gridH}
        fill="none" stroke={isFit ? '#4ECDC4' : '#94A3B8'} strokeWidth={isFit ? 3 : 1.5}
        strokeDasharray={isFit ? '0' : '6,3'} rx={2} />

      {Array.from({ length: sideLength + 1 }, (_, i) => (
        <g key={`line-${i}`}>
          <line x1={gridOriginX + i * cellSize} y1={gridOriginY}
            x2={gridOriginX + i * cellSize} y2={gridOriginY + gridH}
            stroke="#CBD5E1" strokeWidth={0.5} />
          <line x1={gridOriginX} y1={gridOriginY + i * cellSize}
            x2={gridOriginX + gridW} y2={gridOriginY + i * cellSize}
            stroke="#CBD5E1" strokeWidth={0.5} />
        </g>
      ))}

      {overflow > 0 && Array.from({ length: overflow }, (_, i) => {
        const idx = tilesInGrid + i
        const r = Math.floor(idx / sideLength)
        const c = idx % sideLength
        return (
          <rect key={`empty-${i}`}
            x={gridOriginX + c * cellSize + 2} y={gridOriginY + r * cellSize + 2}
            width={cellSize - 4} height={cellSize - 4} rx={2}
            fill="none" stroke="#94A3B8" strokeWidth={1} strokeDasharray="3,2" />
        )
      })}

      {gridTiles}
      {remainderTiles}

      <text x={gridOriginX + gridW / 2} y={gridOriginY - 16} textAnchor="middle"
        fill="#1E293B" fontSize={16} fontWeight={800}>{sideLength}</text>
      <text x={gridOriginX - 16} y={gridOriginY + gridH / 2 + 5} textAnchor="middle"
        fill="#1E293B" fontSize={16} fontWeight={800}>{sideLength}</text>

      <text x={W - 40} y={40} textAnchor="middle" fill="#64748B" fontSize={13} fontWeight={700}>
        {sideLength} x {sideLength} = {sideLength * sideLength}
      </text>
      <text x={W - 40} y={58} textAnchor="middle"
        fill={isFit ? '#059669' : '#DC2626'} fontSize={12} fontWeight={600}>
        {lang === 'zh' ? `瓷砖: ${task.totalTiles}` : `Tiles: ${task.totalTiles}`}
      </text>

      {remainder > 0 && (
        <text x={gridOriginX + remainder * cellSize * 0.35 + cellSize / 2} y={gridOriginY + gridH + 20}
          textAnchor="middle" fill="#DC2626" fontSize={11} fontWeight={700}>
          {lang === 'zh' ? `剩余 ${remainder} 块` : `${remainder} left over`}
        </text>
      )}
      {overflow > 0 && (
        <text x={gridOriginX + gridW / 2} y={gridOriginY + gridH + 20}
          textAnchor="middle" fill="#F59E0B" fontSize={11} fontWeight={700}>
          {lang === 'zh' ? `还缺 ${overflow} 块` : `Need ${overflow} more`}
        </text>
      )}
      {isFit && (
        <text x={gridOriginX + gridW / 2} y={gridOriginY + gridH + 24}
          textAnchor="middle" fill="#059669" fontSize={14} fontWeight={900}>
          {lang === 'zh' ? '\u2728 刚好填满！' : '\u2728 Perfect fit!'}
        </text>
      )}

      {task.type === 'imperfect' && triedSizes.size > 0 && (
        <g>
          <text x={W - 40} y={80} textAnchor="middle" fill="#64748B" fontSize={10} fontWeight={600}>
            {lang === 'zh' ? '已试:' : 'Tried:'}
          </text>
          {[...triedSizes].map((s, i) => (
            <g key={s} transform={`translate(${W - 55 + i * 28}, 90)`}>
              <rect x={0} y={0} width={24} height={18} rx={9} fill="#FEE2E2" stroke="#EF4444" strokeWidth={1} />
              <text x={12} y={13} textAnchor="middle" fill="#DC2626" fontSize={10} fontWeight={800}>{s}x{s}</text>
            </g>
          ))}
        </g>
      )}

      {!solved && (
        <g style={{ cursor: 'grab', touchAction: 'none' }}
          onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp}>
          <circle cx={handleX} cy={handleY} r={24} fill="transparent" />
          <circle cx={handleX} cy={handleY} r={14}
            fill="#4ECDC4" stroke="white" strokeWidth={3}
            style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}>
            <animate attributeName="r" values="14;16;14" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <path d={`M ${handleX - 4} ${handleY + 4} L ${handleX + 4} ${handleY + 4} L ${handleX + 4} ${handleY - 4}`}
            fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function RootGarden({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'
  const svgRef = useRef(null)

  const [taskIndex, setTaskIndex] = useState(0)
  const [solved, setSolved] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [sideLength, setSideLength] = useState(1)
  const [triedSizes, setTriedSizes] = useState(new Set())
  const [showImperfectConfirm, setShowImperfectConfirm] = useState(false)

  const task = TASKS[taskIndex]
  const lockTimer = useRef(null)

  const handleDrag = useCallback((newSide) => {
    if (solved) return
    setSideLength(newSide)

    if (lockTimer.current) clearTimeout(lockTimer.current)
    lockTimer.current = setTimeout(() => {
      const currentTask = TASKS[taskIndex]
      if (currentTask.type === 'perfect') {
        if (newSide * newSide === currentTask.totalTiles) {
          setSolved(true)
          setShowExplanation(true)
        }
      } else {
        setTriedSizes(prev => {
          const next = new Set(prev)
          next.add(newSide)
          if (next.size >= 2) setShowImperfectConfirm(true)
          return next
        })
      }
    }, 500)
  }, [solved, taskIndex])

  const handleImperfectConfirm = useCallback(() => {
    setSolved(true)
    setShowExplanation(true)
  }, [])

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
      setSideLength(1)
      setTriedSizes(new Set())
      setShowImperfectConfirm(false)
    }
  }, [taskIndex, mistakes, onComplete])

  const hints = task.type === 'perfect'
    ? [
        lang === 'zh' ? '拖动绿色角落调整网格大小！' : 'Drag the green corner to resize the grid!',
        lang === 'zh' ? `试试 ${task.answer}\u00D7${task.answer}——等于 ${task.totalTiles} 吗？` : `Try ${task.answer}\u00D7${task.answer} \u2014 does it equal ${task.totalTiles}?`,
      ]
    : [
        lang === 'zh' ? '试试所有可能的边长！' : 'Try every possible side length!',
        lang === 'zh' ? '如果没有一个能刚好填满，那就不是完全平方数！' : "If none fit perfectly, it's NOT a perfect square!",
      ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 12,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>{'\uD83C\uDF31'}</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '平方根花园' : 'Root Garden'}
        </h2>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>{taskIndex + 1} / {TASKS.length}</div>
      </div>

      <div className="card" style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
        <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', fontWeight: 600, color: '#1E293B' }}>
          {task.instruction[lang]}
        </div>
      </div>

      <div className="card" style={{ maxWidth: 460, width: '100%', padding: '12px 8px' }}>
        <GardenScene svgRef={svgRef} task={task} sideLength={sideLength} onDrag={handleDrag}
          solved={solved} triedSizes={triedSizes} lang={lang} />
      </div>

      {task.type === 'imperfect' && showImperfectConfirm && !solved && (
        <button className="btn btn-primary" onClick={handleImperfectConfirm}
          style={{ animation: 'bounce-in 0.4s' }}>
          {lang === 'zh' ? '\u2753 没有完美正方形！' : '\u2753 No perfect square exists!'}
        </button>
      )}

      {showExplanation && (
        <div className="card" style={{
          maxWidth: 400, width: '100%', textAlign: 'center',
          background: '#E0FFF8', border: '2px solid #4ECDC4', animation: 'bounce-in 0.4s',
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>{'\uD83C\uDF31'}</div>
          <p style={{ fontSize: 15, color: '#1E293B', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
            {task.explanation[lang]}
          </p>
          <button className="btn btn-primary" onClick={handleNext} style={{ marginTop: 16 }}>
            {taskIndex < TASKS.length - 1
              ? (lang === 'zh' ? '下一块花圃！ \u2192' : 'Next garden bed! \u2192')
              : (lang === 'zh' ? '花园完成！' : 'Garden complete!')}
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
          message={solved ? task.explanation[lang]
            : (lang === 'zh' ? '拖动绿色角落调整正方形大小，让瓷砖刚好填满！' : 'Drag the green corner to resize the square until all tiles fit!')}
          hints={hints} showHint={showHint} />
      </div>
    </div>
  )
}
