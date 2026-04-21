import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    instruction: { en: 'A customer wants 1/2 of the cake!', zh: '客人想要蛋糕的 1/2！' },
    targetNumerator: 1,
    targetDenominator: 2,
    cuts: 2,
    phase: 'intro', // first task: guided
  },
  {
    instruction: { en: 'This customer wants 3/4 of the cake!', zh: '这位客人想要蛋糕的 3/4！' },
    targetNumerator: 3,
    targetDenominator: 4,
    cuts: 4,
  },
  {
    instruction: { en: 'Cut the cake into 3 pieces and give 2 pieces.', zh: '把蛋糕切成3份，给客人2份。' },
    targetNumerator: 2,
    targetDenominator: 3,
    cuts: 3,
  },
  {
    instruction: { en: 'The customer needs exactly 1/4!', zh: '客人正好需要 1/4！' },
    targetNumerator: 1,
    targetDenominator: 4,
    cuts: 4,
  },
  {
    instruction: { en: 'A big order: 5/8 of the cake!', zh: '大订单：蛋糕的 5/8！' },
    targetNumerator: 5,
    targetDenominator: 8,
    cuts: 8,
  },
]

// ─── Cake SVG Component ──────────────────────────────────────
function CakeSVG({ slices, selected, onSliceClick, disabled }) {
  const total = slices
  const radius = 110
  const cx = 140, cy = 140

  return (
    <svg viewBox="0 0 280 280" style={{ width: '100%', maxWidth: 300, display: 'block', margin: '0 auto' }}>
      {/* Cake base shadow */}
      <circle cx={cx} cy={cy + 4} r={radius + 2} fill="rgba(0,0,0,0.08)" />

      {/* Cake slices */}
      {Array.from({ length: total }, (_, i) => {
        const startAngle = (i / total) * 360 - 90
        const endAngle = ((i + 1) / total) * 360 - 90
        const startRad = (startAngle * Math.PI) / 180
        const endRad = (endAngle * Math.PI) / 180
        const x1 = cx + radius * Math.cos(startRad)
        const y1 = cy + radius * Math.sin(startRad)
        const x2 = cx + radius * Math.cos(endRad)
        const y2 = cy + radius * Math.sin(endRad)
        const largeArc = endAngle - startAngle > 180 ? 1 : 0
        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
        const isSelected = selected.includes(i)

        // Alternating cake colors
        const baseColors = ['#FFD4A8', '#FFBE7A', '#FFC994', '#FFB366', '#FFD4A8', '#FFBE7A', '#FFC994', '#FFB366']
        const selectedColor = '#4ECDC4'
        const hoverColor = '#E0F7FA'

        return (
          <path
            key={i}
            d={path}
            fill={isSelected ? selectedColor : baseColors[i % baseColors.length]}
            stroke="#fff"
            strokeWidth={2}
            style={{
              cursor: disabled ? 'default' : 'pointer',
              transition: 'fill 0.2s, transform 0.15s',
              transformOrigin: `${cx}px ${cy}px`,
              transform: isSelected ? 'scale(1.03)' : 'scale(1)',
            }}
            onClick={() => !disabled && onSliceClick(i)}
          />
        )
      })}

      {/* Cut lines */}
      {Array.from({ length: total }, (_, i) => {
        const angle = (i / total) * 360 - 90
        const rad = (angle * Math.PI) / 180
        const x = cx + radius * Math.cos(rad)
        const y = cy + radius * Math.sin(rad)
        return <line key={`cut${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(139,90,43,0.3)" strokeWidth={1.5} />
      })}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={4} fill="rgba(139,90,43,0.4)" />

      {/* Cherry on top */}
      <circle cx={cx} cy={cy - 8} r={8} fill="#FF6B6B" />
      <circle cx={cx - 2} cy={cy - 10} r={2.5} fill="rgba(255,255,255,0.5)" />
    </svg>
  )
}

// ─── Cut Selector ────────────────────────────────────────────
function CutSelector({ value, onChange, disabled }) {
  const options = [2, 3, 4, 5, 6, 8]
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
      {options.map(n => (
        <button
          key={n}
          onClick={() => !disabled && onChange(n)}
          disabled={disabled}
          style={{
            width: 44, height: 44, borderRadius: 12, border: 'none',
            background: value === n ? '#4ECDC4' : 'rgba(0,0,0,0.05)',
            color: value === n ? '#fff' : '#1E293B',
            fontSize: 18, fontWeight: 700, cursor: disabled ? 'default' : 'pointer',
            transition: 'all 0.2s',
            transform: value === n ? 'scale(1.1)' : 'scale(1)',
            boxShadow: value === n ? '0 3px 12px rgba(78,205,196,0.4)' : 'none',
          }}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function FractionFeast({ levelData, onComplete }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [phase, setPhase] = useState('cut') // 'cut' | 'select' | 'check' | 'correct'
  const [cuts, setCuts] = useState(0)
  const [selected, setSelected] = useState([])
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)

  const task = TASKS[taskIndex]

  // Handle cut selection
  const handleCutChange = useCallback((n) => {
    setCuts(n)
    setSelected([])
    setPhase('select')
  }, [])

  // Handle slice click
  const handleSliceClick = useCallback((i) => {
    if (phase !== 'select') return
    setSelected(prev =>
      prev.includes(i) ? prev.filter(s => s !== i) : [...prev, i]
    )
  }, [phase])

  // Check answer
  const handleCheck = useCallback(() => {
    if (selected.length === task.targetNumerator && cuts === task.targetDenominator) {
      setPhase('correct')
    } else {
      setMistakes(m => m + 1)
      setShowHint(true)
      // Shake animation would go here
    }
  }, [selected, cuts, task])

  // Next task
  const handleNext = useCallback(() => {
    const next = taskIndex + 1
    setTasksCompleted(tc => tc + 1)
    if (next >= TASKS.length) {
      // Level complete
      const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
      onComplete({ stars, mistakes })
    } else {
      setTaskIndex(next)
      setPhase('cut')
      setCuts(0)
      setSelected([])
      setShowHint(false)
    }
  }, [taskIndex, mistakes, onComplete])

  // Professor messages
  const professorMessages = {
    cut: {
      en: 'First, decide how many pieces to cut the cake into! That becomes the denominator (bottom number).',
      zh: '首先，决定把蛋糕切成几份！这就是分母（下面的数字）。',
    },
    select: {
      en: `Great! Now tap the pieces you want to give the customer. They need ${task.targetNumerator} piece${task.targetNumerator > 1 ? 's' : ''}.`,
      zh: `很好！现在点击你要给客人的那几块。客人需要 ${task.targetNumerator} 块。`,
    },
    correct: {
      en: `Perfect! ${task.targetNumerator}/${task.targetDenominator} means ${task.targetNumerator} out of ${task.targetDenominator} equal pieces!`,
      zh: `完美！${task.targetNumerator}/${task.targetDenominator} 就是 ${task.targetDenominator} 等份中取 ${task.targetNumerator} 份！`,
    },
  }

  const hints = [
    lang === 'zh'
      ? `提示：客人要 ${task.targetNumerator}/${task.targetDenominator}，所以要切成 ${task.targetDenominator} 份`
      : `Hint: The customer wants ${task.targetNumerator}/${task.targetDenominator}, so cut into ${task.targetDenominator} pieces`,
    lang === 'zh'
      ? `分母 = 总份数 = ${task.targetDenominator}，分子 = 选中份数 = ${task.targetNumerator}`
      : `Denominator = total pieces = ${task.targetDenominator}, Numerator = pieces selected = ${task.targetNumerator}`,
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      {/* Level title */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>🍰</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {t('zone1Levels.level1.name')}
        </h2>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          {taskIndex + 1} / {TASKS.length}
        </div>
      </div>

      {/* Customer order */}
      <div className="card" style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: '#64748B', marginBottom: 6 }}>
          📋 {lang === 'zh' ? '顾客订单' : 'CUSTOMER ORDER'}
        </div>
        <div style={{ fontSize: 'clamp(1rem, 3vw, 1.1rem)', color: '#1E293B', fontWeight: 600 }}>
          {task.instruction[lang]}
        </div>
        {/* Target fraction display */}
        <div style={{
          fontSize: 'clamp(2rem, 8vw, 3rem)', fontWeight: 900, color: '#4ECDC4',
          marginTop: 8, fontFamily: 'Nunito, sans-serif',
        }}>
          <span>{task.targetNumerator}</span>
          <span style={{ margin: '0 4px', color: '#CBD5E1' }}>/</span>
          <span>{task.targetDenominator}</span>
        </div>
      </div>

      {/* Phase: Cut selection */}
      {phase === 'cut' && (
        <div className="card" style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 12 }}>
            ✂️ {lang === 'zh' ? '切成几份？' : 'How many pieces?'}
          </div>
          <CutSelector value={cuts} onChange={handleCutChange} disabled={false} />
        </div>
      )}

      {/* Phase: Select slices / Show result */}
      {(phase === 'select' || phase === 'correct') && (
        <div className="card" style={{ maxWidth: 400, width: '100%' }}>
          <CakeSVG
            slices={cuts}
            selected={selected}
            onSliceClick={handleSliceClick}
            disabled={phase === 'correct'}
          />
          {/* Selection count */}
          <div style={{
            textAlign: 'center', marginTop: 12, fontSize: 16, fontWeight: 700,
            color: phase === 'correct' ? '#4ECDC4' : '#1E293B',
          }}>
            {lang === 'zh' ? '已选' : 'Selected'}: {selected.length} / {cuts}
            {phase === 'correct' && (
              <span style={{ marginLeft: 8, color: '#4ECDC4' }}>
                = {task.targetNumerator}/{task.targetDenominator} ✓
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        {phase === 'select' && selected.length > 0 && (
          <button className="btn btn-primary" onClick={handleCheck}>
            {lang === 'zh' ? '确认送出' : 'Serve!'}  🍽️
          </button>
        )}
        {phase === 'correct' && (
          <button className="btn btn-primary" onClick={handleNext}>
            {taskIndex < TASKS.length - 1
              ? (lang === 'zh' ? '下一位客人 →' : 'Next Customer →')
              : (lang === 'zh' ? '完成！' : 'Finish!')
            }
          </button>
        )}
      </div>

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
          message={professorMessages[phase]?.[lang] || professorMessages.cut[lang]}
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
