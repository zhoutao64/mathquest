import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    type: 'select_factors',
    instruction: { en: 'Pack 12 apples: which box sizes work?', zh: '装 12 个苹果：哪些箱子大小合适？' },
    totalApples: 12,
    options: [1, 2, 3, 4, 5, 6],
    answers: [1, 2, 3, 4, 6],
    explanation: {
      en: 'Factors of 12: 1, 2, 3, 4, 6. They divide 12 perfectly — no leftovers!',
      zh: '12 的因数：1、2、3、4、6。它们能整除 12——没有剩余！',
    },
  },
  {
    type: 'yes_no',
    instruction: { en: 'Can 8 apples fit perfectly into boxes of 3?', zh: '8 个苹果能恰好装进每箱 3 个的箱子吗？' },
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
    instruction: { en: 'Pack 15 apples: which box sizes work?', zh: '装 15 个苹果：哪些箱子大小合适？' },
    totalApples: 15,
    options: [2, 3, 4, 5, 6, 7],
    answers: [3, 5],
    explanation: {
      en: 'Factors of 15 (from options): 3 and 5. 15÷3=5 boxes, 15÷5=3 boxes!',
      zh: '15 的因数（选项中）：3 和 5。15÷3=5 箱，15÷5=3 箱！',
    },
  },
  {
    type: 'gcf',
    instruction: { en: "What's the BIGGEST box that works for BOTH 12 and 8?", zh: '能同时装 12 个和 8 个苹果的最大箱子是多少？' },
    groups: [12, 8],
    options: [1, 2, 3, 4],
    answer: 4,
    explanation: {
      en: 'GCF(12, 8) = 4. Boxes of 4 fit both: 12÷4=3 and 8÷4=2!',
      zh: '最大公因数(12, 8) = 4。每箱 4 个都能装完：12÷4=3，8÷4=2！',
    },
  },
  {
    type: 'gcf',
    instruction: { en: 'Find the GCF of 18 and 24!', zh: '找出 18 和 24 的最大公因数！' },
    groups: [18, 24],
    options: [2, 3, 4, 6, 8, 9],
    answer: 6,
    explanation: {
      en: 'GCF(18, 24) = 6. 18÷6=3 boxes, 24÷6=4 boxes. Biggest that works for both!',
      zh: '最大公因数(18, 24) = 6。18÷6=3 箱，24÷6=4 箱。最大的公共因数！',
    },
  },
]

// ─── Apple SVG ───────────────────────────────────────────────
function Apple({ x, y, size = 12, dimmed }) {
  return (
    <g transform={`translate(${x}, ${y})`} opacity={dimmed ? 0.25 : 1}>
      <circle cx={0} cy={0} r={size / 2} fill="#EF4444" />
      <circle cx={-size / 5} cy={-size / 5} r={size / 5} fill="rgba(255,255,255,0.3)" />
      <line x1={0} y1={-size / 2} x2={1.5} y2={-size / 2 - 3} stroke="#92400E" strokeWidth={1.2} strokeLinecap="round" />
      <ellipse cx={3} cy={-size / 2 - 2} rx={3} ry={1.5} fill="#4ADE80" transform={`rotate(25,3,${-size / 2 - 2})`} />
    </g>
  )
}

// ─── Apple Grid Layout ───────────────────────────────────────
function applePositions(count, startX, startY, cols = 6) {
  const spacing = 20
  const positions = []
  for (let i = 0; i < count; i++) {
    positions.push({
      x: startX + (i % cols) * spacing,
      y: startY + Math.floor(i / cols) * spacing,
    })
  }
  return positions
}

// ─── Box with apples ────────────────────────────────────────
function PackingBox({ x, y, boxSize, filledCount, isFull, width = 50, height = 36 }) {
  const isFactor = isFull && filledCount === boxSize
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={0} y={0} width={width} height={height} rx={4}
        fill={isFactor ? '#D1FAE5' : (filledCount < boxSize ? '#FEE2E2' : '#F3F4F6')}
        stroke={isFactor ? '#4ECDC4' : (filledCount < boxSize && filledCount > 0 ? '#EF4444' : '#CBD5E1')}
        strokeWidth={1.5} strokeDasharray={isFactor ? '0' : '4,2'} />
      {/* Mini apples inside */}
      {Array.from({ length: filledCount }).map((_, i) => (
        <circle key={i}
          cx={8 + (i % Math.min(boxSize, 4)) * 11}
          cy={height / 2 - (boxSize > 4 && i >= 4 ? -7 : 0) + (Math.floor(i / Math.min(boxSize, 4))) * 11 - (boxSize > 4 ? 4 : 0)}
          r={4} fill="#EF4444" opacity={0.8} />
      ))}
      {/* Checkmark or X */}
      {isFactor && (
        <g transform={`translate(${width - 10}, -6)`}>
          <circle cx={0} cy={0} r={7} fill="#4ECDC4" />
          <path d="M -3 0 L -1 3 L 4 -3" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" />
        </g>
      )}
      {filledCount > 0 && filledCount < boxSize && (
        <g transform={`translate(${width - 10}, -6)`}>
          <circle cx={0} cy={0} r={7} fill="#EF4444" />
          <path d="M -3 -3 L 3 3 M 3 -3 L -3 3" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" />
        </g>
      )}
    </g>
  )
}

// ─── Factory Scene SVG ───────────────────────────────────────
function FactoryScene({ task, testedBoxSize, testResult, foundFactors, lang }) {
  const W = 380, H = 260
  const isGcf = task.type === 'gcf'

  // Conveyor belt Y
  const beltY = 120

  // Apple positions
  let apples1 = [], apples2 = []
  if (isGcf) {
    apples1 = applePositions(task.groups[0], 30, 30, 5)
    apples2 = applePositions(task.groups[1], 215, 30, 5)
  } else {
    const total = task.totalApples || task.groups?.[0] || 0
    apples1 = applePositions(total, W / 2 - (Math.min(total, 6) * 20) / 2 + 10, 30, 6)
  }

  // Box rendering
  const renderBoxArea = (totalApples, boxSize, startX, startY) => {
    if (!boxSize) return null
    const fullBoxes = Math.floor(totalApples / boxSize)
    const remainder = totalApples % boxSize
    const boxes = []
    const boxW = Math.min(50, (W - 60) / (fullBoxes + (remainder > 0 ? 1 : 0) + 0.5))

    for (let i = 0; i < fullBoxes && i < 8; i++) {
      boxes.push(
        <PackingBox key={i} x={startX + i * (boxW + 4)} y={startY}
          boxSize={boxSize} filledCount={boxSize} isFull={true}
          width={boxW} height={34} />
      )
    }
    if (remainder > 0) {
      boxes.push(
        <PackingBox key="rem" x={startX + fullBoxes * (boxW + 4)} y={startY}
          boxSize={boxSize} filledCount={remainder} isFull={false}
          width={boxW} height={34} />
      )
    }
    return boxes
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 420, display: 'block', margin: '0 auto' }}>
      {/* Factory wall background */}
      <rect x={0} y={0} width={W} height={H} fill="#F8FAFC" rx={8} />
      {/* Wall pattern */}
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
        {[0, 60, 120, 180, 240, 300].map(a => {
          const rad = a * Math.PI / 180
          return <rect key={a} x={-2 + Math.cos(rad) * 8} y={-2 + Math.sin(rad) * 8} width={4} height={4} rx={1} fill="#94A3B8" />
        })}
        <animateTransform attributeName="transform" type="rotate" from="0 20 12" to="360 20 12" dur="8s" repeatCount="indefinite" />
      </g>
      <g transform={`translate(${W - 20}, 12)`} opacity={0.25}>
        <circle cx={0} cy={0} r={6} fill="none" stroke="#94A3B8" strokeWidth={1.5} />
        <animateTransform attributeName="transform" type="rotate" from="360 ${W - 20} 12" to="0 ${W - 20} 12" dur="6s" repeatCount="indefinite" />
      </g>

      {/* GCF divider and labels */}
      {isGcf && (
        <>
          <line x1={W / 2} y1={25} x2={W / 2} y2={beltY - 5} stroke="#CBD5E1" strokeWidth={1} strokeDasharray="4,3" />
          <text x={W / 4} y={26} textAnchor="middle" fill="#64748B" fontSize={11} fontWeight={700}>
            {task.groups[0]} {lang === 'zh' ? '个' : ''}
          </text>
          <text x={3 * W / 4} y={26} textAnchor="middle" fill="#64748B" fontSize={11} fontWeight={700}>
            {task.groups[1]} {lang === 'zh' ? '个' : ''}
          </text>
        </>
      )}

      {/* Apples - group 1 */}
      {apples1.map((pos, i) => (
        <Apple key={`a1-${i}`} x={pos.x} y={pos.y}
          dimmed={testResult && testResult.isFactor !== undefined && testResult.isFactor} />
      ))}
      {/* Apples - group 2 (GCF only) */}
      {apples2.map((pos, i) => (
        <Apple key={`a2-${i}`} x={pos.x} y={pos.y}
          dimmed={testResult && testResult.isFactor !== undefined && testResult.isFactor} />
      ))}

      {/* Conveyor belt */}
      <rect x={10} y={beltY} width={W - 20} height={16} rx={3} fill="#475569" />
      <line x1={10} y1={beltY + 5} x2={W - 10} y2={beltY + 5} stroke="#64748B" strokeWidth={0.5} strokeDasharray="8,6">
        <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1s" repeatCount="indefinite" />
      </line>
      <line x1={10} y1={beltY + 11} x2={W - 10} y2={beltY + 11} stroke="#64748B" strokeWidth={0.5} strokeDasharray="8,6">
        <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1s" repeatCount="indefinite" />
      </line>
      {/* Rollers */}
      {[50, 110, 170, 230, 290, 340].map(cx => (
        <g key={cx}>
          <circle cx={cx} cy={beltY + 8} r={5} fill="#94A3B8" stroke="#334155" strokeWidth={0.8}>
            <animateTransform attributeName="transform" type="rotate"
              from={`0 ${cx} ${beltY + 8}`} to={`360 ${cx} ${beltY + 8}`} dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      {/* Box area */}
      {testedBoxSize && !isGcf && (
        <g>
          <text x={W / 2} y={beltY + 32} textAnchor="middle" fill="#64748B" fontSize={10} fontWeight={600}>
            {lang === 'zh' ? `每箱 ${testedBoxSize} 个` : `Box of ${testedBoxSize}`}
          </text>
          {renderBoxArea(task.totalApples, testedBoxSize, 20, beltY + 38)}
          {/* Result text */}
          {testResult && (
            <text x={W / 2} y={H - 8} textAnchor="middle"
              fill={testResult.isFactor ? '#059669' : '#DC2626'}
              fontSize={12} fontWeight={800} fontFamily="Nunito, sans-serif">
              {testResult.isFactor
                ? (lang === 'zh' ? '✅ 刚好装满！' : '✅ Perfect fit!')
                : (lang === 'zh' ? `❌ 余 ${testResult.remainder} 个` : `❌ ${testResult.remainder} left over`)}
            </text>
          )}
        </g>
      )}

      {/* GCF box area — two groups */}
      {testedBoxSize && isGcf && testResult && (
        <g>
          <text x={W / 4} y={beltY + 32} textAnchor="middle" fill="#64748B" fontSize={10} fontWeight={600}>
            {lang === 'zh' ? `每箱 ${testedBoxSize} 个` : `Box of ${testedBoxSize}`}
          </text>
          <text x={3 * W / 4} y={beltY + 32} textAnchor="middle" fill="#64748B" fontSize={10} fontWeight={600}>
            {lang === 'zh' ? `每箱 ${testedBoxSize} 个` : `Box of ${testedBoxSize}`}
          </text>
          {renderBoxArea(task.groups[0], testedBoxSize, 10, beltY + 38)}
          {renderBoxArea(task.groups[1], testedBoxSize, W / 2 + 10, beltY + 38)}
          {/* Results */}
          <text x={W / 4} y={H - 8} textAnchor="middle"
            fill={testResult.group1?.remainder === 0 ? '#059669' : '#DC2626'}
            fontSize={11} fontWeight={800}>
            {testResult.group1?.remainder === 0
              ? (lang === 'zh' ? '✅ 整除' : '✅ Fits')
              : (lang === 'zh' ? `❌ 余${testResult.group1?.remainder}` : `❌ R${testResult.group1?.remainder}`)}
          </text>
          <text x={3 * W / 4} y={H - 8} textAnchor="middle"
            fill={testResult.group2?.remainder === 0 ? '#059669' : '#DC2626'}
            fontSize={11} fontWeight={800}>
            {testResult.group2?.remainder === 0
              ? (lang === 'zh' ? '✅ 整除' : '✅ Fits')
              : (lang === 'zh' ? `❌ 余${testResult.group2?.remainder}` : `❌ R${testResult.group2?.remainder}`)}
          </text>
        </g>
      )}

      {/* Yes/No auto-show */}
      {task.type === 'yes_no' && testedBoxSize && (
        <g>
          <text x={W / 2} y={beltY + 32} textAnchor="middle" fill="#64748B" fontSize={10} fontWeight={600}>
            {task.totalApples} ÷ {task.boxSize} = ?
          </text>
          {renderBoxArea(task.totalApples, task.boxSize, 20, beltY + 38)}
          <text x={W / 2} y={H - 8} textAnchor="middle" fill="#DC2626" fontSize={12} fontWeight={800}>
            {lang === 'zh' ? `${task.fullBoxes} 箱装满，余 ${task.remainder} 个！` : `${task.fullBoxes} full boxes, ${task.remainder} left over!`}
          </text>
        </g>
      )}

      {/* Found factors display */}
      {task.type === 'select_factors' && foundFactors && foundFactors.length > 0 && !testedBoxSize && (
        <text x={W / 2} y={beltY + 38} textAnchor="middle" fill="#059669" fontSize={12} fontWeight={700}>
          {lang === 'zh' ? '已找到因数: ' : 'Found factors: '}{foundFactors.sort((a, b) => a - b).join(', ')}
        </text>
      )}
    </svg>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function FactorFactory({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [solved, setSolved] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)

  const [foundFactors, setFoundFactors] = useState([])
  const [testedNonFactors, setTestedNonFactors] = useState([])
  const [testedBoxSize, setTestedBoxSize] = useState(null)
  const [testResult, setTestResult] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)

  const task = TASKS[taskIndex]

  // Auto-show packing for yes_no tasks
  useEffect(() => {
    if (task.type === 'yes_no') {
      setTestedBoxSize(task.boxSize)
      setTestResult({
        isFactor: task.remainder === 0,
        fullBoxes: task.fullBoxes,
        remainder: task.remainder,
      })
    }
  }, [taskIndex, task])

  // select_factors: test a box size
  const handleTestBoxSize = useCallback((boxSize) => {
    if (foundFactors.includes(boxSize) || testedNonFactors.includes(boxSize) || solved) return

    const remainder = task.totalApples % boxSize
    const fullBoxes = Math.floor(task.totalApples / boxSize)
    const isFactor = remainder === 0

    setTestedBoxSize(boxSize)
    setTestResult({ isFactor, fullBoxes, remainder })

    if (isFactor) {
      const newFound = [...foundFactors, boxSize]
      setFoundFactors(newFound)
      if (newFound.length === task.answers.length) {
        setTimeout(() => {
          setSolved(true)
          setShowExplanation(true)
        }, 600)
      } else {
        // Clear test after a moment to allow next test
        setTimeout(() => { setTestedBoxSize(null); setTestResult(null) }, 800)
      }
    } else {
      setTestedNonFactors(prev => [...prev, boxSize])
      setMistakes(m => m + 1)
      setShowHint(true)
      setTimeout(() => { setTestedBoxSize(null); setTestResult(null) }, 1000)
    }
  }, [task, foundFactors, testedNonFactors, solved])

  // yes_no: answer
  const handleYesNo = useCallback((answer) => {
    setSelectedAnswer(answer)
    if (answer === task.answer) {
      setSolved(true)
      setShowExplanation(true)
    } else {
      setMistakes(m => m + 1)
      setShowHint(true)
    }
  }, [task])

  // gcf: choose answer
  const handleGcfChoice = useCallback((val) => {
    setSelectedAnswer(val)
    setTestedBoxSize(val)

    const r1 = task.groups[0] % val
    const r2 = task.groups[1] % val
    setTestResult({
      isFactor: r1 === 0 && r2 === 0,
      group1: { fullBoxes: Math.floor(task.groups[0] / val), remainder: r1 },
      group2: { fullBoxes: Math.floor(task.groups[1] / val), remainder: r2 },
    })

    if (val === task.answer) {
      setSolved(true)
      setShowExplanation(true)
    } else {
      setMistakes(m => m + 1)
      setShowHint(true)
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
      setShowHint(false)
      setShowExplanation(false)
      setFoundFactors([])
      setTestedNonFactors([])
      setTestedBoxSize(null)
      setTestResult(null)
      setSelectedAnswer(null)
    }
  }, [taskIndex, mistakes, onComplete])

  // Hints
  const hints = task.type === 'select_factors'
    ? [
        lang === 'zh' ? `试着用每个数字去除 ${task.totalApples}，能整除就是因数！` : `Try dividing ${task.totalApples} by each number — no remainder = factor!`,
        lang === 'zh' ? '因数就是能整除一个数的数，没有余数！' : 'A factor divides a number evenly with NO remainder!',
      ]
    : task.type === 'yes_no'
      ? [
          lang === 'zh' ? `${task.totalApples} ÷ ${task.boxSize} 有没有余数？` : `Does ${task.totalApples} ÷ ${task.boxSize} have a remainder?`,
          lang === 'zh' ? '看看装箱后有没有剩下的苹果！' : 'Look — are there apples left after packing?',
        ]
      : [
          lang === 'zh' ? '试试每个数字，看能不能同时整除两组苹果！' : 'Try each number — does it divide BOTH groups perfectly?',
          lang === 'zh' ? '最大公因数 = 能同时整除两个数的最大数！' : 'GCF = the BIGGEST number that divides both!',
        ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
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
          <div style={{ marginTop: 8, fontSize: 14, color: '#64748B' }}>
            🎯 {lang === 'zh' ? '已找到' : 'Found'}: {foundFactors.length}/{task.answers.length}
          </div>
        )}
      </div>

      {/* Factory Scene */}
      <div className="card" style={{ maxWidth: 460, width: '100%', padding: '12px 8px' }}>
        <FactoryScene
          task={task}
          testedBoxSize={testedBoxSize}
          testResult={testResult}
          foundFactors={foundFactors}
          lang={lang}
        />
      </div>

      {/* select_factors buttons */}
      {task.type === 'select_factors' && !solved && (
        <div>
          <div style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 8 }}>
            {lang === 'zh' ? '测试箱子大小：' : 'Test box sizes:'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {task.options.map(val => {
              const isFound = foundFactors.includes(val)
              const isNonFactor = testedNonFactors.includes(val)
              return (
                <button key={val} className="btn"
                  onClick={() => handleTestBoxSize(val)}
                  disabled={isFound || isNonFactor}
                  style={{
                    padding: '10px 18px', fontSize: 18, fontWeight: 800, minWidth: 48,
                    background: isFound ? '#D1FAE5' : isNonFactor ? '#FEE2E2' : '#fff',
                    border: `2px solid ${isFound ? '#4ECDC4' : isNonFactor ? '#EF4444' : '#CBD5E1'}`,
                    color: isFound ? '#059669' : isNonFactor ? '#DC2626' : '#1E293B',
                    opacity: isFound || isNonFactor ? 0.7 : 1,
                  }}>
                  {isFound ? `${val} ✓` : isNonFactor ? `${val} ✗` : val}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* yes_no buttons */}
      {task.type === 'yes_no' && !solved && (
        <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
          <button className="btn" onClick={() => handleYesNo(true)}
            style={{
              padding: '12px 32px', fontSize: 18, fontWeight: 800,
              background: selectedAnswer === true && task.answer !== true ? '#FEE2E2' : '#fff',
              border: `2px solid ${selectedAnswer === true && task.answer !== true ? '#EF4444' : '#4ECDC4'}`,
              color: '#1E293B',
            }}>
            {lang === 'zh' ? '能 ✓' : 'Yes ✓'}
          </button>
          <button className="btn" onClick={() => handleYesNo(false)}
            style={{
              padding: '12px 32px', fontSize: 18, fontWeight: 800,
              background: selectedAnswer === false && task.answer !== false ? '#FEE2E2' : '#fff',
              border: `2px solid ${selectedAnswer === false && task.answer !== false ? '#EF4444' : '#FF6B6B'}`,
              color: '#1E293B',
            }}>
            {lang === 'zh' ? '不能 ✗' : 'No ✗'}
          </button>
        </div>
      )}

      {/* gcf buttons */}
      {task.type === 'gcf' && !solved && (
        <div>
          <div style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 8 }}>
            {lang === 'zh' ? '选择最大公因数：' : 'Pick the GCF:'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {task.options.map(val => (
              <button key={val} className="btn"
                onClick={() => handleGcfChoice(val)}
                style={{
                  padding: '10px 18px', fontSize: 18, fontWeight: 800, minWidth: 48,
                  background: selectedAnswer === val && val !== task.answer ? '#FEE2E2' : '#fff',
                  border: `2px solid ${selectedAnswer === val && val !== task.answer ? '#EF4444' : '#CBD5E1'}`,
                  color: '#1E293B',
                }}>
                {val}
              </button>
            ))}
          </div>
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
              : task.type === 'select_factors'
                ? (lang === 'zh' ? '试试每种箱子大小！能刚好装满就是因数。' : 'Try each box size! If it packs perfectly, it\'s a factor.')
                : task.type === 'yes_no'
                  ? (lang === 'zh' ? '看看装箱结果——有没有剩余的苹果？' : 'Look at the packing — any apples left over?')
                  : (lang === 'zh' ? '哪个数字能同时整除两组苹果？要最大的！' : 'Which number divides BOTH groups? Pick the biggest!')
          }
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
