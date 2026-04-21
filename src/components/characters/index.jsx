export { default as ProfessorPiAvatar } from './ProfessorPiAvatar'
export { default as DigitAvatar } from './DigitAvatar'
export { default as BugAvatar } from './BugAvatar'
export { default as GolemAvatar } from './GolemAvatar'

// Character config matching DialogueBox speaker keys
const CHARACTERS = {
  professor: { Component: null, defaultEmotion: 'happy' },
  digit: { Component: null, defaultEmotion: 'happy' },
  bug: { Component: null, defaultEmotion: 'smug' },
  golem: { Component: null, defaultEmotion: 'serious' },
  narrator: null,
  baker: null,
}

// Lazy-load references (avoids circular dep issues)
import ProfessorPiAvatar from './ProfessorPiAvatar'
import DigitAvatar from './DigitAvatar'
import BugAvatar from './BugAvatar'
import GolemAvatar from './GolemAvatar'

CHARACTERS.professor.Component = ProfessorPiAvatar
CHARACTERS.digit.Component = DigitAvatar
CHARACTERS.bug.Component = BugAvatar
CHARACTERS.golem.Component = GolemAvatar

/**
 * Get the right avatar component for a dialogue speaker
 * @param {string} speaker - 'professor' | 'digit' | 'bug' | 'golem' | 'narrator' | 'baker'
 * @param {number} size - SVG size in px
 * @param {string} emotion - expression key
 * @returns {JSX.Element|null}
 */
export function getAvatar(speaker, size = 64, emotion) {
  const config = CHARACTERS[speaker]
  if (!config || !config.Component) return null

  const AvatarComponent = config.Component
  return <AvatarComponent size={size} emotion={emotion || config.defaultEmotion} />
}

// Narrator icon — a simple open book SVG
export function NarratorIcon({ size = 64 }) {
  const s = size / 100
  return (
    <svg width={size} height={size} viewBox={`0 0 ${100*s} ${100*s}`}>
      {/* Book covers */}
      <path d={`M ${10*s} ${25*s} L ${10*s} ${80*s} Q ${30*s} ${72*s} ${50*s} ${80*s}`}
        fill="#A78BFA" stroke="#7C3AED" strokeWidth={2*s} />
      <path d={`M ${90*s} ${25*s} L ${90*s} ${80*s} Q ${70*s} ${72*s} ${50*s} ${80*s}`}
        fill="#C4B5FD" stroke="#7C3AED" strokeWidth={2*s} />
      {/* Spine */}
      <line x1={50*s} y1={20*s} x2={50*s} y2={80*s} stroke="#7C3AED" strokeWidth={2*s} />
      {/* Pages */}
      <path d={`M ${50*s} ${28*s} Q ${35*s} ${24*s} ${18*s} ${30*s}`} fill="none" stroke="#DDD6FE" strokeWidth={1*s} />
      <path d={`M ${50*s} ${38*s} Q ${35*s} ${34*s} ${18*s} ${40*s}`} fill="none" stroke="#DDD6FE" strokeWidth={1*s} />
      <path d={`M ${50*s} ${48*s} Q ${35*s} ${44*s} ${18*s} ${50*s}`} fill="none" stroke="#DDD6FE" strokeWidth={1*s} />
      <path d={`M ${50*s} ${28*s} Q ${65*s} ${24*s} ${82*s} ${30*s}`} fill="none" stroke="#DDD6FE" strokeWidth={1*s} />
      <path d={`M ${50*s} ${38*s} Q ${65*s} ${34*s} ${82*s} ${40*s}`} fill="none" stroke="#DDD6FE" strokeWidth={1*s} />
      <path d={`M ${50*s} ${48*s} Q ${65*s} ${44*s} ${82*s} ${50*s}`} fill="none" stroke="#DDD6FE" strokeWidth={1*s} />
      {/* Sparkle */}
      <circle cx={50*s} cy={15*s} r={3*s} fill="#FFE66D" />
      <line x1={50*s} y1={8*s} x2={50*s} y2={22*s} stroke="#FFE66D" strokeWidth={1.5*s} />
      <line x1={43*s} y1={15*s} x2={57*s} y2={15*s} stroke="#FFE66D" strokeWidth={1.5*s} />
    </svg>
  )
}

// Baker icon — chef hat + apron
export function BakerIcon({ size = 64 }) {
  const s = size / 100
  return (
    <svg width={size} height={size} viewBox={`0 0 ${100*s} ${100*s}`}>
      {/* Chef hat poofs */}
      <circle cx={35*s} cy={22*s} r={14*s} fill="white" stroke="#E5E7EB" strokeWidth={1.5*s} />
      <circle cx={50*s} cy={18*s} r={14*s} fill="white" stroke="#E5E7EB" strokeWidth={1.5*s} />
      <circle cx={65*s} cy={22*s} r={14*s} fill="white" stroke="#E5E7EB" strokeWidth={1.5*s} />
      {/* Hat band */}
      <rect x={28*s} y={30*s} width={44*s} height={10*s} rx={3*s} fill="white" stroke="#E5E7EB" strokeWidth={1.5*s} />
      {/* Face */}
      <ellipse cx={50*s} cy={52*s} rx={18*s} ry={16*s} fill="#FFD4A8" />
      {/* Eyes */}
      <circle cx={43*s} cy={50*s} r={2.5*s} fill="#1E293B" />
      <circle cx={57*s} cy={50*s} r={2.5*s} fill="#1E293B" />
      {/* Smile */}
      <path d={`M ${42*s} ${58*s} Q ${50*s} ${64*s} ${58*s} ${58*s}`} fill="none" stroke="#D97706" strokeWidth={2*s} strokeLinecap="round" />
      {/* Apron */}
      <path d={`M ${32*s} ${68*s} L ${32*s} ${90*s} L ${68*s} ${90*s} L ${68*s} ${68*s}`}
        fill="#FEF3C7" stroke="#FBBF24" strokeWidth={1.5*s} />
      <line x1={50*s} y1={68*s} x2={50*s} y2={82*s} stroke="#FBBF24" strokeWidth={1*s} />
    </svg>
  )
}
