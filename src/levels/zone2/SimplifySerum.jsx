import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import AlchemyShooter, { playSuccessSound, playNextSound } from './AlchemyShooter'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    instruction: {
      en: 'Simplify 4:8! Shoot the simplest form!',
      zh: '化简 4:8！射击最简形式！',
    },
    targets: ['1:2', '2:4', '4:8', '2:3'],
    answer: '1:2',
    explanation: {
      en: '4:8 -> divide both by 4 -> 1:2. The GCF is 4!',
      zh: '4:8 -> 两边除以4 -> 1:2。最大公因数是4！',
    },
    hints: {
      en: [
        'Find the biggest number that divides BOTH 4 and 8.',
        'GCF of 4 and 8 is 4. Divide both: 4÷4 = 1, 8÷4 = 2.',
      ],
      zh: [
        '找出能同时整除4和8的最大数。',
        '4和8的最大公因数是4。两边除：4÷4 = 1, 8÷4 = 2。',
      ],
    },
  },
  {
    instruction: {
      en: 'Simplify 6:9!',
      zh: '化简 6:9！',
    },
    targets: ['2:3', '3:4', '1:3', '6:9'],
    answer: '2:3',
    explanation: {
      en: '6:9 -> divide both by 3 -> 2:3. The GCF is 3!',
      zh: '6:9 -> 两边除以3 -> 2:3。最大公因数是3！',
    },
    hints: {
      en: [
        'What number divides both 6 and 9?',
        'GCF is 3. 6÷3 = 2, 9÷3 = 3. Simplest form: 2:3!',
      ],
      zh: [
        '什么数能同时整除6和9？',
        '最大公因数是3。6÷3 = 2, 9÷3 = 3。最简形式：2:3！',
      ],
    },
  },
  {
    instruction: {
      en: 'Simplify 10:15!',
      zh: '化简 10:15！',
    },
    targets: ['2:3', '5:8', '3:5', '1:2'],
    answer: '2:3',
    explanation: {
      en: '10:15 -> divide both by 5 -> 2:3. The GCF is 5!',
      zh: '10:15 -> 两边除以5 -> 2:3。最大公因数是5！',
    },
    hints: {
      en: [
        'Both 10 and 15 are divisible by 5.',
        '10÷5 = 2, 15÷5 = 3. The simplest form is 2:3!',
      ],
      zh: [
        '10和15都能被5整除。',
        '10÷5 = 2, 15÷5 = 3。最简形式是2:3！',
      ],
    },
  },
  {
    instruction: {
      en: 'Simplify 12:8!',
      zh: '化简 12:8！',
    },
    targets: ['3:2', '6:4', '4:3', '2:1'],
    answer: '3:2',
    explanation: {
      en: '12:8 -> divide both by 4 -> 3:2. The GCF is 4!',
      zh: '12:8 -> 两边除以4 -> 3:2。最大公因数是4！',
    },
    hints: {
      en: [
        'Find the GCF of 12 and 8. Try 2, then 4.',
        'GCF is 4. 12÷4 = 3, 8÷4 = 2. Answer: 3:2!',
      ],
      zh: [
        '找12和8的最大公因数。试试2，再试试4。',
        '最大公因数是4。12÷4 = 3, 8÷4 = 2。答案：3:2！',
      ],
    },
  },
  {
    instruction: {
      en: 'Simplify 15:25!',
      zh: '化简 15:25！',
    },
    targets: ['3:5', '5:8', '1:2', '5:7'],
    answer: '3:5',
    explanation: {
      en: '15:25 -> divide both by 5 -> 3:5. The GCF is 5!',
      zh: '15:25 -> 两边除以5 -> 3:5。最大公因数是5！',
    },
    hints: {
      en: [
        'Both 15 and 25 end in 5 or 0 — they share a factor of 5!',
        '15÷5 = 3, 25÷5 = 5. Simplest form: 3:5!',
      ],
      zh: [
        '15和25都能被5整除——它们有公因数5！',
        '15÷5 = 3, 25÷5 = 5。最简形式：3:5！',
      ],
    },
  },
]

// ─── Target layout helper ───────────────────────────────────
const POSITIONS_4 = [
  { x: 60, y: 120 },
  { x: 160, y: 120 },
  { x: 260, y: 120 },
  { x: 360, y: 120 },
]

function buildTargets(labels) {
  return labels.map((label, i) => ({
    id: `t${i}`,
    x: POSITIONS_4[i].x,
    y: POSITIONS_4[i].y,
    label,
    value: label,
  }))
}

// ─── Main Component ──────────────────────────────────────────
export default function SimplifySerum({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [solved, setSolved] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)

  const task = TASKS[taskIndex]
  const targets = buildTargets(task.targets)

  const onShoot = useCallback((target) => {
    if (target.value === task.answer) {
      playSuccessSound()
      setSolved(true)
      setShowExplanation(true)
      return 'correct'
    }
    setMistakes(m => m + 1)
    setShowHint(true)
    return 'wrong'
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
    }
  }, [taskIndex, mistakes, onComplete])

  const hints = task.hints[lang]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 14,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>&#x1F9EA;</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '\u5316\u7B80\u8840\u6E05' : 'Simplify Serum'}
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
      </div>

      {/* Shooter */}
      <AlchemyShooter
        targets={targets}
        onShoot={onShoot}
        mode="single"
        solved={solved}
        background="vault"
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
                ? '\u627E\u5230\u6700\u5927\u516C\u56E0\u6570\uFF0C\u4E24\u8FB9\u540C\u9664\uFF0C\u5C04\u51FB\u6700\u7B80\u5F62\u5F0F\uFF01'
                : 'Find the GCF, divide both sides, and shoot the simplest form!')
          }
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
