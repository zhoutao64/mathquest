import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    type: 'select_multiples',
    instruction: {
      en: 'Light up every beat that is a multiple of 3!',
      zh: '点亮所有 3 的倍数的节拍！',
    },
    base: 3,
    range: 15,
    answers: [3, 6, 9, 12, 15],
    explanation: {
      en: 'Multiples of 3: 3, 6, 9, 12, 15 — skip-count by 3!',
      zh: '3 的倍数：3、6、9、12、15——每隔 3 数一个！',
    },
  },
  {
    type: 'select_multiples',
    instruction: {
      en: 'Light up every beat that is a multiple of 4!',
      zh: '点亮所有 4 的倍数的节拍！',
    },
    base: 4,
    range: 16,
    answers: [4, 8, 12, 16],
    explanation: {
      en: 'Multiples of 4: 4, 8, 12, 16 — skip-count by 4!',
      zh: '4 的倍数：4、8、12、16——每隔 4 数一个！',
    },
  },
  {
    type: 'find_lcm',
    instruction: {
      en: 'Drum A beats every 2, Drum B every 3. When do they first SYNC?',
      zh: '鼓 A 每 2 拍响，鼓 B 每 3 拍响。它们第一次同时响是哪拍？',
    },
    trackA: 2,
    trackB: 3,
    range: 12,
    answer: 6,
    explanation: {
      en: 'LCM(2, 3) = 6. Beat 6 is the first time both drums hit together!',
      zh: 'LCM(2, 3) = 6。第 6 拍是两个鼓第一次同时响！',
    },
  },
  {
    type: 'find_lcm',
    instruction: {
      en: 'Drum A beats every 3, Drum B every 4. First SYNC beat?',
      zh: '鼓 A 每 3 拍响，鼓 B 每 4 拍响。第一次同步是哪拍？',
    },
    trackA: 3,
    trackB: 4,
    range: 16,
    answer: 12,
    explanation: {
      en: 'LCM(3, 4) = 12. Skip-count by 3 and by 4 — they meet at 12!',
      zh: 'LCM(3, 4) = 12。按 3 数和按 4 数——它们在 12 相遇！',
    },
  },
  {
    type: 'find_lcm',
    instruction: {
      en: 'Drum A beats every 4, Drum B every 6. First SYNC beat?',
      zh: '鼓 A 每 4 拍响，鼓 B 每 6 拍响。第一次同步是哪拍？',
    },
    trackA: 4,
    trackB: 6,
    range: 16,
    answer: 12,
    explanation: {
      en: 'LCM(4, 6) = 12. Not 24! Both 4 and 6 divide into 12 — that\'s the LCM!',
      zh: 'LCM(4, 6) = 12。不是 24！4 和 6 都能整除 12——这就是最小公倍数！',
    },
  },
]

// ─── Drum Icon SVG ──────────────────────────────────────────
function DrumIcon({ x, y, color, size = 20 }) {
  const s = size
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Drum body */}
      <ellipse cx={0} cy={s * 0.15} rx={s * 0.4} ry={s * 0.12} fill={color} opacity={0.3} />
      <rect x={-s * 0.4} y={-s * 0.2} width={s * 0.8} height={s * 0.35} rx={2} fill={color} />
      <ellipse cx={0} cy={-s * 0.2} rx={s * 0.4} ry={s * 0.12} fill={color} />
      <ellipse cx={0} cy={-s * 0.2} rx={s * 0.3} ry={s * 0.08} fill="rgba(255,255,255,0.3)" />
      {/* Drumsticks */}
      <line x1={-s * 0.25} y1={-s * 0.45} x2={s * 0.05} y2={-s * 0.2}
        stroke="#F5E6D3" strokeWidth={1.5} strokeLinecap="round" />
      <line x1={s * 0.25} y1={-s * 0.45} x2={-s * 0.05} y2={-s * 0.2}
        stroke="#F5E6D3" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={-s * 0.25} cy={-s * 0.45} r={1.5} fill="#F5E6D3" />
      <circle cx={s * 0.25} cy={-s * 0.45} r={1.5} fill="#F5E6D3" />
    </g>
  )
}

// ─── Beat Timeline SVG ──────────────────────────────────────
function BeatTimeline({ task, selectedBeats, wrongBeats, solved, lang, onBeatClick }) {
  const isLcm = task.type === 'find_lcm'
  const count = task.range
  const W = Math.max(380, count * 28 + 60)
  const H = isLcm ? 160 : 110
  const padL = 30
  const padR = 20
  const trackW = W - padL - padR
  const spacing = trackW / count

  const trackAColor = '#4ECDC4'
  const trackBColor = '#F472B6'
  const syncColor = '#FFE66D'
  const selectedColor = '#A78BFA'

  const singleTrackY = 55
  const trackAY = 45
  const trackBY = 95

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 480, display: 'block', margin: '0 auto' }}>
      {/* Dark studio background */}
      <rect x={0} y={0} width={W} height={H} rx={8} fill="#1E1B2E" />

      {/* Floating music notes */}
      <text x={14} y={18} fontSize={10} opacity={0.2} fill="#A78BFA">&#9835;</text>
      <text x={W - 22} y={22} fontSize={12} opacity={0.15} fill="#F472B6">&#9834;</text>
      <text x={W / 2 + 30} y={H - 8} fontSize={9} opacity={0.15} fill="#4ECDC4">&#9833;</text>

      {isLcm ? (
        <>
          {/* Track labels */}
          <text x={8} y={trackAY + 5} fontSize={10} fontWeight={800} fill={trackAColor}
            fontFamily="Nunito, sans-serif">A</text>
          <text x={8} y={trackBY + 5} fontSize={10} fontWeight={800} fill={trackBColor}
            fontFamily="Nunito, sans-serif">B</text>

          {/* Track A line */}
          <line x1={padL} y1={trackAY} x2={padL + trackW} y2={trackAY}
            stroke="#334155" strokeWidth={2} />
          {/* Track B line */}
          <line x1={padL} y1={trackBY} x2={padL + trackW} y2={trackBY}
            stroke="#334155" strokeWidth={2} />

          {/* Beat circles — clickable */}
          {Array.from({ length: count }, (_, i) => {
            const n = i + 1
            const cx = padL + (i + 0.5) * spacing
            const isMultA = n % task.trackA === 0
            const isMultB = n % task.trackB === 0
            const isSync = isMultA && isMultB
            const isSelected = selectedBeats.includes(n)
            const isWrong = wrongBeats.includes(n)
            const isAnswer = n === task.answer
            const clickable = !solved

            return (
              <g key={n} onClick={clickable ? () => onBeatClick(n) : undefined}
                style={{ cursor: clickable ? 'pointer' : 'default' }}>
                {/* Larger hit area between tracks */}
                {clickable && (
                  <rect x={cx - spacing / 2} y={trackAY - 14} width={spacing} height={trackBY - trackAY + 28}
                    fill="transparent" />
                )}
                {/* Track A beat */}
                <circle cx={cx} cy={trackAY} r={isMultA ? 9 : 6}
                  fill={isMultA ? trackAColor : '#334155'}
                  opacity={isMultA ? 0.9 : 0.4}
                  stroke={isMultA ? trackAColor : 'none'} strokeWidth={1}>
                  {isMultA && solved && isAnswer && (
                    <animate attributeName="r" values="9;12;9" dur="1s" repeatCount="indefinite" />
                  )}
                </circle>

                {/* Track B beat */}
                <circle cx={cx} cy={trackBY} r={isMultB ? 9 : 6}
                  fill={isMultB ? trackBColor : '#334155'}
                  opacity={isMultB ? 0.9 : 0.4}
                  stroke={isMultB ? trackBColor : 'none'} strokeWidth={1}>
                  {isMultB && solved && isAnswer && (
                    <animate attributeName="r" values="9;12;9" dur="1s" repeatCount="indefinite" />
                  )}
                </circle>

                {/* Sync burst */}
                {isSync && solved && (
                  <g>
                    <line x1={cx} y1={trackAY + 10} x2={cx} y2={trackBY - 10}
                      stroke={syncColor} strokeWidth={2} opacity={0.8} />
                    <circle cx={cx} cy={(trackAY + trackBY) / 2} r={10}
                      fill="none" stroke={syncColor} strokeWidth={2}>
                      <animate attributeName="r" values="8;14;8" dur="1.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                    <text x={cx} y={(trackAY + trackBY) / 2 + 4} textAnchor="middle"
                      fontSize={8} fontWeight={800} fill={syncColor}>SYNC!</text>
                  </g>
                )}

                {/* Selection indicator */}
                {isSelected && !solved && (
                  <circle cx={cx} cy={(trackAY + trackBY) / 2} r={12}
                    fill="none" stroke={syncColor} strokeWidth={2.5} strokeDasharray="3,2" />
                )}

                {/* Wrong X */}
                {isWrong && (
                  <g transform={`translate(${cx}, ${(trackAY + trackBY) / 2})`}>
                    <circle cx={0} cy={0} r={8} fill="#EF4444" opacity={0.7} />
                    <path d="M -3 -3 L 3 3 M 3 -3 L -3 3" fill="none" stroke="white"
                      strokeWidth={1.5} strokeLinecap="round" />
                  </g>
                )}

                {/* Beat number */}
                <text x={cx} y={H - 6} textAnchor="middle" fontSize={8}
                  fill={isSync ? syncColor : '#64748B'} fontWeight={isSync ? 800 : 400}
                  fontFamily="Nunito, sans-serif">
                  {n}
                </text>
              </g>
            )
          })}

          {/* Drum icons */}
          <DrumIcon x={W - 14} y={trackAY} color={trackAColor} size={16} />
          <DrumIcon x={W - 14} y={trackBY} color={trackBColor} size={16} />
        </>
      ) : (
        <>
          {/* Single track */}
          <line x1={padL} y1={singleTrackY} x2={padL + trackW} y2={singleTrackY}
            stroke="#334155" strokeWidth={2} />

          {/* Label */}
          <text x={padL - 4} y={20} fontSize={11} fontWeight={800} fill={selectedColor}
            fontFamily="Nunito, sans-serif" textAnchor="end">
            x{task.base}
          </text>

          {/* Beat circles — clickable */}
          {Array.from({ length: count }, (_, i) => {
            const n = i + 1
            const cx = padL + (i + 0.5) * spacing
            const isMultiple = n % task.base === 0
            const isSelected = selectedBeats.includes(n)
            const isWrong = wrongBeats.includes(n)
            const correctlySelected = isSelected && isMultiple
            const clickable = !solved && !correctlySelected

            return (
              <g key={n} onClick={clickable ? () => onBeatClick(n) : undefined}
                style={{ cursor: clickable ? 'pointer' : 'default' }}>
                {/* Larger hit area */}
                {clickable && (
                  <circle cx={cx} cy={singleTrackY} r={14} fill="transparent" />
                )}
                <circle cx={cx} cy={singleTrackY}
                  r={correctlySelected ? 11 : isSelected || isMultiple ? 9 : 7}
                  fill={
                    correctlySelected ? selectedColor
                      : isWrong ? '#EF4444'
                        : '#334155'
                  }
                  opacity={correctlySelected ? 1 : isWrong ? 0.6 : 0.6}
                  stroke={correctlySelected ? selectedColor : 'none'} strokeWidth={1.5}>
                  {correctlySelected && (
                    <animate attributeName="r" values="10;13;10" dur="1.5s" repeatCount="indefinite" />
                  )}
                </circle>

                {/* Check for correctly selected */}
                {correctlySelected && (
                  <path d={`M ${cx - 3} ${singleTrackY} L ${cx - 1} ${singleTrackY + 3} L ${cx + 4} ${singleTrackY - 3}`}
                    fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" />
                )}

                {/* X for wrong */}
                {isWrong && (
                  <g transform={`translate(${cx}, ${singleTrackY})`}>
                    <path d="M -3 -3 L 3 3 M 3 -3 L -3 3" fill="none" stroke="white"
                      strokeWidth={1.5} strokeLinecap="round" />
                  </g>
                )}

                {/* Beat number */}
                <text x={cx} y={singleTrackY + (correctlySelected ? 26 : 22)}
                  textAnchor="middle" fontSize={8}
                  fill={correctlySelected ? selectedColor : '#64748B'}
                  fontWeight={correctlySelected ? 800 : 400}
                  fontFamily="Nunito, sans-serif">
                  {n}
                </text>
              </g>
            )
          })}

          {/* Drum icon */}
          <DrumIcon x={W - 14} y={singleTrackY} color={selectedColor} size={18} />
        </>
      )}
    </svg>
  )
}

// ─── Number Button Grid ─────────────────────────────────────
function NumberButtonGrid({ task, selectedBeats, wrongBeats, solved, lang, onBeatClick }) {
  const count = task.range
  const isLcm = task.type === 'find_lcm'

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
      maxWidth: 420, margin: '0 auto',
    }}>
      {Array.from({ length: count }, (_, i) => {
        const n = i + 1
        const isSelected = selectedBeats.includes(n)
        const isWrong = wrongBeats.includes(n)

        let bg = '#F1F5F9'
        let color = '#1E293B'
        let border = '2px solid #E2E8F0'

        if (isSelected && !isLcm) {
          bg = '#A78BFA'
          color = 'white'
          border = '2px solid #A78BFA'
        } else if (isSelected && isLcm) {
          bg = '#FFE66D'
          color = '#1E293B'
          border = '2px solid #FFB800'
        } else if (isWrong) {
          bg = '#FEE2E2'
          color = '#EF4444'
          border = '2px solid #EF4444'
        }

        if (solved && !isSelected) {
          // Show correct answers after solving
          if (!isLcm && task.answers.includes(n)) {
            bg = '#DDD6FE'
            border = '2px solid #A78BFA'
          }
        }

        const clickable = !solved && !(isSelected && !isLcm)

        return (
          <button
            key={n}
            onClick={clickable ? () => onBeatClick(n) : undefined}
            style={{
              width: 48, height: 48, borderRadius: 12,
              background: bg, color, border,
              fontSize: 18, fontWeight: 700,
              cursor: clickable ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease',
              transform: isSelected ? 'scale(1.08)' : isWrong ? 'scale(0.95)' : 'scale(1)',
              boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
              opacity: solved && !isSelected && !(task.answers && task.answers.includes(n)) ? 0.4 : 1,
            }}
          >
            {isSelected && !isLcm ? '\u2713' : n}
          </button>
        )
      })}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function MultipleMachine({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [solved, setSolved] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)

  const [selectedBeats, setSelectedBeats] = useState([])
  const [wrongBeats, setWrongBeats] = useState([])
  const [submitted, setSubmitted] = useState(false)

  const task = TASKS[taskIndex]

  // select_multiples: toggle a beat on/off
  const handleBeatClick = useCallback((n) => {
    if (solved) return

    if (task.type === 'select_multiples') {
      if (selectedBeats.includes(n)) {
        // Deselect
        setSelectedBeats(prev => prev.filter(b => b !== n))
      } else {
        setSelectedBeats(prev => [...prev, n])
      }
      // Clear any wrong state on new interaction
      setWrongBeats([])
      setSubmitted(false)
    } else if (task.type === 'find_lcm') {
      // Toggle single selection for LCM
      if (selectedBeats.includes(n)) {
        setSelectedBeats([])
      } else {
        setSelectedBeats([n])
      }
      setWrongBeats([])
      setSubmitted(false)
    }
  }, [task, selectedBeats, solved])

  // Submit answer
  const handleSubmit = useCallback(() => {
    if (solved || selectedBeats.length === 0) return

    if (task.type === 'select_multiples') {
      // Check if selection matches answers exactly
      const correct = task.answers.every(a => selectedBeats.includes(a))
        && selectedBeats.every(s => task.answers.includes(s))

      if (correct) {
        setSolved(true)
        setShowExplanation(true)
      } else {
        // Mark wrong selections and missing ones
        const wrongOnes = selectedBeats.filter(s => !task.answers.includes(s))
        setWrongBeats(wrongOnes)
        setMistakes(m => m + 1)
        setShowHint(true)
        setSubmitted(true)
      }
    } else if (task.type === 'find_lcm') {
      const n = selectedBeats[0]
      if (n === task.answer) {
        setSolved(true)
        setShowExplanation(true)
      } else {
        setWrongBeats([n])
        setMistakes(m => m + 1)
        setShowHint(true)
        setSubmitted(true)
      }
    }
  }, [task, selectedBeats, solved])

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
      setSelectedBeats([])
      setWrongBeats([])
      setSubmitted(false)
    }
  }, [taskIndex, mistakes, onComplete])

  // Hints
  const hints = task.type === 'select_multiples'
    ? [
        lang === 'zh'
          ? `${task.base} 的倍数就是 ${task.base}, ${task.base * 2}, ${task.base * 3}... 每次加 ${task.base}！`
          : `Multiples of ${task.base}: ${task.base}, ${task.base * 2}, ${task.base * 3}... add ${task.base} each time!`,
        lang === 'zh'
          ? '倍数 = 跳着数！从 0 开始，每次往前跳同样的步数。'
          : 'Multiples = skip-counting! Start at 0, jump the same amount each time.',
      ]
    : [
        lang === 'zh'
          ? `在数字中找到 ${task.trackA} 和 ${task.trackB} 的最小公倍数！`
          : `Find the smallest number that both ${task.trackA} and ${task.trackB} divide into!`,
        lang === 'zh'
          ? '最小公倍数 = 两组跳数第一次落在同一个位置！'
          : 'LCM = the first number where BOTH skip-counting patterns land!',
      ]

  // Feedback message after wrong submit
  const feedbackMsg = submitted && !solved
    ? (task.type === 'select_multiples'
      ? (lang === 'zh'
        ? `还不对哦！${task.base} 的倍数一共有 ${task.answers.length} 个，再检查一下吧。`
        : `Not quite! There are ${task.answers.length} multiples of ${task.base}. Try again!`)
      : (lang === 'zh' ? '不对哦，再想想！' : 'Not quite, try again!'))
    : null

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>&#x1F941;</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '倍数机器' : 'Multiple Machine'}
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
        {task.type === 'select_multiples' && (
          <div style={{ marginTop: 8, fontSize: 14, color: '#64748B' }}>
            {lang === 'zh'
              ? `点击选择 ${task.base} 的倍数，选好后点提交`
              : `Tap multiples of ${task.base}, then hit Submit`}
          </div>
        )}
        {task.type === 'find_lcm' && (
          <div style={{ marginTop: 8, fontSize: 14, color: '#64748B' }}>
            {lang === 'zh'
              ? '选一个数字，然后点提交'
              : 'Pick a number, then hit Submit'}
          </div>
        )}
      </div>

      {/* LCM visual hint: show the two drum tracks */}
      {task.type === 'find_lcm' && (
        <div className="card" style={{ maxWidth: 520, width: '100%', padding: '12px 8px' }}>
          <BeatTimeline
            task={task}
            selectedBeats={solved ? selectedBeats : []}
            wrongBeats={[]}
            solved={solved}
            lang={lang}
            onBeatClick={() => {}}
          />
        </div>
      )}

      {/* Number button grid */}
      <div className="card" style={{ maxWidth: 480, width: '100%', padding: '16px 12px' }}>
        {!solved && (
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 10, textAlign: 'center' }}>
            {task.type === 'select_multiples'
              ? (lang === 'zh' ? '\u261D\uFE0F \u70B9\u51FB\u9009\u62E9\u6240\u6709\u4F60\u8BA4\u4E3A\u7684\u500D\u6570' : '\u261D\uFE0F Tap all the multiples you think are correct')
              : (lang === 'zh' ? '\u261D\uFE0F \u70B9\u51FB\u9009\u62E9\u4F60\u7684\u7B54\u6848' : '\u261D\uFE0F Tap to select your answer')}
          </div>
        )}
        <NumberButtonGrid
          task={task}
          selectedBeats={selectedBeats}
          wrongBeats={wrongBeats}
          solved={solved}
          lang={lang}
          onBeatClick={handleBeatClick}
        />
      </div>

      {/* Feedback message */}
      {feedbackMsg && (
        <div style={{
          fontSize: 14, color: '#EF4444', fontWeight: 600, textAlign: 'center',
          animation: 'bounce-in 0.3s',
        }}>
          {feedbackMsg}
        </div>
      )}

      {/* Submit button */}
      {!solved && (
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={selectedBeats.length === 0}
          style={{
            marginTop: 4, fontSize: 16, padding: '12px 40px',
            opacity: selectedBeats.length === 0 ? 0.4 : 1,
            cursor: selectedBeats.length === 0 ? 'default' : 'pointer',
          }}
        >
          {lang === 'zh' ? '\u2705 \u63D0\u4EA4\u7B54\u6848' : '\u2705 Submit'}
        </button>
      )}

      {/* Explanation */}
      {showExplanation && (
        <div className="card" style={{
          maxWidth: 400, width: '100%', textAlign: 'center',
          background: '#F3E8FF', border: '2px solid #A78BFA',
          animation: 'bounce-in 0.4s',
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>&#x1F3B6;</div>
          <p style={{ fontSize: 15, color: '#1E293B', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
            {task.explanation[lang]}
          </p>
          <button className="btn btn-primary" onClick={handleNext} style={{ marginTop: 16 }}>
            {taskIndex < TASKS.length - 1
              ? (lang === 'zh' ? '\u4E0B\u4E00\u9898\uFF01 \u2192' : 'Next! \u2192')
              : (lang === 'zh' ? '\u6F14\u594F\u5B8C\u6BD5\uFF01' : 'Concert over!')}
          </button>
        </div>
      )}

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {TASKS.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < tasksCompleted ? '#A78BFA' : i === taskIndex ? '#FFE66D' : '#E2E8F0',
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
              : task.type === 'select_multiples'
                ? (lang === 'zh' ? `找出所有 ${task.base} 的倍数！跳着数就行。` : `Find all multiples of ${task.base}! Just skip-count.`)
                : (lang === 'zh' ? '看两条轨道——哪个拍子两个鼓同时响？' : 'Watch both tracks — which beat do both drums hit?')
          }
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
