import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import AlchemyShooter, { playSuccessSound, playNextSound } from './AlchemyShooter'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    instruction: {
      en: 'Complete the recipe table! What goes in the blank?',
      zh: '完成配方表！空格填什么？',
    },
    table: {
      rows: [
        { label: { en: 'Water', zh: '水' }, values: ['2', '4', '6', '?'], color: '#60A5FA' },
        { label: { en: 'Moonstone', zh: '月石' }, values: ['3', '6', '9', '12'], color: '#A78BFA' },
      ],
    },
    targets: ['7', '8', '10', '14'],
    answer: '8',
    explanation: {
      en: 'The pattern is x2 for water. 4th column: 2x4 = 8!',
      zh: '水的规律是x2。第4列：2x4 = 8！',
    },
    hints: {
      en: [
        'Look at the pattern: Water goes 2, 4, 6, ?. What comes next?',
        'Each column multiplies the base ratio 2:3 by 1, 2, 3, 4. Water = 2x4 = 8!',
      ],
      zh: [
        '看规律：水是2, 4, 6, ?。下一个是什么？',
        '每列是基础比率2:3乘以1、2、3、4。水 = 2x4 = 8！',
      ],
    },
  },
  {
    instruction: {
      en: 'Complete the recipe table! What goes in the blank?',
      zh: '完成配方表！空格填什么？',
    },
    table: {
      rows: [
        { label: { en: 'Herbs', zh: '草药' }, values: ['1', '2', '3', '4'], color: '#4ADE80' },
        { label: { en: 'Crystals', zh: '水晶' }, values: ['5', '10', '?', '20'], color: '#C084FC' },
      ],
    },
    targets: ['12', '15', '13', '18'],
    answer: '15',
    explanation: {
      en: 'The ratio is 1:5. Column 3: 3x5 = 15 crystals!',
      zh: '比率是1:5。第3列：3x5 = 15个水晶！',
    },
    hints: {
      en: [
        'Herbs go 1, 2, 3, 4. Crystals go 5, 10, ?, 20. See the pattern?',
        'Each crystal value = herbs x 5. So 3 x 5 = 15!',
      ],
      zh: [
        '草药是1, 2, 3, 4。水晶是5, 10, ?, 20。看出规律了吗？',
        '每个水晶值 = 草药 x 5。所以3 x 5 = 15！',
      ],
    },
  },
  {
    instruction: {
      en: 'Complete the recipe table! What goes in the blank?',
      zh: '完成配方表！空格填什么？',
    },
    table: {
      rows: [
        { label: { en: 'Fire', zh: '火' }, values: ['3', '6', '9', '?'], color: '#F97316' },
        { label: { en: 'Ice', zh: '冰' }, values: ['2', '4', '6', '8'], color: '#38BDF8' },
      ],
    },
    targets: ['10', '11', '12', '15'],
    answer: '12',
    explanation: {
      en: 'The ratio is 3:2. Column 4: Ice is 8, so Fire = 8 x (3/2) = 12!',
      zh: '比率是3:2。第4列：冰是8，所以火 = 8 x (3/2) = 12！',
    },
    hints: {
      en: [
        'Fire goes 3, 6, 9, ?. Each time it adds 3.',
        'The pattern: 3x1, 3x2, 3x3, 3x4. So 3x4 = 12!',
      ],
      zh: [
        '火是3, 6, 9, ?。每次加3。',
        '规律：3x1, 3x2, 3x3, 3x4。所以3x4 = 12！',
      ],
    },
  },
  {
    instruction: {
      en: 'Complete the recipe table! What goes in the blank?',
      zh: '完成配方表！空格填什么？',
    },
    table: {
      rows: [
        { label: { en: 'Gold', zh: '金' }, values: ['4', '8', '?', '16'], color: '#FBBF24' },
        { label: { en: 'Silver', zh: '银' }, values: ['3', '6', '9', '12'], color: '#94A3B8' },
      ],
    },
    targets: ['10', '12', '14', '16'],
    answer: '12',
    explanation: {
      en: 'The ratio is 4:3. Column 3: Silver is 9, so Gold = 9 x (4/3) = 12!',
      zh: '比率是4:3。第3列：银是9，所以金 = 9 x (4/3) = 12！',
    },
    hints: {
      en: [
        'Gold goes 4, 8, ?, 16. What is the pattern?',
        'Gold = 4 x multiplier. Column 3 multiplier is 3. So 4 x 3 = 12!',
      ],
      zh: [
        '金是4, 8, ?, 16。规律是什么？',
        '金 = 4 x 倍数。第3列倍数是3。所以4 x 3 = 12！',
      ],
    },
  },
  {
    instruction: {
      en: 'Complete the recipe table! What goes in the blank?',
      zh: '完成配方表！空格填什么？',
    },
    table: {
      rows: [
        { label: { en: 'Petals', zh: '花瓣' }, values: ['5', '10', '15', '20'], color: '#F472B6' },
        { label: { en: 'Drops', zh: '滴' }, values: ['2', '4', '?', '8'], color: '#2DD4BF' },
      ],
    },
    targets: ['5', '6', '7', '10'],
    answer: '6',
    explanation: {
      en: 'The ratio is 5:2. Column 3: Petals is 15, so Drops = 15 x (2/5) = 6!',
      zh: '比率是5:2。第3列：花瓣是15，所以滴 = 15 x (2/5) = 6！',
    },
    hints: {
      en: [
        'Drops go 2, 4, ?, 8. Each time it adds 2.',
        'The pattern: 2x1, 2x2, 2x3, 2x4. So 2x3 = 6!',
      ],
      zh: [
        '滴数是2, 4, ?, 8。每次加2。',
        '规律：2x1, 2x2, 2x3, 2x4。所以2x3 = 6！',
      ],
    },
  },
]

// ─── Target layout helper ───────────────────────────────────
const POSITIONS_4 = [
  { x: 60, y: 140 },
  { x: 160, y: 140 },
  { x: 260, y: 140 },
  { x: 360, y: 140 },
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

// ─── Recipe Table Display ────────────────────────────────────
function RecipeTableDisplay({ table, lang }) {
  return (
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)',
      fontWeight: 600,
    }}>
      <tbody>
        {table.rows.map((row, ri) => (
          <tr key={ri}>
            <td style={{
              padding: '8px 12px',
              background: row.color + '22',
              color: '#1E293B',
              fontWeight: 700,
              border: '1px solid #E2E8F0',
              borderRadius: ri === 0 ? '8px 0 0 0' : ri === table.rows.length - 1 ? '0 0 0 8px' : 0,
              minWidth: 70,
            }}>
              <span style={{
                display: 'inline-block',
                width: 10, height: 10, borderRadius: '50%',
                background: row.color, marginRight: 6, verticalAlign: 'middle',
              }} />
              {row.label[lang]}
            </td>
            {row.values.map((val, ci) => (
              <td key={ci} style={{
                padding: '8px 14px',
                textAlign: 'center',
                border: '1px solid #E2E8F0',
                background: val === '?'
                  ? '#FEF3C7'
                  : '#FAFAFA',
                color: val === '?' ? '#D97706' : '#1E293B',
                fontWeight: val === '?' ? 800 : 600,
                fontSize: val === '?' ? '1.1em' : '1em',
              }}>
                {val}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function RecipeTable({ levelData, onComplete }) {
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
        <div style={{ fontSize: 32, marginBottom: 4 }}>&#x1F4CA;</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '\u914D\u65B9\u8868' : 'Recipe Table'}
        </h2>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          {taskIndex + 1} / {TASKS.length}
        </div>
      </div>

      {/* Instruction */}
      <div className="card" style={{ textAlign: 'center', maxWidth: 420, width: '100%' }}>
        <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', fontWeight: 600, color: '#1E293B', marginBottom: 12 }}>
          {task.instruction[lang]}
        </div>
        {/* Ratio table */}
        <RecipeTableDisplay table={task.table} lang={lang} />
      </div>

      {/* Shooter */}
      <AlchemyShooter
        targets={targets}
        onShoot={onShoot}
        mode="single"
        solved={solved}
        background="garden"
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
                ? '\u770B\u914D\u65B9\u8868\u4E2D\u7684\u89C4\u5F8B\uFF0C\u627E\u51FA\u7F3A\u5931\u7684\u6570\uFF0C\u7136\u540E\u5C04\u51FB\u5B83\uFF01'
                : 'Study the pattern in the table, find the missing number, then shoot it!')
          }
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
