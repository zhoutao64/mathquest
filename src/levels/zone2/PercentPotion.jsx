import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import AlchemyShooter, { playSuccessSound, playNextSound } from './AlchemyShooter'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    instruction: {
      en: '25 out of 100 ingredients are rare. What percent?',
      zh: '100份材料中25份是稀有的。百分之几？',
    },
    choices: ['20%', '25%', '30%', '75%'],
    answer: '25%',
    explanation: {
      en: '25/100 = 25%. Percent means per hundred!',
      zh: '25/100 = 25%。百分比就是每百份中有多少！',
    },
    hints: {
      en: ['Percent literally means "per hundred"', '25 out of 100 is already a percentage!'],
      zh: ['百分比就是"每一百份中有多少份"', '100份中的25份，直接就是百分比！'],
    },
  },
  {
    instruction: {
      en: 'A potion is 3/10 water. What percent is water?',
      zh: '一瓶药水中3/10是水。水占百分之几？',
    },
    choices: ['3%', '13%', '30%', '33%'],
    answer: '30%',
    explanation: {
      en: '3/10 = 30/100 = 30%. Multiply both parts by 10!',
      zh: '3/10 = 30/100 = 30%。分子分母同乘10！',
    },
    hints: {
      en: ['Convert the fraction to have 100 as denominator', '3/10 -- multiply top and bottom by 10'],
      zh: ['把分数转换成分母为100的形式', '3/10 -- 分子分母同乘10'],
    },
  },
  {
    instruction: {
      en: 'Out of 50 potions, 15 are healing potions. What percent?',
      zh: '50瓶药水中15瓶是治愈药水。占百分之几？',
    },
    choices: ['15%', '25%', '30%', '35%'],
    answer: '30%',
    explanation: {
      en: '15/50 = 30/100 = 30%. Multiply by 2 to get per hundred!',
      zh: '15/50 = 30/100 = 30%。乘以2变成百分比！',
    },
    hints: {
      en: ['50 x 2 = 100, so multiply 15 by 2 as well', '15/50 = ?/100'],
      zh: ['50 x 2 = 100，所以15也要乘以2', '15/50 = ?/100'],
    },
  },
  {
    instruction: {
      en: 'Rose used 40% of her 200 crystals. How many?',
      zh: '罗斯用了200块水晶的40%。用了多少？',
    },
    choices: ['40', '60', '80', '120'],
    answer: '80',
    explanation: {
      en: '40% of 200 = 0.4 x 200 = 80 crystals!',
      zh: '200的40% = 0.4 x 200 = 80块水晶！',
    },
    hints: {
      en: ['40% means 40 out of every 100', 'Find 40% by multiplying: 200 x 0.4'],
      zh: ['40%表示每100个中有40个', '用200乘以0.4来计算'],
    },
  },
  {
    instruction: {
      en: 'A recipe is 1/4 moonlight essence. What percent?',
      zh: '配方中1/4是月光精华。百分之几？',
    },
    choices: ['14%', '20%', '25%', '40%'],
    answer: '25%',
    explanation: {
      en: '1/4 = 25/100 = 25%. A quarter is always 25%!',
      zh: '1/4 = 25/100 = 25%。四分之一永远是25%！',
    },
    hints: {
      en: ['What number times 4 equals 100?', '1/4 = 25/100'],
      zh: ['什么数乘以4等于100？', '1/4 = 25/100'],
    },
  },
]

// ─── Target positions ────────────────────────────────────────
const TARGET_POSITIONS = [
  { x: 70, y: 80 },
  { x: 200, y: 60 },
  { x: 330, y: 80 },
  { x: 135, y: 190 },
]

// ─── Main Component ──────────────────────────────────────────
export default function PercentPotion({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [solved, setSolved] = useState(false)

  const task = TASKS[taskIndex]

  // Build targets for AlchemyShooter
  const targets = task.choices.map((choice, i) => ({
    id: `t${taskIndex}-${i}`,
    x: TARGET_POSITIONS[i].x,
    y: TARGET_POSITIONS[i].y,
    label: choice,
    value: choice,
    color: '#F472B6',
  }))

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
      ? '百分比是魔法世界的通用度量！瞄准正确答案射击！'
      : 'Percentages are the universal measure in the magic world! Aim and shoot!')

  const hints = task.hints[lang]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>🧪</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '百分比药水' : 'Percent Potion'}
        </h2>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          {taskIndex + 1} / {TASKS.length}
        </div>
      </div>

      {/* Instruction */}
      <div className="card" style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: '#64748B', marginBottom: 6 }}>
          🧪 {lang === 'zh' ? '药水配方' : 'POTION RECIPE'}
        </div>
        <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', color: '#1E293B', fontWeight: 600 }}>
          {task.instruction[lang]}
        </div>
      </div>

      {/* Shooter */}
      <AlchemyShooter
        targets={targets}
        onShoot={handleShoot}
        mode="single"
        solved={solved}
        background="garden"
        drift
      />

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
