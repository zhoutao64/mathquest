import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import AlchemyShooter, { playSuccessSound, playNextSound } from './AlchemyShooter'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    instruction: {
      en: 'The master recipe is 1:2. Shoot ALL equivalent ratios!',
      zh: '基础配方是 1:2。射击所有等价比率！',
    },
    targets: ['2:4', '3:5', '3:6', '5:10', '4:7'],
    answers: ['2:4', '3:6', '5:10'],
    explanation: {
      en: '1:2 = 2:4 = 3:6 = 5:10. Multiply both parts by the same number!',
      zh: '1:2 = 2:4 = 3:6 = 5:10。两部分同乘以相同的数！',
    },
    hints: {
      en: [
        'Equivalent ratios: multiply BOTH sides by the same number.',
        '1:2 -> 1x2:2x2 = 2:4, 1x3:2x3 = 3:6, 1x5:2x5 = 5:10',
      ],
      zh: [
        '等价比率：两边同时乘以相同的数。',
        '1:2 -> 1x2:2x2 = 2:4, 1x3:2x3 = 3:6, 1x5:2x5 = 5:10',
      ],
    },
  },
  {
    instruction: {
      en: 'Base ratio: 2:3. Shoot all equivalents!',
      zh: '基础比率：2:3。射击所有等价比率！',
    },
    targets: ['4:6', '6:8', '6:9', '8:12', '3:4'],
    answers: ['4:6', '6:9', '8:12'],
    explanation: {
      en: '2:3 = 4:6 = 6:9 = 8:12. Each multiplied by 2, 3, and 4!',
      zh: '2:3 = 4:6 = 6:9 = 8:12。分别乘以2、3和4！',
    },
    hints: {
      en: [
        'Check each: does it simplify back to 2:3?',
        '4:6 (÷2=2:3), 6:9 (÷3=2:3), 8:12 (÷4=2:3)',
      ],
      zh: [
        '检查每个：能化简回2:3吗？',
        '4:6 (÷2=2:3), 6:9 (÷3=2:3), 8:12 (÷4=2:3)',
      ],
    },
  },
  {
    instruction: {
      en: 'Base ratio: 3:4. Find all equivalents!',
      zh: '基础比率：3:4。找出所有等价比率！',
    },
    targets: ['6:8', '9:12', '5:8', '12:16', '4:5'],
    answers: ['6:8', '9:12', '12:16'],
    explanation: {
      en: '3:4 = 6:8 = 9:12 = 12:16. The ratio stays the same when you scale both parts equally!',
      zh: '3:4 = 6:8 = 9:12 = 12:16。两边等比例放大，比率不变！',
    },
    hints: {
      en: [
        'Try dividing both numbers by their GCF. Does it become 3:4?',
        '6:8 (÷2=3:4), 9:12 (÷3=3:4), 12:16 (÷4=3:4)',
      ],
      zh: [
        '试试两边除以最大公因数，能变成3:4吗？',
        '6:8 (÷2=3:4), 9:12 (÷3=3:4), 12:16 (÷4=3:4)',
      ],
    },
  },
  {
    instruction: {
      en: 'Base ratio: 1:5. Shoot equivalents!',
      zh: '基础比率：1:5。射击等价比率！',
    },
    targets: ['2:10', '3:15', '2:8', '4:20', '5:15'],
    answers: ['2:10', '3:15', '4:20'],
    explanation: {
      en: '1:5 = 2:10 = 3:15 = 4:20. Multiply both by 2, 3, and 4!',
      zh: '1:5 = 2:10 = 3:15 = 4:20。两边分别乘以2、3和4！',
    },
    hints: {
      en: [
        'For 1:5, the second number should always be 5 times the first.',
        '2:10 (10÷2=5), 3:15 (15÷3=5), 4:20 (20÷4=5)',
      ],
      zh: [
        '对于1:5，第二个数应该总是第一个数的5倍。',
        '2:10 (10÷2=5), 3:15 (15÷3=5), 4:20 (20÷4=5)',
      ],
    },
  },
  {
    instruction: {
      en: 'Base ratio: 4:3. Find them all!',
      zh: '基础比率：4:3。全部找出来！',
    },
    targets: ['8:6', '12:9', '6:5', '16:12', '10:8'],
    answers: ['8:6', '12:9', '16:12'],
    explanation: {
      en: '4:3 = 8:6 = 12:9 = 16:12. Scale both sides by the same factor!',
      zh: '4:3 = 8:6 = 12:9 = 16:12。两边乘以相同的倍数！',
    },
    hints: {
      en: [
        'Divide both numbers by their GCF — do you get 4:3?',
        '8:6 (÷2=4:3), 12:9 (÷3=4:3), 16:12 (÷4=4:3)',
      ],
      zh: [
        '两边除以最大公因数——能得到4:3吗？',
        '8:6 (÷2=4:3), 12:9 (÷3=4:3), 16:12 (÷4=4:3)',
      ],
    },
  },
]

// ─── Target layout: 5 targets in a staggered pattern ─────────
const POSITIONS_5 = [
  { x: 60, y: 90 },
  { x: 180, y: 90 },
  { x: 320, y: 90 },
  { x: 120, y: 190 },
  { x: 270, y: 190 },
]

function buildTargets(labels) {
  return labels.map((label, i) => ({
    id: `t${i}`,
    x: POSITIONS_5[i].x,
    y: POSITIONS_5[i].y,
    label,
    value: label,
  }))
}

// ─── Main Component ──────────────────────────────────────────
export default function EquivalentElixir({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [solved, setSolved] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [hitTargets, setHitTargets] = useState([])

  const task = TASKS[taskIndex]
  const targets = buildTargets(task.targets)
  const totalCorrect = task.answers.length

  const onShoot = useCallback((target) => {
    if (task.answers.includes(target.value)) {
      setHitTargets(prev => {
        const updated = [...prev, target.value]
        if (updated.length >= totalCorrect) {
          playSuccessSound()
      setSolved(true)
          setShowExplanation(true)
        }
        return updated
      })
      return 'correct'
    }
    setMistakes(m => m + 1)
    setShowHint(true)
    return 'wrong'
  }, [task, totalCorrect])

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
      setHitTargets([])
    }
  }, [taskIndex, mistakes, onComplete])

  const hints = task.hints[lang]
  const eliminatedCount = hitTargets.length

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 14,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>&#x2697;&#xFE0F;</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '\u7B49\u4EF7\u836F\u5242' : 'Equivalent Elixir'}
        </h2>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          {taskIndex + 1} / {TASKS.length}
        </div>
      </div>

      {/* Instruction */}
      <div className="card" style={{ textAlign: 'center', maxWidth: 420, width: '100%' }}>
        <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', fontWeight: 600, color: '#1E293B' }}>
          {task.instruction[lang]}
        </div>
        <div style={{
          marginTop: 8, fontSize: 14, fontWeight: 700,
          color: eliminatedCount >= totalCorrect ? '#059669' : '#8B5CF6',
        }}>
          {eliminatedCount}/{totalCorrect} {lang === 'zh' ? '\u5DF2\u6D88\u706D' : 'eliminated'}
        </div>
      </div>

      {/* Shooter */}
      <AlchemyShooter
        targets={targets}
        onShoot={onShoot}
        mode="multi"
        solved={solved}
        background="workshop"
        drift
      />

      {/* Explanation */}
      {showExplanation && (
        <div className="card" style={{
          maxWidth: 400, width: '100%', textAlign: 'center',
          background: '#E0FFF8', border: '2px solid #4ECDC4',
          animation: 'bounce-in 0.4s',
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>&#x1F3AF;</div>
          <p style={{ fontSize: 15, color: '#1E293B', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
            {task.explanation[lang]}
          </p>
          <button className="btn btn-primary" onClick={handleNext} style={{ marginTop: 16 }}>
            {taskIndex < TASKS.length - 1
              ? (lang === 'zh' ? '\u4E0B\u4E00\u9898\uFF01 \u2192' : 'Next! \u2192')
              : (lang === 'zh' ? '\u4EFB\u52A1\u5B8C\u6210\uFF01' : 'Mission complete!')}
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
              : (lang === 'zh'
                ? '\u5C04\u51FB\u6240\u6709\u7B49\u4EF7\u6BD4\u7387\uFF01\u4E24\u8FB9\u540C\u4E58\u76F8\u540C\u7684\u6570\u3002'
                : 'Shoot ALL equivalent ratios! Multiply both sides by the same number.')
          }
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
