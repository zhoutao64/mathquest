import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ProfessorPi from '../../components/ProfessorPi'

// ─── Task Data: Matching Pairs ───────────────────────────────
const ROUNDS = [
  {
    // Round 1: Find equivalent fractions
    instruction: { en: 'Find two fractions that are equal!', zh: '找出两个相等的分数！' },
    cards: [
      { id: 'a1', num: 1, den: 2, label: '1/2' },
      { id: 'a2', num: 2, den: 4, label: '2/4' },
      { id: 'b1', num: 1, den: 3, label: '1/3' },
      { id: 'b2', num: 3, den: 4, label: '3/4' },
    ],
    matches: [['a1', 'a2']],
    explanation: { en: '1/2 = 2/4 because both are exactly half!', zh: '1/2 = 2/4，因为它们都恰好是一半！' },
  },
  {
    instruction: { en: 'Find the pair that adds up to 1!', zh: '找出加起来等于 1 的一对！' },
    cards: [
      { id: 'a1', num: 1, den: 4, label: '1/4' },
      { id: 'a2', num: 3, den: 4, label: '3/4' },
      { id: 'b1', num: 1, den: 3, label: '1/3' },
      { id: 'b2', num: 1, den: 2, label: '1/2' },
    ],
    matches: [['a1', 'a2']],
    explanation: { en: '1/4 + 3/4 = 4/4 = 1 whole!', zh: '1/4 + 3/4 = 4/4 = 1 整块！' },
  },
  {
    instruction: { en: 'Find ALL equivalent pairs!', zh: '找出所有等价的配对！' },
    cards: [
      { id: 'a1', num: 1, den: 2, label: '1/2' },
      { id: 'a2', num: 3, den: 6, label: '3/6' },
      { id: 'b1', num: 2, den: 3, label: '2/3' },
      { id: 'b2', num: 4, den: 6, label: '4/6' },
    ],
    matches: [['a1', 'a2'], ['b1', 'b2']],
    explanation: { en: '1/2 = 3/6 and 2/3 = 4/6. Multiply top and bottom by the same number!', zh: '1/2 = 3/6 且 2/3 = 4/6。分子分母同时乘以相同的数！' },
  },
  {
    instruction: { en: 'Which pairs add to 1?', zh: '哪些配对加起来等于 1？' },
    cards: [
      { id: 'a1', num: 2, den: 5, label: '2/5' },
      { id: 'a2', num: 3, den: 5, label: '3/5' },
      { id: 'b1', num: 1, den: 3, label: '1/3' },
      { id: 'b2', num: 2, den: 3, label: '2/3' },
    ],
    matches: [['a1', 'a2'], ['b1', 'b2']],
    explanation: { en: '2/5 + 3/5 = 5/5 = 1 and 1/3 + 2/3 = 3/3 = 1!', zh: '2/5 + 3/5 = 5/5 = 1 且 1/3 + 2/3 = 3/3 = 1！' },
  },
  {
    instruction: { en: 'Match all equivalent fractions!', zh: '配对所有等价分数！' },
    cards: [
      { id: 'a1', num: 1, den: 4, label: '1/4' },
      { id: 'a2', num: 2, den: 8, label: '2/8' },
      { id: 'b1', num: 3, den: 4, label: '3/4' },
      { id: 'b2', num: 6, den: 8, label: '6/8' },
    ],
    matches: [['a1', 'a2'], ['b1', 'b2']],
    explanation: { en: '1/4 = 2/8 and 3/4 = 6/8. The visual pieces are the same size!', zh: '1/4 = 2/8 且 3/4 = 6/8。图形面积一模一样！' },
  },
]

// ─── Fraction Visual (pie slice) ─────────────────────────────
function FractionPie({ num, den, size = 60 }) {
  const r = size / 2 - 2
  const cx = size / 2, cy = size / 2

  const slices = Array.from({ length: den }, (_, i) => {
    const start = (i / den) * 360 - 90
    const end = ((i + 1) / den) * 360 - 90
    const startRad = (start * Math.PI) / 180
    const endRad = (end * Math.PI) / 180
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)
    const large = end - start > 180 ? 1 : 0
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
    const filled = i < num

    return <path key={i} d={path} fill={filled ? '#4ECDC4' : '#E2E8F0'} stroke="#fff" strokeWidth={1} />
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices}
    </svg>
  )
}

// ─── Card Component ──────────────────────────────────────────
function FractionCard({ card, isSelected, isMatched, isWrong, onClick }) {
  const borderColor = isMatched ? '#4ECDC4' : isSelected ? '#FFE66D' : isWrong ? '#FF6B6B' : 'rgba(0,0,0,0.08)'
  const bg = isMatched ? '#E0FFF8' : isWrong ? '#FFF0F0' : '#fff'
  const scale = isSelected ? 1.05 : isMatched ? 0.95 : 1

  return (
    <div
      onClick={() => !isMatched && onClick(card.id)}
      style={{
        background: bg,
        border: `3px solid ${borderColor}`,
        borderRadius: 16, padding: 12,
        cursor: isMatched ? 'default' : 'pointer',
        transition: 'all 0.2s',
        transform: `scale(${scale})`,
        opacity: isMatched ? 0.6 : 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        minWidth: 80,
        boxShadow: isSelected ? '0 4px 16px rgba(255,230,109,0.4)' : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <FractionPie num={card.num} den={card.den} size={56} />
      <div style={{ fontSize: 18, fontWeight: 800, color: '#1E293B' }}>
        {card.label}
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function FractionFrenzy({ levelData, onComplete }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const [roundIndex, setRoundIndex] = useState(0)
  const [selectedCards, setSelectedCards] = useState([])
  const [matchedCards, setMatchedCards] = useState([])
  const [wrongCards, setWrongCards] = useState([])
  const [mistakes, setMistakes] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [roundsCompleted, setRoundsCompleted] = useState(0)

  const round = ROUNDS[roundIndex]
  const totalMatches = round.matches.length

  // Check if all matches found in this round
  const allMatchesFound = matchedCards.length === totalMatches * 2

  // Handle card click
  const handleCardClick = useCallback((cardId) => {
    if (matchedCards.includes(cardId) || wrongCards.includes(cardId)) return

    setSelectedCards(prev => {
      if (prev.includes(cardId)) return prev.filter(id => id !== cardId)
      const newSelected = [...prev, cardId]

      if (newSelected.length === 2) {
        // Check if this pair is a valid match
        const isMatch = round.matches.some(
          ([a, b]) => (newSelected.includes(a) && newSelected.includes(b))
        )

        if (isMatch) {
          setTimeout(() => {
            setMatchedCards(mc => [...mc, ...newSelected])
            setSelectedCards([])
          }, 400)
        } else {
          setMistakes(m => m + 1)
          setWrongCards(newSelected)
          setShowHint(true)
          setTimeout(() => {
            setWrongCards([])
            setSelectedCards([])
          }, 800)
        }
        return newSelected
      }
      return newSelected
    })
  }, [round, matchedCards, wrongCards])

  // When all matches found, show explanation
  useEffect(() => {
    if (allMatchesFound && !showExplanation) {
      setTimeout(() => setShowExplanation(true), 600)
    }
  }, [allMatchesFound, showExplanation])

  // Next round
  const handleNext = useCallback(() => {
    const next = roundIndex + 1
    setRoundsCompleted(rc => rc + 1)
    if (next >= ROUNDS.length) {
      const stars = mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1
      onComplete({ stars, mistakes })
    } else {
      setRoundIndex(next)
      setSelectedCards([])
      setMatchedCards([])
      setWrongCards([])
      setShowExplanation(false)
      setShowHint(false)
    }
  }, [roundIndex, mistakes, onComplete])

  const hints = [
    lang === 'zh'
      ? '看看每个分数的饼图——面积一样大的分数就是等价的！'
      : 'Look at the pie charts — fractions with the same colored area are equivalent!',
    lang === 'zh'
      ? '试试把分子和分母都除以同一个数，看看能不能化简成一样'
      : 'Try dividing both numerator and denominator by the same number',
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 16px 30px', minHeight: '100vh', gap: 16,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>🧊</div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          {lang === 'zh' ? '分数狂潮' : 'Fraction Frenzy'}
        </h2>
        <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          {roundIndex + 1} / {ROUNDS.length}
        </div>
      </div>

      {/* Instruction */}
      <div className="card" style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
        <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', fontWeight: 600, color: '#1E293B' }}>
          {round.instruction[lang]}
        </div>
      </div>

      {/* Cards grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12, maxWidth: 320, width: '100%',
      }}>
        {round.cards.map(card => (
          <FractionCard
            key={card.id}
            card={card}
            isSelected={selectedCards.includes(card.id)}
            isMatched={matchedCards.includes(card.id)}
            isWrong={wrongCards.includes(card.id)}
            onClick={handleCardClick}
          />
        ))}
      </div>

      {/* Explanation after all matches */}
      {showExplanation && (
        <div className="card" style={{
          maxWidth: 400, width: '100%', textAlign: 'center',
          background: '#E0FFF8', border: '2px solid #4ECDC4',
          animation: 'bounce-in 0.4s',
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>💡</div>
          <p style={{ fontSize: 15, color: '#1E293B', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
            {round.explanation[lang]}
          </p>
          <button className="btn btn-primary" onClick={handleNext} style={{ marginTop: 16 }}>
            {roundIndex < ROUNDS.length - 1
              ? (lang === 'zh' ? '下一轮 →' : 'Next Round →')
              : (lang === 'zh' ? '完成！' : 'Finish!')
            }
          </button>
        </div>
      )}

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {ROUNDS.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < roundsCompleted ? '#4ECDC4' : i === roundIndex ? '#FFE66D' : '#E2E8F0',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Professor Pi */}
      <div style={{ maxWidth: 420, width: '100%', marginTop: 8 }}>
        <ProfessorPi
          message={
            showExplanation
              ? round.explanation[lang]
              : (lang === 'zh' ? '观察饼图的颜色面积，找到相等的分数配对！' : 'Look at the colored areas in the pies — find equal fractions!')
          }
          hints={hints}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
