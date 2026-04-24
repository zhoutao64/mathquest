import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import AlchemyShooter, { playSuccessSound, playNextSound } from './AlchemyShooter'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Coordinate Mapping ──────────────────────────────────────
// Math coords → SVG coords for the AlchemyShooter (400x280 viewport)
// Math origin (0,0) → SVG (60, 240)
// Math max (8,16) → SVG (360, 40)
// X: svgX = 60 + mathX * 37.5
// Y: svgY = 240 - mathY * 12.5

const ORIGIN_X = 60
const ORIGIN_Y = 240
const SCALE_X = 37.5
const SCALE_Y = 12.5

function mathToSvg(mx, my) {
  return {
    x: ORIGIN_X + mx * SCALE_X,
    y: ORIGIN_Y - my * SCALE_Y,
  }
}

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    instruction: {
      en: 'y = 2x. Which point is on the line?',
      zh: 'y = 2x。哪个点在线上？',
    },
    equation: { m: 2, label: 'y = 2x' },
    // Points: (2,4) correct, (3,5) wrong, (1,3) wrong, (4,7) wrong
    points: [
      { mx: 2, my: 4, label: '(2,4)' },
      { mx: 3, my: 5, label: '(3,5)' },
      { mx: 1, my: 3, label: '(1,3)' },
      { mx: 4, my: 7, label: '(4,7)' },
    ],
    answer: '(2,4)',
    explanation: {
      en: 'y = 2 x 2 = 4. The point (2,4) satisfies y = 2x!',
      zh: 'y = 2 x 2 = 4。点(2,4)满足 y = 2x！',
    },
    hints: {
      en: ['Plug in the x-value: y should equal 2 times x', 'Check each point: does y = 2x hold?'],
      zh: ['代入x值：y应该等于2乘以x', '检查每个点：y = 2x是否成立？'],
    },
    gridMax: { x: 8, y: 16 },
  },
  {
    instruction: {
      en: 'y = 3x. Which point is on the line?',
      zh: 'y = 3x。哪个点在线上？',
    },
    equation: { m: 3, label: 'y = 3x' },
    points: [
      { mx: 2, my: 6, label: '(2,6)' },
      { mx: 3, my: 8, label: '(3,8)' },
      { mx: 1, my: 4, label: '(1,4)' },
      { mx: 4, my: 10, label: '(4,10)' },
    ],
    answer: '(2,6)',
    explanation: {
      en: 'y = 3 x 2 = 6. The point (2,6) is on the line y = 3x!',
      zh: 'y = 3 x 2 = 6。点(2,6)在直线 y = 3x 上！',
    },
    hints: {
      en: ['For y = 3x, multiply x by 3 to get y', 'Which point has y exactly 3 times its x?'],
      zh: ['对于 y = 3x，用x乘以3得到y', '哪个点的y恰好是x的3倍？'],
    },
    gridMax: { x: 8, y: 16 },
  },
  {
    instruction: {
      en: 'y = 0.5x. Which point?',
      zh: 'y = 0.5x。哪个点？',
    },
    equation: { m: 0.5, label: 'y = 0.5x' },
    points: [
      { mx: 4, my: 2, label: '(4,2)' },
      { mx: 3, my: 2, label: '(3,2)' },
      { mx: 6, my: 4, label: '(6,4)' },
      { mx: 2, my: 3, label: '(2,3)' },
    ],
    answer: '(4,2)',
    explanation: {
      en: 'y = 0.5 x 4 = 2. Half of x gives y!',
      zh: 'y = 0.5 x 4 = 2。x的一半就是y！',
    },
    hints: {
      en: ['y = 0.5x means y is half of x', 'Which point has y = x/2?'],
      zh: ['y = 0.5x 表示y是x的一半', '哪个点的y等于x的一半？'],
    },
    gridMax: { x: 8, y: 8 },
  },
  {
    instruction: {
      en: 'The line passes through (3,9). What\'s the equation?',
      zh: '直线经过(3,9)。方程是什么？',
    },
    equation: { m: 3, label: '?' },
    points: [
      { mx: 2, my: 4, label: 'y=2x' },
      { mx: 4, my: 12, label: 'y=3x' },
      { mx: 6, my: 8, label: 'y=4x' },
      { mx: 1, my: 9, label: 'y=9x' },
    ],
    answer: 'y=3x',
    explanation: {
      en: '9 / 3 = 3, so y = 3x. The slope is rise over run!',
      zh: '9 / 3 = 3，所以 y = 3x。斜率就是y除以x！',
    },
    hints: {
      en: ['slope = y / x = 9 / 3', 'The equation is y = (slope) times x'],
      zh: ['斜率 = y / x = 9 / 3', '方程是 y = (斜率) 乘以 x'],
    },
    gridMax: { x: 8, y: 16 },
    highlightPoint: { mx: 3, my: 9 },
  },
  {
    instruction: {
      en: 'y = 4x. Find the point!',
      zh: 'y = 4x。找到那个点！',
    },
    equation: { m: 4, label: 'y = 4x' },
    points: [
      { mx: 2, my: 8, label: '(2,8)' },
      { mx: 3, my: 8, label: '(3,8)' },
      { mx: 2, my: 6, label: '(2,6)' },
      { mx: 1, my: 12, label: '(4,12)' },
    ],
    answer: '(2,8)',
    explanation: {
      en: 'y = 4 x 2 = 8. The point (2,8) sits right on y = 4x!',
      zh: 'y = 4 x 2 = 8。点(2,8)正好在 y = 4x 上！',
    },
    hints: {
      en: ['Multiply x by 4 -- does it equal y?', 'Check (2,8): 4 x 2 = ?'],
      zh: ['x乘以4，是否等于y？', '检查(2,8)：4 x 2 = ?'],
    },
    gridMax: { x: 8, y: 16 },
  },
]

// ─── Graph SVG Children ──────────────────────────────────────
function CoordinateGrid({ task }) {
  const { gridMax, equation, highlightPoint } = task
  const maxX = gridMax.x
  const maxY = gridMax.y

  // Grid lines
  const gridLines = []

  // Vertical grid lines
  for (let mx = 0; mx <= maxX; mx += 1) {
    const svgX = ORIGIN_X + mx * SCALE_X
    gridLines.push(
      <line key={`v${mx}`}
        x1={svgX} y1={ORIGIN_Y} x2={svgX} y2={ORIGIN_Y - maxY * SCALE_Y}
        stroke="#334155" strokeWidth={0.3} opacity={0.4}
      />
    )
  }

  // Horizontal grid lines
  for (let my = 0; my <= maxY; my += 2) {
    const svgY = ORIGIN_Y - my * SCALE_Y
    gridLines.push(
      <line key={`h${my}`}
        x1={ORIGIN_X} y1={svgY} x2={ORIGIN_X + maxX * SCALE_X} y2={svgY}
        stroke="#334155" strokeWidth={0.3} opacity={0.4}
      />
    )
  }

  // Axes
  const axes = (
    <g>
      {/* X axis */}
      <line x1={ORIGIN_X} y1={ORIGIN_Y} x2={ORIGIN_X + maxX * SCALE_X + 10} y2={ORIGIN_Y}
        stroke="#94A3B8" strokeWidth={1.5} />
      <text x={ORIGIN_X + maxX * SCALE_X + 14} y={ORIGIN_Y + 4}
        fill="#94A3B8" fontSize={10} fontWeight={700} fontFamily="Nunito, sans-serif">x</text>
      {/* Y axis */}
      <line x1={ORIGIN_X} y1={ORIGIN_Y} x2={ORIGIN_X} y2={ORIGIN_Y - maxY * SCALE_Y - 10}
        stroke="#94A3B8" strokeWidth={1.5} />
      <text x={ORIGIN_X - 4} y={ORIGIN_Y - maxY * SCALE_Y - 14}
        fill="#94A3B8" fontSize={10} fontWeight={700} fontFamily="Nunito, sans-serif"
        textAnchor="middle">y</text>
      {/* Origin label */}
      <text x={ORIGIN_X - 10} y={ORIGIN_Y + 12}
        fill="#64748B" fontSize={9} fontFamily="Nunito, sans-serif">0</text>
    </g>
  )

  // X axis labels
  const xLabels = []
  for (let mx = 2; mx <= maxX; mx += 2) {
    const svgX = ORIGIN_X + mx * SCALE_X
    xLabels.push(
      <text key={`xl${mx}`} x={svgX} y={ORIGIN_Y + 14}
        fill="#64748B" fontSize={8} textAnchor="middle" fontFamily="Nunito, sans-serif">
        {mx}
      </text>
    )
  }

  // Y axis labels
  const yLabels = []
  for (let my = 2; my <= maxY; my += 2) {
    const svgY = ORIGIN_Y - my * SCALE_Y
    yLabels.push(
      <text key={`yl${my}`} x={ORIGIN_X - 12} y={svgY + 3}
        fill="#64748B" fontSize={8} textAnchor="end" fontFamily="Nunito, sans-serif">
        {my}
      </text>
    )
  }

  // Proportional line (dashed)
  const lineEndX = Math.min(maxX, maxY / equation.m)
  const lineStart = mathToSvg(0, 0)
  const lineEnd = mathToSvg(lineEndX, lineEndX * equation.m)

  // Highlight point for task 4
  const highlight = highlightPoint ? (
    <g>
      {(() => {
        const pt = mathToSvg(highlightPoint.mx, highlightPoint.my)
        return (
          <>
            <circle cx={pt.x} cy={pt.y} r={5} fill="#FFE66D" stroke="#F59E0B" strokeWidth={1.5}>
              <animate attributeName="r" values="5;7;5" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <text x={pt.x + 8} y={pt.y - 6} fill="#FFE66D" fontSize={9} fontWeight={700}
              fontFamily="Nunito, sans-serif">
              ({highlightPoint.mx},{highlightPoint.my})
            </text>
          </>
        )
      })()}
    </g>
  ) : null

  return (
    <g>
      {gridLines}
      {axes}
      {xLabels}
      {yLabels}
      {/* Dashed proportional line */}
      <line
        x1={lineStart.x} y1={lineStart.y}
        x2={lineEnd.x} y2={lineEnd.y}
        stroke="#4ECDC4" strokeWidth={2}
        strokeDasharray="6 4" opacity={0.8}
      />
      {/* Equation label on line */}
      {equation.label !== '?' && (
        <text
          x={lineEnd.x - 20} y={lineEnd.y + 16}
          fill="#4ECDC4" fontSize={10} fontWeight={700}
          fontFamily="Nunito, sans-serif" opacity={0.9}>
          {equation.label}
        </text>
      )}
      {highlight}
    </g>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function GraphGrinder({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [solved, setSolved] = useState(false)

  const task = TASKS[taskIndex]

  // Build targets from math coordinates
  const targets = task.points.map((pt, i) => {
    const svgPos = mathToSvg(pt.mx, pt.my)
    return {
      id: `t${taskIndex}-${i}`,
      x: svgPos.x,
      y: svgPos.y,
      label: pt.label,
      value: pt.label,
      color: '#60A5FA',
    }
  })

  // Handle shooting a target
  const handleShoot = useCallback((target) => {
    if (target.value === task.answer) {
      playSuccessSound()
      setSolved(true)
      setShowExplanation(true)
      return 'correct'
    } else {
      setMistakes(m => m + 1)
      setShowHint(true)
      return 'wrong'
    }
  }, [task])

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
      setShowExplanation(false)
      setShowHint(false)
    }
  }, [taskIndex, mistakes, onComplete])

  // Professor message
  const professorMsg = showExplanation
    ? task.explanation[lang]
    : (lang === 'zh'
      ? '在坐标图上找到正确的点！沿着虚线看哪个点在线上。'
      : 'Find the correct point on the graph! Follow the dashed line to see which point lies on it.')

  const hints = task.hints[lang]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>📊</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '图形研磨机' : 'Graph Grinder'}
        </h2>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          {taskIndex + 1} / {TASKS.length}
        </div>
      </div>

      {/* Instruction */}
      <div className="card" style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: '#64748B', marginBottom: 6 }}>
          📊 {lang === 'zh' ? '图形任务' : 'GRAPH MISSION'}
        </div>
        <div style={{
          fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', fontWeight: 900, color: '#4ECDC4',
          marginBottom: 6, fontFamily: 'Nunito, sans-serif',
        }}>
          {task.equation.label !== '?' ? task.equation.label : (lang === 'zh' ? '找到方程！' : 'Find the equation!')}
        </div>
        <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', color: '#1E293B', fontWeight: 600 }}>
          {task.instruction[lang]}
        </div>
      </div>

      {/* Shooter with graph overlay */}
      <AlchemyShooter
        targets={targets}
        onShoot={handleShoot}
        mode="single"
        solved={solved}
        background="vault"
        hitRadius={24}
        drift
      >
        <CoordinateGrid task={task} />
      </AlchemyShooter>

      {/* Explanation + Next */}
      {showExplanation && (
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
              ? (lang === 'zh' ? '下一题 →' : 'Next →')
              : (lang === 'zh' ? '完成！' : 'Finish!')
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
          message={professorMsg}
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
