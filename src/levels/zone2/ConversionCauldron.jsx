import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import AlchemyShooter, { playSuccessSound, playNextSound } from './AlchemyShooter'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    instruction: {
      en: 'Convert 1/2 to a percent!',
      zh: '把 1/2 转换成百分比！',
    },
    sourceValue: '1/2',
    choices: ['25%', '50%', '75%', '12%'],
    answer: '50%',
    explanation: {
      en: '1/2 = 0.5 = 50%',
      zh: '1/2 = 0.5 = 50%',
    },
    hints: {
      en: ['Divide 1 by 2 to get a decimal first', '0.5 = 50 out of 100 = 50%'],
      zh: ['先用1除以2得到小数', '0.5 = 100份中的50份 = 50%'],
    },
  },
  {
    instruction: {
      en: 'Convert 0.75 to a fraction!',
      zh: '把 0.75 转换成分数！',
    },
    sourceValue: '0.75',
    choices: ['1/2', '3/4', '7/10', '3/5'],
    answer: '3/4',
    explanation: {
      en: '0.75 = 75/100 = 3/4. Simplify by dividing both by 25!',
      zh: '0.75 = 75/100 = 3/4。分子分母同除25化简！',
    },
    hints: {
      en: ['0.75 means 75 hundredths = 75/100', 'Simplify 75/100 by dividing both by 25'],
      zh: ['0.75表示75个百分之一 = 75/100', '75和100都除以25来化简'],
    },
  },
  {
    instruction: {
      en: 'Convert 20% to a fraction!',
      zh: '把 20% 转换成分数！',
    },
    sourceValue: '20%',
    choices: ['1/4', '1/5', '2/5', '1/2'],
    answer: '1/5',
    explanation: {
      en: '20% = 20/100 = 1/5. Divide both by 20!',
      zh: '20% = 20/100 = 1/5。同除以20化简！',
    },
    hints: {
      en: ['20% means 20 out of 100', 'Simplify 20/100 -- what divides both evenly?'],
      zh: ['20%表示100份中的20份', '化简20/100 -- 什么数能同时整除？'],
    },
  },
  {
    instruction: {
      en: 'Convert 3/5 to a decimal!',
      zh: '把 3/5 转换成小数！',
    },
    sourceValue: '3/5',
    choices: ['0.35', '0.5', '0.6', '0.75'],
    answer: '0.6',
    explanation: {
      en: '3/5 = 3 divided by 5 = 0.6',
      zh: '3/5 = 3除以5 = 0.6',
    },
    hints: {
      en: ['Divide the numerator by the denominator', '3 / 5 = ?'],
      zh: ['用分子除以分母', '3 / 5 = ?'],
    },
  },
  {
    instruction: {
      en: 'Convert 0.125 to a fraction!',
      zh: '把 0.125 转换成分数！',
    },
    sourceValue: '0.125',
    choices: ['1/4', '1/8', '1/5', '1/10'],
    answer: '1/8',
    explanation: {
      en: '0.125 = 125/1000 = 1/8. Divide both by 125!',
      zh: '0.125 = 125/1000 = 1/8。同除以125化简！',
    },
    hints: {
      en: ['0.125 has 3 decimal places = 125/1000', 'Find the GCD of 125 and 1000'],
      zh: ['0.125有3位小数 = 125/1000', '找125和1000的最大公约数'],
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
export default function ConversionCauldron({ levelData, onComplete }) {
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
    color: '#C084FC',
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
      ? '分数、小数、百分比——三种形式，同一个值！瞄准射击！'
      : 'Fractions, decimals, percents -- three forms, one value! Aim and shoot!')

  const hints = task.hints[lang]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>🔮</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '转化大锅' : 'Conversion Cauldron'}
        </h2>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          {taskIndex + 1} / {TASKS.length}
        </div>
      </div>

      {/* Instruction with prominent source value */}
      <div className="card" style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: '#64748B', marginBottom: 6 }}>
          🔮 {lang === 'zh' ? '转化任务' : 'CONVERSION TASK'}
        </div>
        <div style={{
          fontSize: 'clamp(2rem, 8vw, 2.8rem)', fontWeight: 900, color: '#A855F7',
          marginBottom: 8, fontFamily: 'Nunito, sans-serif',
        }}>
          {task.sourceValue} → ?
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
        background="vault"
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
