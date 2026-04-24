import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import AlchemyShooter, { playSuccessSound, playNextSound } from './AlchemyShooter'
import ProfessorPi from '../../components/ProfessorPi'

// ═══════════════════════════════════════════════════════════════
// PHASE 1: Shell Crack — equivalent ratios + simplify
// ═══════════════════════════════════════════════════════════════
const PHASE1_TASKS = [
  {
    instruction: {
      en: 'Shoot ALL ratios equivalent to 2:3!',
      zh: '射击所有与 2:3 等价的比率！',
    },
    choices: ['4:6', '6:9', '3:4', '8:12'],
    answers: ['4:6', '6:9', '8:12'],
    hints: {
      en: ['Multiply both parts by the same number', '2x2=4, 3x2=6. 2x3=6, 3x3=9...'],
      zh: ['两边同乘一个数', '2x2=4, 3x2=6. 2x3=6, 3x3=9...'],
    },
  },
  {
    instruction: {
      en: 'Simplify 18:24 — shoot the simplest form!',
      zh: '化简 18:24 — 射击最简形式！',
    },
    choices: ['3:4', '9:12', '6:8', '2:3'],
    answers: ['3:4'],
    hints: {
      en: ['Find the GCD of 18 and 24', 'GCD is 6. 18/6=3, 24/6=4'],
      zh: ['找18和24的最大公约数', '最大公约数是6。18/6=3, 24/6=4'],
    },
  },
]

// ═══════════════════════════════════════════════════════════════
// PHASE 2: Poison Fog — unit rate + comparing rates
// ═══════════════════════════════════════════════════════════════
const PHASE2_TASKS = [
  {
    instruction: {
      en: '150 potions in 3 hours. Shoot the unit rate!',
      zh: '3小时酿150瓶药水。射击单位速率！',
    },
    choices: ['50/hr', '75/hr', '30/hr', '45/hr'],
    answers: ['50/hr'],
    hints: {
      en: ['Divide total by time', '150 / 3 = ?'],
      zh: ['总数除以时间', '150 / 3 = ?'],
    },
  },
  {
    instruction: {
      en: 'Which is faster? A: 120 in 4h or B: 100 in 5h?',
      zh: '哪个更快？A: 4小时120瓶 B: 5小时100瓶？',
    },
    choices: ['A', 'B', 'Same', '25/hr'],
    answers: ['A'],
    hints: {
      en: ['Find unit rates: 120/4 vs 100/5', 'A=30/hr, B=20/hr. A is faster!'],
      zh: ['求单位速率：120/4 对比 100/5', 'A=30/hr, B=20/hr。A更快！'],
    },
  },
]

// ═══════════════════════════════════════════════════════════════
// PHASE 3: Rune Decode — solving proportions
// ═══════════════════════════════════════════════════════════════
const PHASE3_TASKS = [
  {
    instruction: {
      en: 'Solve: 3/4 = x/20. Shoot x!',
      zh: '解方程: 3/4 = x/20。射击 x！',
    },
    choices: ['15', '12', '16', '10'],
    answers: ['15'],
    hints: {
      en: ['Cross multiply: 3 x 20 = 4 x x', '60 = 4x, so x = 15'],
      zh: ['交叉相乘: 3 x 20 = 4 x x', '60 = 4x, 所以 x = 15'],
    },
  },
  {
    instruction: {
      en: 'Solve: 5/8 = 25/x. Shoot x!',
      zh: '解方程: 5/8 = 25/x。射击 x！',
    },
    choices: ['35', '40', '30', '45'],
    answers: ['40'],
    hints: {
      en: ['Cross multiply: 5 x x = 8 x 25', '5x = 200, so x = 40'],
      zh: ['交叉相乘: 5 x x = 8 x 25', '5x = 200, 所以 x = 40'],
    },
  },
]

// ═══════════════════════════════════════════════════════════════
// PHASE 4: Core Purify — percent + conversion
// ═══════════════════════════════════════════════════════════════
const PHASE4_TASKS = [
  {
    instruction: {
      en: 'Convert 3/8 to a percent! (round to nearest whole)',
      zh: '把 3/8 转换成百分比！（四舍五入到整数）',
    },
    choices: ['37.5%', '25%', '33%', '40%'],
    answers: ['37.5%'],
    hints: {
      en: ['3 / 8 = 0.375', '0.375 x 100 = 37.5%'],
      zh: ['3 / 8 = 0.375', '0.375 x 100 = 37.5%'],
    },
  },
  {
    instruction: {
      en: 'Which equals 0.6? Shoot ALL correct forms!',
      zh: '哪些等于 0.6？射击所有正确形式！',
    },
    choices: ['3/5', '60%', '2/3', '6/10'],
    answers: ['3/5', '60%', '6/10'],
    hints: {
      en: ['0.6 = 6/10 = 3/5 = 60%', 'Check: 2/3 = 0.666... not 0.6'],
      zh: ['0.6 = 6/10 = 3/5 = 60%', '验证: 2/3 = 0.666... 不是0.6'],
    },
  },
]

const PHASES = [
  { tasks: PHASE1_TASKS, mode: 'multi', bg: 'workshop' },
  { tasks: PHASE2_TASKS, mode: 'single', bg: 'vault' },
  { tasks: PHASE3_TASKS, mode: 'single', bg: 'garden' },
  { tasks: PHASE4_TASKS, mode: 'multi', bg: 'vault' },
]

const PHASE_NAMES = {
  en: ['Shell Crack', 'Poison Fog', 'Rune Decode', 'Core Purify'],
  zh: ['外壳裂解', '毒雾拦截', '符文破解', '核心净化'],
}

const PHASE_ICONS = ['🛡️', '☁️', '🔮', '💎']

// ─── Target layout ──────────────────────────────────────────
const POSITIONS_4 = [
  { x: 70, y: 100 },
  { x: 200, y: 70 },
  { x: 330, y: 100 },
  { x: 200, y: 190 },
]

// ─── Chimera face SVG ───────────────────────────────────────
function ChimeraFace({ phase, maxPhase }) {
  const damage = phase / maxPhase
  const eyeColor = damage > 0.75 ? '#4ADE80' : damage > 0.5 ? '#F59E0B' : '#EF4444'
  const bodyColor = damage > 0.75 ? '#64748B' : '#8B5CF6'

  return (
    <svg viewBox="0 0 120 80" style={{ width: 120, height: 80, display: 'block', margin: '0 auto' }}>
      {/* Body */}
      <ellipse cx={60} cy={45} rx={45} ry={30} fill={bodyColor} opacity={0.85}>
        <animate attributeName="rx" values="45;47;45" dur="2s" repeatCount="indefinite" />
      </ellipse>
      {/* Horns */}
      <path d="M25 25 L15 5 L30 20" fill="#F59E0B" opacity={0.8} />
      <path d="M95 25 L105 5 L90 20" fill="#F59E0B" opacity={0.8} />
      {/* Eyes */}
      <circle cx={45} cy={38} r={6} fill={eyeColor}>
        <animate attributeName="r" values="6;7;6" dur="1.2s" repeatCount="indefinite" />
      </circle>
      <circle cx={75} cy={38} r={6} fill={eyeColor}>
        <animate attributeName="r" values="6;7;6" dur="1.2s" begin="0.2s" repeatCount="indefinite" />
      </circle>
      {/* Eye pupils */}
      <circle cx={46} cy={39} r={2.5} fill="#1E1B2E" />
      <circle cx={76} cy={39} r={2.5} fill="#1E1B2E" />
      {/* Mouth */}
      <path d="M42 55 Q60 65 78 55" fill="none" stroke="#1E1B2E" strokeWidth={2} strokeLinecap="round" />
      {/* Fangs */}
      <path d="M48 55 L46 62 L50 57" fill="white" />
      <path d="M72 55 L74 62 L70 57" fill="white" />
      {/* Cracks from damage */}
      {phase >= 1 && <path d="M20 30 L30 40 L25 50" fill="none" stroke="#4ADE80" strokeWidth={1.5} opacity={0.6} />}
      {phase >= 2 && <path d="M100 30 L90 42 L95 52" fill="none" stroke="#4ADE80" strokeWidth={1.5} opacity={0.6} />}
      {phase >= 3 && <path d="M55 20 L60 32 L65 22" fill="none" stroke="#4ADE80" strokeWidth={1.5} opacity={0.6} />}
      {/* Glitch aura */}
      {damage < 0.75 && (
        <ellipse cx={60} cy={45} rx={50} ry={35} fill="none" stroke="#EF4444" strokeWidth={1} opacity={0.3}>
          <animate attributeName="rx" values="50;53;50" dur="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1s" repeatCount="indefinite" />
        </ellipse>
      )}
    </svg>
  )
}

// ─── Boss HP Bar ────────────────────────────────────────────
function BossHPBar({ phase, maxPhase }) {
  const remaining = maxPhase - phase
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', width: '100%', maxWidth: 280 }}>
      {Array.from({ length: maxPhase }, (_, i) => (
        <div key={i} style={{
          flex: 1, height: 12, borderRadius: 6,
          background: i < phase ? '#334155' : i === phase ? '#EF4444' : '#64748B',
          opacity: i < phase ? 0.3 : 1,
          transition: 'all 0.5s',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {i === phase && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 6,
              background: 'linear-gradient(90deg, #EF4444, #F59E0B)',
              animation: 'pulse 1s infinite',
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function ChimeraAmalgam({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [phase, setPhase] = useState(0) // 0-3
  const [taskIdx, setTaskIdx] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [solved, setSolved] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [phaseTransition, setPhaseTransition] = useState(false)
  const [allDone, setAllDone] = useState(false)
  const [shotCorrect, setShotCorrect] = useState(new Set())

  const phaseConfig = PHASES[phase]
  const tasks = phaseConfig.tasks
  const task = tasks[taskIdx]

  // Build targets
  const targets = task.choices.map((label, i) => ({
    id: `p${phase}-t${taskIdx}-${i}`,
    x: POSITIONS_4[i].x,
    y: POSITIONS_4[i].y,
    label,
    value: label,
    color: phase === 0 ? '#A78BFA' : phase === 1 ? '#F472B6' : phase === 2 ? '#60A5FA' : '#4ECDC4',
  }))

  // Handle shooting
  const handleShoot = useCallback((target) => {
    const isCorrect = task.answers.includes(target.value)

    if (isCorrect) {
      const newShot = new Set(shotCorrect)
      newShot.add(target.value)
      setShotCorrect(newShot)

      // Check if all correct answers found
      const allFound = task.answers.every(a => newShot.has(a))
      if (allFound) {
        playSuccessSound()
        setSolved(true)
        setShowExplanation(true)
      }
      return 'correct'
    } else {
      setMistakes(m => m + 1)
      setShowHint(true)
      return 'wrong'
    }
  }, [task, shotCorrect])

  // Advance to next task or phase
  const handleNext = useCallback(() => {
    const nextTask = taskIdx + 1

    if (nextTask >= tasks.length) {
      // Phase complete!
      const nextPhase = phase + 1
      if (nextPhase >= PHASES.length) {
        // Boss defeated!
        setAllDone(true)
      } else {
        // Transition to next phase
        setPhaseTransition(true)
        setTimeout(() => {
          setPhase(nextPhase)
          setTaskIdx(0)
          setSolved(false)
          setShowExplanation(false)
          setShowHint(false)
          setShotCorrect(new Set())
          setPhaseTransition(false)
        }, 1500)
      }
    } else {
      setTaskIdx(nextTask)
      setSolved(false)
      setShowExplanation(false)
      setShowHint(false)
      setShotCorrect(new Set())
    }
  }, [taskIdx, tasks.length, phase])

  // Final completion
  const handleFinish = useCallback(() => {
    const stars = mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1
    onComplete({ stars, mistakes })
  }, [mistakes, onComplete])

  const phaseName = PHASE_NAMES[lang][phase]

  const hints = task.hints[lang]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 12,
    }}>
      {/* Boss Header */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <ChimeraFace phase={phase} maxPhase={PHASES.length} />
        <h2 style={{
          fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 900,
          color: allDone ? '#059669' : '#EF4444', margin: '4px 0 0',
        }}>
          {lang === 'zh' ? '混沌嵌合兽' : 'Chimera Amalgam'}
        </h2>
        <BossHPBar phase={phase} maxPhase={PHASES.length} />
      </div>

      {/* Phase transition */}
      {phaseTransition && (
        <div style={{
          textAlign: 'center', padding: 24, animation: 'bounce-in 0.4s',
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>{PHASE_ICONS[phase]}</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#4ECDC4' }}>
            {lang === 'zh' ? '阶段完成！' : 'Phase Complete!'}
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', marginTop: 4 }}>
            {lang === 'zh'
              ? `进入 ${PHASE_NAMES.zh[phase + 1]}...`
              : `Entering ${PHASE_NAMES.en[phase + 1]}...`}
          </div>
        </div>
      )}

      {/* Active phase content */}
      {!phaseTransition && !allDone && (
        <>
          {/* Phase badge + instruction */}
          <div className="card" style={{ textAlign: 'center', maxWidth: 420, width: '100%' }}>
            <div style={{
              display: 'inline-block', padding: '2px 12px', borderRadius: 12,
              background: 'rgba(239,68,68,0.1)', color: '#EF4444',
              fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 8,
            }}>
              {PHASE_ICONS[phase]} PHASE {phase + 1}: {phaseName.toUpperCase()}
            </div>
            <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', fontWeight: 600, color: '#1E293B' }}>
              {task.instruction[lang]}
            </div>
            {phaseConfig.mode === 'multi' && task.answers.length > 1 && (
              <div style={{ fontSize: 12, color: '#F59E0B', fontWeight: 700, marginTop: 6 }}>
                {lang === 'zh'
                  ? `射击所有正确答案！(${shotCorrect.size}/${task.answers.length})`
                  : `Shoot all correct answers! (${shotCorrect.size}/${task.answers.length})`}
              </div>
            )}
          </div>

          {/* Shooter */}
          <AlchemyShooter
            targets={targets}
            onShoot={handleShoot}
            mode={phaseConfig.mode}
            solved={solved}
            background={phaseConfig.bg}
            drift
          />

          {/* Explanation */}
          {showExplanation && (
            <div className="card" style={{
              maxWidth: 400, width: '100%', textAlign: 'center',
              background: '#E0FFF8', border: '2px solid #4ECDC4',
              animation: 'bounce-in 0.4s',
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>
                {taskIdx === tasks.length - 1 ? '💥' : '🎯'}
              </div>
              <p style={{ fontSize: 15, color: '#1E293B', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
                {taskIdx === tasks.length - 1
                  ? (lang === 'zh' ? `${phaseName}完成！嵌合兽的护甲出现裂缝！` : `${phaseName} complete! The Chimera's armor is cracking!`)
                  : (lang === 'zh' ? '命中！继续攻击！' : 'Hit! Keep attacking!')}
              </p>
              <button className="btn btn-primary" onClick={handleNext} style={{ marginTop: 16 }}>
                {taskIdx < tasks.length - 1
                  ? (lang === 'zh' ? '继续攻击！ →' : 'Keep attacking! →')
                  : phase < PHASES.length - 1
                    ? (lang === 'zh' ? '进入下一阶段！' : 'Next phase!')
                    : (lang === 'zh' ? '最终一击！' : 'Final blow!')}
              </button>
            </div>
          )}
        </>
      )}

      {/* Victory */}
      {allDone && (
        <div className="card" style={{
          maxWidth: 420, width: '100%', textAlign: 'center',
          background: 'linear-gradient(135deg, #EDE9FE, #E0FFF8)', border: '2px solid #8B5CF6',
          animation: 'bounce-in 0.4s',
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🐲✨</div>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: '#7C3AED', margin: '0 0 8px' }}>
            {lang === 'zh' ? '嵌合兽被净化了！' : 'The Chimera is purified!'}
          </h3>
          <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 8px', lineHeight: 1.6 }}>
            {lang === 'zh'
              ? '比例罗斯从水晶瓶中被解封！她感谢你修复了炼金工坊。'
              : 'Ratio Rose is freed from the crystal flask! She thanks you for restoring the alchemy workshop.'}
          </p>
          <p style={{ fontSize: 14, color: '#7C3AED', fontWeight: 700, margin: '0 0 16px' }}>
            {lang === 'zh'
              ? '第二块水晶碎片已经恢复！'
              : 'The second Crystal Shard is restored!'}
          </p>
          <div style={{
            display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16,
          }}>
            {[1, 2, 3, 4].map(p => (
              <div key={p} style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#4ECDC4', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800,
              }}>
                ✓
              </div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={handleFinish}>
            {lang === 'zh' ? '获得水晶碎片！' : 'Claim the Crystal Shard!'}
          </button>
        </div>
      )}

      {/* Phase progress dots */}
      {!allDone && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          {PHASES.map((_, i) => (
            <div key={i} style={{
              width: 28, height: 28, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i < phase ? '#4ECDC4' : i === phase ? '#EF4444' : '#E2E8F0',
              color: i <= phase ? 'white' : '#94A3B8',
              fontSize: 12, fontWeight: 800, transition: 'background 0.3s',
            }}>
              {i < phase ? '✓' : PHASE_ICONS[i]}
            </div>
          ))}
        </div>
      )}

      {/* Professor Pi */}
      {!allDone && !phaseTransition && (
        <div style={{ maxWidth: 420, width: '100%', marginTop: 8 }}>
          <ProfessorPi
            message={
              solved
                ? (lang === 'zh' ? '干得好！继续攻击嵌合兽！' : 'Well done! Keep attacking the Chimera!')
                : (lang === 'zh'
                  ? '用你学到的所有比率知识打败嵌合兽！'
                  : 'Use everything you learned about ratios to defeat the Chimera!')
            }
            hints={hints}
            showHint={showHint}
          />
        </div>
      )}
    </div>
  )
}
