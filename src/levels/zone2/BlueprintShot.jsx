import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import AlchemyShooter, { playSuccessSound, playNextSound } from './AlchemyShooter'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    instruction: {
      en: 'Scale 1:10. Blueprint shows 3cm. Real length?',
      zh: '比例尺 1:10。蓝图上3厘米。实际多长？',
    },
    choices: ['13cm', '30cm', '40cm', '3cm'],
    answer: '30cm',
    explanation: {
      en: '3 x 10 = 30cm. Every 1cm on blueprint = 10cm in real life!',
      zh: '3 x 10 = 30厘米。蓝图上1厘米 = 实际10厘米！',
    },
    hints: {
      en: ['The scale 1:10 means 1cm on paper = 10cm real', 'Multiply the blueprint measurement by the scale factor'],
      zh: ['比例尺 1:10 表示纸上1厘米 = 实际10厘米', '用蓝图上的尺寸乘以比例因子'],
    },
  },
  {
    instruction: {
      en: 'Scale 1:50. Blueprint shows 2cm. Real length?',
      zh: '比例尺 1:50。蓝图上2厘米。实际多长？',
    },
    choices: ['52cm', '100cm', '25cm', '200cm'],
    answer: '100cm',
    explanation: {
      en: '2 x 50 = 100cm. The scale multiplies the blueprint measurement!',
      zh: '2 x 50 = 100厘米。比例尺是蓝图尺寸的倍数！',
    },
    hints: {
      en: ['1:50 means every 1cm on paper = 50cm in reality', 'Multiply 2 by 50'],
      zh: ['1:50 表示纸上1厘米 = 实际50厘米', '用2乘以50'],
    },
  },
  {
    instruction: {
      en: 'Scale 1:5. Real object is 20cm. Blueprint length?',
      zh: '比例尺 1:5。实物20厘米。蓝图多长？',
    },
    choices: ['4cm', '5cm', '15cm', '100cm'],
    answer: '4cm',
    explanation: {
      en: '20 / 5 = 4cm. Going from real to blueprint? Divide!',
      zh: '20 / 5 = 4厘米。从实物到蓝图？除以比例！',
    },
    hints: {
      en: ['To find blueprint length, divide real length by the scale factor', '20 divided by 5 = ?'],
      zh: ['要找蓝图长度，用实际长度除以比例因子', '20除以5 = ?'],
    },
  },
  {
    instruction: {
      en: 'Scale 1:100. Blueprint shows 5cm. Real length?',
      zh: '比例尺 1:100。蓝图上5厘米。实际多长？',
    },
    choices: ['5m', '50m', '500cm', '105cm'],
    answer: '5m',
    explanation: {
      en: '5 x 100 = 500cm = 5m!',
      zh: '5 x 100 = 500厘米 = 5米！',
    },
    hints: {
      en: ['Multiply 5 by 100 to get centimeters, then convert to meters', '500cm = 5m'],
      zh: ['5乘以100得到厘米，再转换成米', '500厘米 = 5米'],
    },
  },
  {
    instruction: {
      en: 'Scale 1:25. Real wall is 75cm. Blueprint length?',
      zh: '比例尺 1:25。实际墙壁75厘米。蓝图多长？',
    },
    choices: ['2cm', '3cm', '5cm', '25cm'],
    answer: '3cm',
    explanation: {
      en: '75 / 25 = 3cm. Divide real size by scale to get blueprint size!',
      zh: '75 / 25 = 3厘米。实际尺寸除以比例就是蓝图尺寸！',
    },
    hints: {
      en: ['Real to blueprint: divide by the scale factor', '75 / 25 = ?'],
      zh: ['实物到蓝图：除以比例因子', '75 / 25 = ?'],
    },
  },
]

// ─── Target positions (4 targets spread across the arena) ────
const TARGET_POSITIONS = [
  { x: 70, y: 80 },
  { x: 200, y: 60 },
  { x: 330, y: 80 },
  { x: 135, y: 190 },
]

// ─── Main Component ──────────────────────────────────────────
export default function BlueprintShot({ levelData, onComplete }) {
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
    color: '#60A5FA',
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
      ? '看比例尺，算出真实长度。瞄准正确答案射击！'
      : 'Read the scale, calculate the real length. Aim and shoot the correct answer!')

  const hints = task.hints[lang]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>📐</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '蓝图射击' : 'Blueprint Shot'}
        </h2>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          {taskIndex + 1} / {TASKS.length}
        </div>
      </div>

      {/* Instruction */}
      <div className="card" style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: '#64748B', marginBottom: 6 }}>
          📋 {lang === 'zh' ? '蓝图任务' : 'BLUEPRINT MISSION'}
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
        background="workshop"
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
