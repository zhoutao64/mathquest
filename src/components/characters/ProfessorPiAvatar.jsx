// Professor Pi — Purple wizard hat, round glasses, white beard, kind eyes
export default function ProfessorPiAvatar({ size = 80, emotion = 'happy' }) {
  const s = size / 100 // scale factor

  // Mouth paths by emotion
  const mouths = {
    happy: `M ${35*s} ${68*s} Q ${50*s} ${78*s} ${65*s} ${68*s}`, // smile
    serious: `M ${38*s} ${70*s} L ${62*s} ${70*s}`, // straight line
    surprised: `M ${50*s} ${72*s} m ${-5*s} 0 a ${5*s} ${5*s} 0 1 0 ${10*s} 0 a ${5*s} ${5*s} 0 1 0 ${-10*s} 0`, // O shape
    encouraging: `M ${35*s} ${66*s} Q ${50*s} ${80*s} ${65*s} ${66*s}`, // big smile
    proud: `M ${35*s} ${66*s} Q ${50*s} ${80*s} ${65*s} ${66*s}`,
    satisfied: `M ${35*s} ${67*s} Q ${50*s} ${78*s} ${65*s} ${67*s}`,
  }

  // Eyebrow positions
  const browY = emotion === 'surprised' ? 38*s : emotion === 'serious' ? 42*s : 40*s

  return (
    <svg width={size} height={size} viewBox={`0 0 ${100*s} ${100*s}`}>
      {/* Hat */}
      <path d={`M ${20*s} ${35*s} L ${50*s} ${5*s} L ${80*s} ${35*s} Z`} fill="#A78BFA" />
      <path d={`M ${15*s} ${35*s} L ${85*s} ${35*s} L ${82*s} ${42*s} L ${18*s} ${42*s} Z`} fill="#8B5CF6" />
      {/* Hat star */}
      <circle cx={58*s} cy={15*s} r={4*s} fill="#FFE66D" />
      <circle cx={58*s} cy={15*s} r={2*s} fill="#FFF" opacity={0.6} />
      {/* Hat band */}
      <rect x={18*s} y={35*s} width={64*s} height={7*s} rx={2*s} fill="#7C3AED" />

      {/* Face */}
      <ellipse cx={50*s} cy={60*s} rx={30*s} ry={28*s} fill="#FFD4A8" />
      {/* Cheeks */}
      <ellipse cx={30*s} cy={64*s} rx={7*s} ry={5*s} fill="#FFBFA0" opacity={0.5} />
      <ellipse cx={70*s} cy={64*s} rx={7*s} ry={5*s} fill="#FFBFA0" opacity={0.5} />

      {/* Glasses */}
      <circle cx={38*s} cy={52*s} r={10*s} fill="none" stroke="#6B7280" strokeWidth={2*s} />
      <circle cx={62*s} cy={52*s} r={10*s} fill="none" stroke="#6B7280" strokeWidth={2*s} />
      <line x1={48*s} y1={52*s} x2={52*s} y2={52*s} stroke="#6B7280" strokeWidth={2*s} />

      {/* Eyes */}
      <circle cx={38*s} cy={52*s} r={4*s} fill="white" />
      <circle cx={62*s} cy={52*s} r={4*s} fill="white" />
      <circle cx={39*s} cy={52*s} r={2.5*s} fill="#1E293B" />
      <circle cx={63*s} cy={52*s} r={2.5*s} fill="#1E293B" />
      {/* Eye shine */}
      <circle cx={40*s} cy={50.5*s} r={1*s} fill="white" />
      <circle cx={64*s} cy={50.5*s} r={1*s} fill="white" />

      {/* Eyebrows */}
      <line x1={30*s} y1={browY} x2={45*s} y2={browY - 2*s} stroke="#8B5E3C" strokeWidth={2*s} strokeLinecap="round" />
      <line x1={55*s} y1={browY - 2*s} x2={70*s} y2={browY} stroke="#8B5E3C" strokeWidth={2*s} strokeLinecap="round" />

      {/* Beard */}
      <path d={`M ${25*s} ${72*s} Q ${30*s} ${92*s} ${50*s} ${95*s} Q ${70*s} ${92*s} ${75*s} ${72*s}`}
        fill="white" stroke="#E5E7EB" strokeWidth={1*s} />
      <path d={`M ${32*s} ${78*s} Q ${35*s} ${85*s} ${40*s} ${82*s}`} fill="none" stroke="#E5E7EB" strokeWidth={1*s} />
      <path d={`M ${60*s} ${82*s} Q ${65*s} ${85*s} ${68*s} ${78*s}`} fill="none" stroke="#E5E7EB" strokeWidth={1*s} />

      {/* Mouth */}
      <path d={mouths[emotion] || mouths.happy} fill="none" stroke="#D97706" strokeWidth={2*s} strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx={50*s} cy={60*s} rx={3*s} ry={2*s} fill="#F0B68A" />
    </svg>
  )
}
