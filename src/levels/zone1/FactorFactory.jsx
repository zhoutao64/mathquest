import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data ───────────────────────────────────────────────
const TASKS = [
  {
    type: 'select_factors',
    instruction: { en: 'Select ALL numbers that divide 12 perfectly (no remainder)!', zh: '选出所有能整除 12 的数（没有余数）！' },
    totalApples: 12,
    range: [1, 2, 3, 4, 5, 6, 7, 8],
    answers: [1, 2, 3, 4, 6],
    explanation: {
      en: 'Factors of 12: 1, 2, 3, 4, 6. They divide 12 perfectly — no leftovers!',
      zh: '12 的因数：1、2、3、4、6。它们能整除 12——没有剩余！',
    },
  },
  {
    type: 'yes_no',
    instruction: { en: 'Is 3 a factor of 8? Can you split 8 into groups of 3?', zh: '3 是 8 的因数吗？8 能分成每组 3 个吗？' },
    totalApples: 8,
    boxSize: 3,
    answer: false,
    explanation: {
      en: '8 ÷ 3 = 2 remainder 2. 3 is NOT a factor of 8!',
      zh: '8 ÷ 3 = 2 余 2。3 不是 8 的因数！',
    },
  },
  {
    type: 'select_factors',
    instruction: { en: 'Select ALL numbers that divide 15 perfectly!', zh: '选出所有能整除 15 的数！' },
    totalApples: 15,
    range: [2, 3, 4, 5, 6, 7],
    answers: [3, 5],
    explanation: {
      en: 'From this range, factors of 15 are: 3 and 5. 15÷3=5, 15÷5=3!',
      zh: '这个范围内 15 的因数：3 和 5。15÷3=5，15÷5=3！',
    },
  },
  {
    type: 'gcf',
    instruction: { en: 'What is the BIGGEST number that divides BOTH 12 and 8?', zh: '能同时整除 12 和 8 的最大数是多少？' },
    groups: [12, 8],
    range: [1, 2, 3, 4, 5, 6],
    answer: 4,
    explanation: {
      en: 'GCF(12, 8) = 4. Both 12÷4=3 and 8÷4=2 divide perfectly!',
      zh: '最大公因数(12, 8) = 4。12÷4=3，8÷4=2，都能整除！',
    },
  },
  {
    type: 'gcf',
    instruction: { en: 'Find the GCF of 18 and 24! Pick the biggest that divides both.', zh: '找出 18 和 24 的最大公因数！选最大的能整除两者的数。' },
    groups: [18, 24],
    range: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    answer: 6,
    explanation: {
      en: 'GCF(18, 24) = 6. 18÷6=3 and 24÷6=4. The biggest factor they share!',
      zh: '最大公因数(18, 24) = 6。18÷6=3，24÷6=4。最大的公共因数！',
    },
  },
]

// ─── Apple grid display ─────────────────────────────────────
function AppleGrid({ total, boxSize, lang }) {
  const fullBoxes = boxSize ? Math.floor(total / boxSize) : 0
  const remainder = boxSize ? total % boxSize : 0

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Show the division */}
      {boxSize && (
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>
          {total} ÷ {boxSize} = {fullBoxes}{remainder > 0 ? ` ... ${remainder}` : ''}
        </div>
      )}
      {/* Apple visual */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
        {Array.from({ length: fullBoxes }, (_, boxIdx) => (
          <div key={boxIdx} style={{
            display: 'flex', gap: 2, padding: '4px 6px',
            background: '#D1FAE5', borderRadius: 8,
            border: '1.5px solid #4ECDC4',
          }}>
            {Array.from({ length: boxSize }, (_, j) => (
              <span key={j} style={{ fontSize: 14 }}>&#x1F34E;</span>
            ))}
          </div>
        ))}
        {remainder > 0 && (
          <div style={{
            display: 'flex', gap: 2, padding: '4px 6px',
            background: '#FEE2E2', borderRadius: 8,
            border: '1.5px dashed #EF4444',
          }}>
            {Array.from({ length: remainder }, (_, j) => (
              <span key={j} style={{ fontSize: 14 }}>&#x1F34E;</span>
            ))}
            <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 700, alignSelf: 'center' }}>?</span>
          </div>
        )}
      </div>
      {/* Result label */}
      {boxSize && (
        <div style={{
          marginTop: 8, fontSize: 13, fontWeight: 700,
          color: remainder === 0 ? '#059669' : '#DC2626',
        }}>
          {remainder === 0
            ? (lang === 'zh' ? '\u2705 \u521A\u597D\u88C5\u6EE1\uFF01' : '\u2705 Perfect fit!')
            : (lang === 'zh' ? `\u274C \u4F59 ${remainder} \u4E2A\uFF0C\u88C5\u4E0D\u6EE1\uFF01` : `\u274C ${remainder} left over!`)}
        </div>
      )}
    </div>
  )
}

// ─── GCF visual: show both groups ───────────────────────────
function GcfVisual({ groups, boxSize, lang }) {
  if (!boxSize) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {groups.map((total, idx) => {
        const full = Math.floor(total / boxSize)
        const rem = total % boxSize
        return (
          <div key={idx} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>
              {total} ÷ {boxSize} = {full}{rem > 0 ? ` ... ${rem}` : ''}
              <span style={{ marginLeft: 8, color: rem === 0 ? '#059669' : '#DC2626' }}>
                {rem === 0 ? '\u2705' : '\u274C'}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
              {Array.from({ length: full }, (_, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 1, padding: '3px 5px',
                  background: '#D1FAE5', borderRadius: 6,
                  border: '1px solid #4ECDC4', fontSize: 12,
                }}>
                  {Array.from({ length: Math.min(boxSize, 6) }, (_, j) => (
                    <span key={j}>&#x1F34E;</span>
                  ))}
                  {boxSize > 6 && <span style={{ fontSize: 10, color: '#64748B' }}>+{boxSize - 6}</span>}
                </div>
              ))}
              {rem > 0 && (
                <div style={{
                  display: 'flex', gap: 1, padding: '3px 5px',
                  background: '#FEE2E2', borderRadius: 6,
                  border: '1px dashed #EF4444', fontSize: 12,
                }}>
                  {Array.from({ length: rem }, (_, j) => (
                    <span key={j}>&#x1F34E;</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function FactorFactory({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [taskIndex, setTaskIndex] = useState(0)
  const [solved, setSolved] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)

  const [selectedNums, setSelectedNums] = useState([])
  const [wrongNums, setWrongNums] = useState([])
  const [previewNum, setPreviewNum] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const task = TASKS[taskIndex]

  // Toggle number selection
  const handleNumClick = useCallback((n) => {
    if (solved) return
    setFeedback(null)
    setWrongNums([])

    if (task.type === 'select_factors') {
      // Toggle
      if (selectedNums.includes(n)) {
        setSelectedNums(prev => prev.filter(x => x !== n))
        setPreviewNum(null)
      } else {
        setSelectedNums(prev => [...prev, n])
        setPreviewNum(n)
      }
    } else if (task.type === 'gcf') {
      // Single select
      if (selectedNums.includes(n)) {
        setSelectedNums([])
        setPreviewNum(null)
      } else {
        setSelectedNums([n])
        setPreviewNum(n)
      }
    }
  }, [task, selectedNums, solved])

  // Yes/No answer
  const handleYesNo = useCallback((answer) => {
    if (solved) return
    if (answer === task.answer) {
      setSolved(true)
      setShowExplanation(true)
    } else {
      setMistakes(m => m + 1)
      setShowHint(true)
      setFeedback(lang === 'zh' ? '\u518D\u60F3\u60F3\uFF01\u770B\u770B\u5206\u7EC4\u540E\u6709\u6CA1\u6709\u5269\u4F59\u3002' : 'Think again! Look at whether there are leftovers.')
    }
  }, [task, solved, lang])

  // Submit answer
  const handleSubmit = useCallback(() => {
    if (solved || selectedNums.length === 0) return

    if (task.type === 'select_factors') {
      const correct = task.answers.every(a => selectedNums.includes(a))
        && selectedNums.every(s => task.answers.includes(s))

      if (correct) {
        setSolved(true)
        setShowExplanation(true)
      } else {
        const wrong = selectedNums.filter(s => !task.answers.includes(s))
        const missing = task.answers.filter(a => !selectedNums.includes(a))
        setWrongNums(wrong)
        setMistakes(m => m + 1)
        setShowHint(true)
        if (wrong.length > 0 && missing.length > 0) {
          setFeedback(lang === 'zh'
            ? `${wrong.join(', ')} \u4E0D\u662F\u56E0\u6570\uFF0C\u8FD8\u5C11\u4E86 ${missing.length} \u4E2A\u3002`
            : `${wrong.join(', ')} ${wrong.length > 1 ? 'are' : 'is'} not a factor. Still missing ${missing.length}.`)
        } else if (wrong.length > 0) {
          setFeedback(lang === 'zh'
            ? `${wrong.join(', ')} \u4E0D\u662F\u56E0\u6570\u54E6\uFF01`
            : `${wrong.join(', ')} ${wrong.length > 1 ? 'are' : 'is'} not a factor!`)
        } else {
          setFeedback(lang === 'zh'
            ? `\u8FD8\u5C11\u4E86 ${missing.length} \u4E2A\u56E0\u6570\uFF01`
            : `Still missing ${missing.length} factor${missing.length > 1 ? 's' : ''}!`)
        }
      }
    } else if (task.type === 'gcf') {
      const n = selectedNums[0]
      const dividesBoth = task.groups.every(g => g % n === 0)

      if (n === task.answer) {
        setSolved(true)
        setShowExplanation(true)
      } else if (!dividesBoth) {
        setWrongNums([n])
        setMistakes(m => m + 1)
        setShowHint(true)
        setFeedback(lang === 'zh'
          ? `${n} \u4E0D\u80FD\u540C\u65F6\u6574\u9664\u4E24\u4E2A\u6570\uFF01`
          : `${n} doesn't divide both numbers!`)
      } else {
        // Divides both but not the biggest
        setMistakes(m => m + 1)
        setFeedback(lang === 'zh'
          ? `${n} \u80FD\u6574\u9664\u4E24\u4E2A\u6570\uFF0C\u4F46\u4E0D\u662F\u6700\u5927\u7684\uFF01\u518D\u627E\u627E\u66F4\u5927\u7684\u3002`
          : `${n} divides both, but it's not the biggest! Look for a larger one.`)
      }
    }
  }, [task, selectedNums, solved, lang])

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
      setSelectedNums([])
      setWrongNums([])
      setPreviewNum(null)
      setFeedback(null)
    }
  }, [taskIndex, mistakes, onComplete])

  // Hints
  const hints = task.type === 'select_factors'
    ? [
        lang === 'zh' ? `\u56E0\u6570\u5C31\u662F\u80FD\u6574\u9664 ${task.totalApples} \u7684\u6570\uFF0C\u6BD4\u5982 ${task.totalApples} \u00F7 ? = \u6574\u6570` : `A factor divides ${task.totalApples} evenly: ${task.totalApples} \u00F7 ? = whole number`,
        lang === 'zh' ? '\u8BD5\u8BD5\u6BCF\u4E2A\u6570\uFF0C\u770B\u770B\u9664\u540E\u6709\u6CA1\u6709\u4F59\u6570\uFF01' : 'Try each number — does it divide with no remainder?',
      ]
    : task.type === 'yes_no'
      ? [
          lang === 'zh' ? `\u7528 ${task.totalApples} \u00F7 ${task.boxSize} \u770B\u770B\u6709\u6CA1\u6709\u4F59\u6570\uFF01` : `Try ${task.totalApples} \u00F7 ${task.boxSize} — any remainder?`,
          lang === 'zh' ? '\u6709\u4F59\u6570 = \u4E0D\u662F\u56E0\u6570\uFF0C\u6CA1\u4F59\u6570 = \u662F\u56E0\u6570\uFF01' : 'Remainder = NOT a factor. No remainder = IS a factor!',
        ]
      : [
          lang === 'zh' ? '\u5148\u627E\u51FA\u80FD\u540C\u65F6\u6574\u9664\u4E24\u4E2A\u6570\u7684\uFF0C\u518D\u9009\u6700\u5927\u7684\uFF01' : 'Find numbers that divide BOTH, then pick the BIGGEST!',
          lang === 'zh' ? `\u8BD5\u8BD5\u6BCF\u4E2A\u6570\uFF1A${task.groups[0]} \u00F7 ? \u548C ${task.groups[1]} \u00F7 ? \u90FD\u6CA1\u4F59\u6570\u5417\uFF1F` : `Test each: do ${task.groups[0]} \u00F7 ? and ${task.groups[1]} \u00F7 ? both have no remainder?`,
        ]

  // Preview number for visual
  const displayNum = previewNum || (selectedNums.length > 0 ? selectedNums[selectedNums.length - 1] : null)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 14,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>&#x1F3ED;</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '\u56E0\u6570\u5DE5\u5382' : 'Factor Factory'}
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
        {task.type === 'select_factors' && (
          <div style={{ marginTop: 6, fontSize: 14, color: '#64748B' }}>
            {lang === 'zh'
              ? `\u9009\u62E9\u540E\u70B9\u63D0\u4EA4\uFF0C\u5171 ${task.answers.length} \u4E2A\u56E0\u6570`
              : `Select then submit \u2014 ${task.answers.length} factors total`}
          </div>
        )}
      </div>

      {/* Visual preview */}
      <div className="card" style={{ maxWidth: 460, width: '100%', padding: '14px 12px' }}>
        {task.type === 'yes_no' && (
          <AppleGrid total={task.totalApples} boxSize={task.boxSize} lang={lang} />
        )}
        {task.type === 'select_factors' && displayNum && (
          <AppleGrid total={task.totalApples} boxSize={displayNum} lang={lang} />
        )}
        {task.type === 'select_factors' && !displayNum && (
          <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: 14, padding: 12 }}>
            {lang === 'zh' ? '\u261D\uFE0F \u70B9\u51FB\u4E0B\u65B9\u6570\u5B57\u67E5\u770B\u5206\u7EC4\u6548\u679C' : '\u261D\uFE0F Tap a number below to preview the grouping'}
          </div>
        )}
        {task.type === 'gcf' && displayNum && (
          <GcfVisual groups={task.groups} boxSize={displayNum} lang={lang} />
        )}
        {task.type === 'gcf' && !displayNum && (
          <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: 14, padding: 12 }}>
            {lang === 'zh' ? '\u261D\uFE0F \u70B9\u51FB\u4E0B\u65B9\u6570\u5B57\u67E5\u770B\u80FD\u5426\u6574\u9664\u4E24\u4E2A\u6570' : '\u261D\uFE0F Tap a number below to check if it divides both'}
          </div>
        )}
      </div>

      {/* Number buttons */}
      {(task.type === 'select_factors' || task.type === 'gcf') && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
          maxWidth: 400,
        }}>
          {task.range.map(n => {
            const isSelected = selectedNums.includes(n)
            const isWrong = wrongNums.includes(n)

            let bg = '#F1F5F9'
            let color = '#1E293B'
            let border = '2px solid #E2E8F0'

            if (isSelected && !isWrong) {
              bg = task.type === 'gcf' ? '#FFE66D' : '#A78BFA'
              color = task.type === 'gcf' ? '#1E293B' : 'white'
              border = task.type === 'gcf' ? '2px solid #FFB800' : '2px solid #8B5CF6'
            }
            if (isWrong) {
              bg = '#FEE2E2'
              color = '#EF4444'
              border = '2px solid #EF4444'
            }
            if (solved && task.type === 'select_factors' && task.answers.includes(n)) {
              bg = '#D1FAE5'
              color = '#059669'
              border = '2px solid #4ECDC4'
            }

            return (
              <button
                key={n}
                onClick={() => handleNumClick(n)}
                style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: bg, color, border,
                  fontSize: 20, fontWeight: 700,
                  cursor: solved ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                  opacity: solved && !task.answers?.includes(n) && !isSelected ? 0.3 : 1,
                }}
              >
                {n}
              </button>
            )
          })}
        </div>
      )}

      {/* Yes / No buttons */}
      {task.type === 'yes_no' && !solved && (
        <div style={{ display: 'flex', gap: 16 }}>
          <button
            className="btn"
            onClick={() => handleYesNo(true)}
            style={{
              padding: '14px 32px', fontSize: 16, fontWeight: 700,
              background: '#D1FAE5', color: '#059669',
              border: '2px solid #4ECDC4', borderRadius: 14,
              cursor: 'pointer',
            }}
          >
            {lang === 'zh' ? '\u2705 \u662F\u56E0\u6570' : '\u2705 Yes, factor!'}
          </button>
          <button
            className="btn"
            onClick={() => handleYesNo(false)}
            style={{
              padding: '14px 32px', fontSize: 16, fontWeight: 700,
              background: '#FEE2E2', color: '#DC2626',
              border: '2px solid #EF4444', borderRadius: 14,
              cursor: 'pointer',
            }}
          >
            {lang === 'zh' ? '\u274C \u4E0D\u662F' : '\u274C No!'}
          </button>
        </div>
      )}

      {/* Feedback message */}
      {feedback && !solved && (
        <div style={{
          fontSize: 14, color: '#EF4444', fontWeight: 600, textAlign: 'center',
          maxWidth: 380, animation: 'bounce-in 0.3s',
        }}>
          {feedback}
        </div>
      )}

      {/* Submit button */}
      {(task.type === 'select_factors' || task.type === 'gcf') && !solved && (
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={selectedNums.length === 0}
          style={{
            fontSize: 16, padding: '12px 40px',
            opacity: selectedNums.length === 0 ? 0.4 : 1,
            cursor: selectedNums.length === 0 ? 'default' : 'pointer',
          }}
        >
          {lang === 'zh' ? '\u2705 \u63D0\u4EA4\u7B54\u6848' : '\u2705 Submit'}
        </button>
      )}

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
              : (lang === 'zh' ? '\u5DE5\u5382\u5B8C\u5DE5\uFF01' : 'Factory complete!')}
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
              : task.type === 'yes_no'
                ? (lang === 'zh' ? '\u770B\u770B\u4E0A\u9762\u7684\u5206\u7EC4\uFF0C\u6709\u6CA1\u6709\u5269\u4F59\u7684\u82F9\u679C\uFF1F' : 'Look at the grouping above — are there leftover apples?')
                : task.type === 'gcf'
                  ? (lang === 'zh' ? '\u70B9\u51FB\u6570\u5B57\u67E5\u770B\u80FD\u5426\u6574\u9664\u4E24\u4E2A\u6570\uFF0C\u627E\u6700\u5927\u7684\uFF01' : 'Tap numbers to check — find the BIGGEST that divides both!')
                  : (lang === 'zh' ? '\u70B9\u51FB\u6570\u5B57\u67E5\u770B\u80FD\u5426\u6574\u9664\uFF0C\u9009\u597D\u540E\u70B9\u63D0\u4EA4\uFF01' : 'Tap numbers to preview, select all factors, then submit!')
          }
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
