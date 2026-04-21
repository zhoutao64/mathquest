import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Constants ───────────────────────────────────────────────
const SQRT2 = 1.41421356
const PI_VAL = 3.14159265

const TASKS = [
  {
    type: 'locate',
    target: SQRT2,
    range: [0, 3],
    label: '\u221A2',
    maxZoom: 0,
    tolerance: 0.5,
    instruction: { en: 'Where does \u221A2 live? Drag the magnifying glass between 1 and 2.', zh: '\u221A2 住在哪里？把放大镜拖到 1 和 2 之间。' },
    explanation: { en: '\u221A2 is between 1 and 2, approximately 1.414... The digits never end and never repeat!', zh: '\u221A2 在 1 和 2 之间，约 1.414...。小数位永远不会结束，也不会循环！' },
  },
  {
    type: 'zoom_in',
    target: SQRT2,
    range: [1, 2],
    label: '\u221A2',
    maxZoom: 3,
    instruction: { en: 'Zoom in! Drag the zoom slider up to reveal more digits of \u221A2.', zh: '放大！拖动缩放滑块来揭示 \u221A2 的更多小数位。' },
    explanation: { en: 'Each zoom shows one more decimal: 1.4 \u2192 1.41 \u2192 1.414... but there\'s ALWAYS more. Infinite non-repeating digits!', zh: '每次放大多显示一位小数：1.4 \u2192 1.41 \u2192 1.414...但永远有更多。无限不循环小数！' },
  },
  {
    type: 'compare',
    target: SQRT2,
    compareWith: 1.414,
    range: [1.41, 1.42],
    label: '\u221A2 vs 1.414',
    maxZoom: 4,
    instruction: { en: 'Is \u221A2 exactly equal to 1.414? Zoom in to find out!', zh: '\u221A2 恰好等于 1.414 吗？放大看看！' },
    explanation: { en: '\u221A2 \u2260 1.414! At zoom 4: \u221A2 = 1.4142... while 1.414 stops. 1.414\u00B2 = 1.999396, not quite 2!', zh: '\u221A2 \u2260 1.414！放大到第 4 级：\u221A2 = 1.4142...而 1.414 到此为止。1.414\u00B2 = 1.999396，不是 2！' },
  },
  {
    type: 'locate',
    target: PI_VAL,
    range: [2, 4],
    label: '\u03C0',
    maxZoom: 2,
    tolerance: 0.15,
    instruction: { en: 'Now find \u03C0! Drag the glass near 3.14, then zoom in.', zh: '现在找 \u03C0！把放大镜拖到 3.14 附近，然后放大。' },
    explanation: { en: '\u03C0 \u2248 3.14159... Another famous irrational number! The ratio of a circle\'s circumference to its diameter.', zh: '\u03C0 \u2248 3.14159...另一个著名的无理数！它是圆周长与直径之比。' },
  },
  {
    type: 'classify',
    target: 1 / 3,
    range: [0, 1],
    label: '1/3',
    maxZoom: 4,
    answer: 'rational',
    instruction: { en: 'Zoom into 1/3 = 0.333... Does it repeat? Is it rational or irrational?', zh: '放大 1/3 = 0.333...。它循环吗？是有理数还是无理数？' },
    explanation: { en: '1/3 = 0.333... repeating. It DOES repeat forever, so it IS rational! Rational = can be written as a fraction.', zh: '1/3 = 0.333...循环。它确实永远循环，所以它是有理数！有理数 = 能写成分数。' },
  },
]

// ─── Number Line with Magnifying Glass ───────────────────────
function ExplorerScene({ svgRef, task, lensPos, zoomLevel, onLensDrag, onZoomChange, solved, lang }) {
  const W = 400, H = 280
  const lineY = 120
  const lineX1 = 40, lineX2 = 350
  const lineW = lineX2 - lineX1

  const [rangeMin, rangeMax] = task.range
  const rangeSpan = rangeMax - rangeMin

  const valToX = useCallback((v) => lineX1 + ((v - rangeMin) / rangeSpan) * lineW, [rangeMin, rangeSpan])
  const xToVal = useCallback((x) => rangeMin + ((x - lineX1) / lineW) * rangeSpan, [rangeMin, rangeSpan])

  const snap = useCallback((v) => {
    if (zoomLevel === 0) return Math.round(v * 2) / 2
    const p = Math.pow(10, -zoomLevel)
    return Math.round(v / p) * p
  }, [zoomLevel])

  // Tick marks
  const ticks = []
  const tickStep = 1
  for (let v = Math.ceil(rangeMin); v <= rangeMax; v += tickStep) {
    ticks.push(v)
  }

  // Lens
  const lensX = valToX(lensPos)
  const lensR = 42
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
  }, [solved])

  const handleMove = useCallback((e) => {
    if (!dragging.current) return
    e.preventDefault()
    const x = getSvgX(e)
    const val = xToVal(x)
    const snapped = snap(Math.max(rangeMin, Math.min(rangeMax, val)))
    onLensDrag(snapped)
  }, [getSvgX, rangeMin, rangeMax, onLensDrag, snap, xToVal])

  const handleUp = useCallback(() => {
    dragging.current = false
  }, [])

  // Zoom slider
  const zoomSliderX = W - 24
  const zoomSliderY1 = 50
  const zoomSliderY2 = 200
  const zoomSliderH = zoomSliderY2 - zoomSliderY1
  const zoomToY = useCallback((z) => zoomSliderY2 - (z / Math.max(1, task.maxZoom)) * zoomSliderH, [task.maxZoom])
  const yToZoom = useCallback((y) => Math.round(((zoomSliderY2 - y) / zoomSliderH) * task.maxZoom), [task.maxZoom])

  const zoomDragging = useRef(false)

  const getSvgY = useCallback((e) => {
    const svg = svgRef.current
    if (!svg) return 0
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    return pt.matrixTransform(svg.getScreenCTM().inverse()).y
  }, [svgRef])

  const handleZoomDown = useCallback((e) => {
    if (solved || task.maxZoom === 0) return
    e.preventDefault()
    e.target.setPointerCapture(e.pointerId)
    zoomDragging.current = true
  }, [solved, task.maxZoom])

  const handleZoomMove = useCallback((e) => {
    if (!zoomDragging.current) return
    e.preventDefault()
    const y = getSvgY(e)
    const z = Math.max(0, Math.min(task.maxZoom, yToZoom(y)))
    onZoomChange(z)
  }, [getSvgY, task.maxZoom, onZoomChange, yToZoom])

  const handleZoomUp = useCallback(() => {
    zoomDragging.current = false
  }, [])

  const targetStr = task.target.toFixed(Math.max(1, zoomLevel))
  const hasCompare = task.type === 'compare' && task.compareWith !== undefined

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', maxWidth: 440, display: 'block', margin: '0 auto', touchAction: 'none' }}>
      <rect x={0} y={0} width={W} height={H} fill="#0F172A" rx={8} />

      <rect x={W / 2 - 65} y={4} width={130} height={18} rx={4} fill="#60A5FA" />
      <text x={W / 2} y={16} textAnchor="middle" fill="white" fontSize={10} fontWeight={800}>
        {lang === 'zh' ? '无理数探索者' : 'IRRATIONAL EXPLORER'}
      </text>

      {/* Stars */}
      {[30, 80, 150, 250, 310, 55, 190, 340].map((sx, i) => (
        <circle key={i} cx={sx} cy={25 + (i * 7) % 20} r={1} fill="white" opacity={0.3 + (i % 3) * 0.2} />
      ))}

      {/* Number line */}
      <line x1={lineX1} y1={lineY} x2={lineX2} y2={lineY} stroke="#64748B" strokeWidth={2} />
      {ticks.map((v) => {
        const x = valToX(v)
        return (
          <g key={v}>
            <line x1={x} y1={lineY - 8} x2={x} y2={lineY + 8} stroke="#94A3B8" strokeWidth={1.5} />
            <text x={x} y={lineY + 22} textAnchor="middle" fill="#CBD5E1" fontSize={11} fontWeight={600}>{v}</text>
          </g>
        )
      })}

      {/* Target pulsing marker */}
      <line x1={valToX(task.target)} y1={lineY - 12} x2={valToX(task.target)} y2={lineY + 12}
        stroke="#4ECDC4" strokeWidth={2} opacity={0.6}>
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
      </line>
      <text x={valToX(task.target)} y={lineY - 18} textAnchor="middle" fill="#4ECDC4" fontSize={10} fontWeight={700}>
        {task.label}
      </text>

      {/* Compare marker */}
      {hasCompare && (
        <>
          <line x1={valToX(task.compareWith)} y1={lineY - 10} x2={valToX(task.compareWith)} y2={lineY + 10}
            stroke="#F472B6" strokeWidth={2} opacity={0.7} />
          <text x={valToX(task.compareWith)} y={lineY + 34} textAnchor="middle" fill="#F472B6" fontSize={10} fontWeight={700}>
            {task.compareWith}
          </text>
        </>
      )}

      {/* Magnifying glass */}
      <g style={{ cursor: solved ? 'default' : 'grab', touchAction: 'none' }}
        onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp}>
        <circle cx={lensX} cy={lineY} r={lensR + 10} fill="transparent" />
        <circle cx={lensX} cy={lineY} r={lensR}
          fill="rgba(96, 165, 250, 0.1)" stroke="#60A5FA" strokeWidth={3} />
        <line x1={lensX + lensR * 0.7} y1={lineY + lensR * 0.7}
          x2={lensX + lensR * 0.7 + 20} y2={lineY + lensR * 0.7 + 20}
          stroke="#94A3B8" strokeWidth={5} strokeLinecap="round" />
        <text x={lensX} y={lineY - 8} textAnchor="middle" fill="#E2E8F0" fontSize={16} fontWeight={800}>
          {snap(lensPos).toFixed(Math.max(0, zoomLevel))}
        </text>
        <text x={lensX} y={lineY + 14} textAnchor="middle" fill="#60A5FA" fontSize={10} fontWeight={600}>
          {zoomLevel > 0 ? `\u00D7${Math.pow(10, zoomLevel)}` : ''}
        </text>
        {/* Inner ticks at zoom level */}
        {zoomLevel > 0 && (() => {
          const zoomSpan = Math.pow(10, -zoomLevel) * 10
          const zMin = lensPos - zoomSpan / 2
          const zMax = lensPos + zoomSpan / 2
          const zStep = Math.pow(10, -zoomLevel)
          const innerTicks = []
          for (let v = Math.ceil(zMin / zStep) * zStep; v <= zMax; v += zStep) {
            const frac = (v - zMin) / (zMax - zMin)
            const ix = lensX - lensR * 0.7 + frac * lensR * 1.4
            if (ix > lensX - lensR && ix < lensX + lensR) {
              innerTicks.push(
                <line key={v.toFixed(5)} x1={ix} y1={lineY + 20} x2={ix} y2={lineY + 26}
                  stroke="#60A5FA" strokeWidth={0.5} opacity={0.6} />
              )
            }
          }
          return innerTicks
        })()}
      </g>

      {/* Zoom slider */}
      {task.maxZoom > 0 && (
        <g>
          <text x={zoomSliderX} y={zoomSliderY1 - 8} textAnchor="middle" fill="#CBD5E1" fontSize={9} fontWeight={600}>
            {lang === 'zh' ? '缩放' : 'ZOOM'}
          </text>
          <rect x={zoomSliderX - 4} y={zoomSliderY1} width={8} height={zoomSliderH} rx={4} fill="#334155" />
          {Array.from({ length: task.maxZoom + 1 }, (_, i) => (
            <g key={i}>
              <line x1={zoomSliderX - 10} y1={zoomToY(i)} x2={zoomSliderX + 10} y2={zoomToY(i)}
                stroke="#64748B" strokeWidth={1} />
              <text x={zoomSliderX - 16} y={zoomToY(i) + 4} textAnchor="end" fill="#64748B" fontSize={9}>
                {i}x
              </text>
            </g>
          ))}
          <g style={{ cursor: solved ? 'default' : 'grab', touchAction: 'none' }}
            onPointerDown={handleZoomDown} onPointerMove={handleZoomMove} onPointerUp={handleZoomUp}>
            <rect x={zoomSliderX - 16} y={zoomSliderY1 - 20} width={32} height={zoomSliderH + 40}
              fill="transparent" />
            <circle cx={zoomSliderX} cy={zoomToY(zoomLevel)} r={10}
              fill="#60A5FA" stroke="white" strokeWidth={2}
              style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }} />
            <text x={zoomSliderX} y={zoomToY(zoomLevel) + 4} textAnchor="middle" fill="white" fontSize={9} fontWeight={800}>
              {zoomLevel}
            </text>
          </g>
        </g>
      )}

      {/* Bottom info */}
      <text x={W / 2} y={H - 30} textAnchor="middle" fill="#94A3B8" fontSize={11} fontWeight={600}>
        {task.label} {'\u2248'} {targetStr}{zoomLevel < 4 ? '...' : ''}
      </text>
      {zoomLevel >= 2 && task.type !== 'classify' && (
        <text x={W / 2} y={H - 14} textAnchor="middle" fill="#F59E0B" fontSize={10} fontWeight={600}>
          {lang === 'zh' ? '\u221E 永远不会结束...' : '\u221E Never-ending...'}
        </text>
      )}
    </svg>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function IrrationalExplorer({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'
  const svgRef = useRef(null)

  const [taskIndex, setTaskIndex] = useState(0)
  const [solved, setSolved] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [lensPos, setLensPos] = useState(1)
  const [zoomLevel, setZoomLevel] = useState(0)
  const [classifyAnswer, setClassifyAnswer] = useState(null)

  const task = TASKS[taskIndex]
  const lockTimer = useRef(null)

  const handleLensDrag = useCallback((val) => {
    if (solved) return
    setLensPos(val)

    if (lockTimer.current) clearTimeout(lockTimer.current)
    lockTimer.current = setTimeout(() => {
      const t = TASKS[taskIndex]
      if (t.type === 'locate') {
        const tol = t.tolerance || (0.5 * Math.pow(10, -zoomLevel))
        if (Math.abs(val - t.target) < tol && zoomLevel >= (t.maxZoom || 0)) {
          setSolved(true)
          setShowExplanation(true)
        }
      }
    }, 600)
  }, [solved, taskIndex, zoomLevel])

  const handleZoomChange = useCallback((z) => {
    if (solved) return
    setZoomLevel(z)

    const t = TASKS[taskIndex]
    if (t.type === 'zoom_in' && z >= t.maxZoom) {
      const tol = 0.5 * Math.pow(10, -z)
      if (Math.abs(lensPos - t.target) < tol) {
        setTimeout(() => { setSolved(true); setShowExplanation(true) }, 400)
      }
    }
  }, [solved, taskIndex, lensPos])

  const handleCompareAnswer = useCallback((equal) => {
    if (equal === false) {
      setSolved(true)
      setShowExplanation(true)
    } else {
      setMistakes(m => m + 1)
      setShowHint(true)
    }
  }, [])

  const handleClassify = useCallback((type) => {
    setClassifyAnswer(type)
    if (type === task.answer) {
      setSolved(true)
      setShowExplanation(true)
    } else {
      setMistakes(m => m + 1)
      setShowHint(true)
    }
  }, [task])

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
      const nextTask = TASKS[next]
      setLensPos(nextTask.range[0] + (nextTask.range[1] - nextTask.range[0]) / 2)
      setZoomLevel(0)
      setClassifyAnswer(null)
    }
  }, [taskIndex, mistakes, onComplete])

  const hints = [
    lang === 'zh' ? '拖动放大镜沿数轴移动！' : 'Drag the magnifying glass along the number line!',
    lang === 'zh' ? '用右边的缩放滑块放大，看到更多小数位！' : 'Use the zoom slider on the right to see more decimal places!',
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 12,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>{'\uD83D\uDD2C'}</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '无理数探索者' : 'Irrational Explorer'}
        </h2>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>{taskIndex + 1} / {TASKS.length}</div>
      </div>

      <div className="card" style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
        <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', fontWeight: 600, color: '#1E293B' }}>
          {task.instruction[lang]}
        </div>
      </div>

      <div className="card" style={{ maxWidth: 460, width: '100%', padding: '12px 8px', background: '#0F172A' }}>
        <ExplorerScene svgRef={svgRef} task={task} lensPos={lensPos} zoomLevel={zoomLevel}
          onLensDrag={handleLensDrag} onZoomChange={handleZoomChange} solved={solved} lang={lang} />
      </div>

      {task.type === 'compare' && zoomLevel >= 3 && !solved && (
        <div className="card" style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <p style={{ fontWeight: 700, color: '#1E293B', margin: '0 0 12px' }}>
            {lang === 'zh' ? `\u221A2 和 ${task.compareWith} 完全相等吗？` : `Are \u221A2 and ${task.compareWith} exactly equal?`}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn" onClick={() => handleCompareAnswer(true)}
              style={{ padding: '10px 28px', fontSize: 16, fontWeight: 800, border: '2px solid #CBD5E1' }}>
              {lang === 'zh' ? '相等' : 'Equal'}
            </button>
            <button className="btn" onClick={() => handleCompareAnswer(false)}
              style={{ padding: '10px 28px', fontSize: 16, fontWeight: 800, border: '2px solid #4ECDC4' }}>
              {lang === 'zh' ? '不等' : 'Not equal'}
            </button>
          </div>
        </div>
      )}

      {task.type === 'classify' && zoomLevel >= 2 && !solved && (
        <div className="card" style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <p style={{ fontWeight: 700, color: '#1E293B', margin: '0 0 8px' }}>
            {lang === 'zh' ? '0.333... 循环了！这是什么类型的数？' : '0.333... repeats! What type of number is this?'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn" onClick={() => handleClassify('rational')}
              style={{
                padding: '10px 24px', fontSize: 15, fontWeight: 800,
                border: `2px solid ${classifyAnswer === 'rational' && task.answer !== 'rational' ? '#EF4444' : '#4ECDC4'}`,
                background: classifyAnswer === 'rational' && task.answer !== 'rational' ? '#FEE2E2' : '#fff',
              }}>
              {lang === 'zh' ? '有理数' : 'Rational'}
            </button>
            <button className="btn" onClick={() => handleClassify('irrational')}
              style={{
                padding: '10px 24px', fontSize: 15, fontWeight: 800,
                border: `2px solid ${classifyAnswer === 'irrational' && task.answer !== 'irrational' ? '#EF4444' : '#F472B6'}`,
                background: classifyAnswer === 'irrational' && task.answer !== 'irrational' ? '#FEE2E2' : '#fff',
              }}>
              {lang === 'zh' ? '无理数' : 'Irrational'}
            </button>
          </div>
        </div>
      )}

      {showExplanation && (
        <div className="card" style={{
          maxWidth: 400, width: '100%', textAlign: 'center',
          background: '#E0FFF8', border: '2px solid #4ECDC4', animation: 'bounce-in 0.4s',
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>{'\uD83D\uDD2C'}</div>
          <p style={{ fontSize: 15, color: '#1E293B', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
            {task.explanation[lang]}
          </p>
          <button className="btn btn-primary" onClick={handleNext} style={{ marginTop: 16 }}>
            {taskIndex < TASKS.length - 1
              ? (lang === 'zh' ? '继续探索！ \u2192' : 'Keep exploring! \u2192')
              : (lang === 'zh' ? '探索完成！' : 'Exploration complete!')}
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
            : (lang === 'zh' ? '拖动放大镜，然后用缩放滑块放大看更多小数位！' : 'Drag the magnifying glass, then zoom in to see more decimal places!')}
          hints={hints} showHint={showHint} />
      </div>
    </div>
  )
}
