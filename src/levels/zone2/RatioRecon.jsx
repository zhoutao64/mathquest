import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import AlchemyShooter, { playSuccessSound, playNextSound } from './AlchemyShooter'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    instruction: {
      en: 'There are 3 red potions and 5 blue potions. Shoot the correct ratio!',
      zh: '有3瓶红药水和5瓶蓝药水。射击正确的比率！',
    },
    targets: ['3:5', '5:3', '3:8', '8:3'],
    answer: '3:5',
    explanation: {
      en: 'A ratio compares quantities in order. 3 red to 5 blue = 3:5!',
      zh: '比率按顺序比较数量。3瓶红比5瓶蓝 = 3:5！',
    },
    hints: {
      en: [
        'A ratio is written as first:second. Which came first in the question?',
        'Red was mentioned first (3), then blue (5). So the ratio is 3:5!',
      ],
      zh: [
        '比率写成"第一个:第二个"。题目中哪个先提到？',
        '先说红色(3)，再说蓝色(5)。所以比率是3:5！',
      ],
    },
  },
  {
    instruction: {
      en: "4 herbs and 2 crystals. What's the ratio of herbs to crystals?",
      zh: '4份草药和2份水晶。草药与水晶的比是？',
    },
    targets: ['4:2', '2:4', '4:6', '6:4'],
    answer: '4:2',
    explanation: {
      en: '4 herbs to 2 crystals = 4:2. Order matters in ratios!',
      zh: '4份草药比2份水晶 = 4:2。比率中顺序很重要！',
    },
    hints: {
      en: [
        'Herbs to crystals means herbs come first in the ratio.',
        'Herbs = 4, crystals = 2. Write it as 4:2!',
      ],
      zh: [
        '草药与水晶的比，草药在前。',
        '草药 = 4，水晶 = 2。写成4:2！',
      ],
    },
  },
  {
    instruction: {
      en: "A potion uses 2 parts water and 3 parts moonlight. What's the total parts?",
      zh: '药水用了2份水和3份月光。总共几份？',
    },
    targets: ['5', '6', '2:3', '3:2'],
    answer: '5',
    explanation: {
      en: '2 + 3 = 5 total parts. A ratio of 2:3 has 5 parts altogether!',
      zh: '2 + 3 = 5份。比率2:3一共有5份！',
    },
    hints: {
      en: [
        'To find total parts, add both numbers in the ratio together.',
        '2 parts + 3 parts = ? total parts',
      ],
      zh: [
        '要找总份数，把比率中的两个数加起来。',
        '2份 + 3份 = ?份',
      ],
    },
  },
  {
    instruction: {
      en: "There are 6 potions total: 2 green and 4 purple. What's the ratio of green to total?",
      zh: '共6瓶药水：2瓶绿色4瓶紫色。绿色占总数的比率是？',
    },
    targets: ['2:6', '2:4', '4:6', '6:2'],
    answer: '2:6',
    explanation: {
      en: 'Part-to-whole ratio: 2 green out of 6 total = 2:6!',
      zh: '部分与整体的比：6瓶中有2瓶绿色 = 2:6！',
    },
    hints: {
      en: [
        'This asks for green to TOTAL, not green to purple.',
        'Green = 2, total = 6. The part-to-whole ratio is 2:6!',
      ],
      zh: [
        '题目问的是绿色与总数的比，不是绿色与紫色的比。',
        '绿色 = 2，总数 = 6。部分与整体的比是2:6！',
      ],
    },
  },
  {
    instruction: {
      en: "Rose's recipe: for every 1 dragon scale, use 3 phoenix feathers. If she has 4 scales, how many feathers?",
      zh: '罗斯的配方：每1片龙鳞配3根凤凰羽毛。4片龙鳞需要多少羽毛？',
    },
    targets: ['12', '7', '4', '3'],
    answer: '12',
    explanation: {
      en: '1:3 ratio means x4 gives 4:12. She needs 12 feathers!',
      zh: '1:3的比率，x4得到4:12。需要12根羽毛！',
    },
    hints: {
      en: [
        'If 1 scale needs 3 feathers, how many feathers for 4 scales?',
        'Multiply both sides: 1x4 = 4 scales, 3x4 = 12 feathers!',
      ],
      zh: [
        '如果1片龙鳞需要3根羽毛，4片需要多少？',
        '两边同乘：1x4 = 4片龙鳞，3x4 = 12根羽毛！',
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
export default function RatioRecon({ levelData, onComplete }) {
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
        <div style={{ fontSize: 32, marginBottom: 4 }}>&#x1F50D;</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '\u6BD4\u7387\u4FA6\u5BDF' : 'Ratio Recon'}
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
                ? '\u5C04\u51FB\u6B63\u786E\u7684\u836F\u6C34\u74F6\uFF01\u6CE8\u610F\u6BD4\u7387\u4E2D\u7684\u987A\u5E8F\u3002'
                : 'Shoot the correct potion! Pay attention to the order in ratios.')
          }
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
