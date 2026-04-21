// Digit (迪吉) — Blue-green sprite, big round eyes, star antennae, small mouth
export default function DigitAvatar({ size = 80, emotion = 'happy' }) {
  const s = size / 100

  // Eye styles by emotion
  const eyes = {
    happy: { leftPath: null, rightPath: null, type: 'crescent' },
    confused: { leftPath: null, rightPath: null, type: 'spiral' },
    amazed: { leftPath: null, rightPath: null, type: 'star' },
    smug: { leftPath: null, rightPath: null, type: 'half' },
    sassy: { leftPath: null, rightPath: null, type: 'half' },
    excited: { leftPath: null, rightPath: null, type: 'big' },
    serious: { leftPath: null, rightPath: null, type: 'normal' },
    determined: { leftPath: null, rightPath: null, type: 'normal' },
    thoughtful: { leftPath: null, rightPath: null, type: 'look-up' },
  }

  const eyeType = eyes[emotion]?.type || 'normal'

  // Mouths by emotion
  const mouths = {
    happy: `M ${40*s} ${62*s} Q ${50*s} ${70*s} ${60*s} ${62*s}`,
    confused: `M ${42*s} ${65*s} Q ${50*s} ${60*s} ${58*s} ${65*s}`,
    amazed: `M ${45*s} ${64*s} Q ${50*s} ${72*s} ${55*s} ${64*s}`,
    smug: `M ${42*s} ${64*s} Q ${55*s} ${68*s} ${60*s} ${62*s}`,
    sassy: `M ${40*s} ${63*s} Q ${55*s} ${70*s} ${60*s} ${61*s}`,
    excited: `M ${38*s} ${62*s} Q ${50*s} ${74*s} ${62*s} ${62*s}`,
    serious: `M ${42*s} ${65*s} L ${58*s} ${65*s}`,
    determined: `M ${40*s} ${64*s} Q ${50*s} ${68*s} ${60*s} ${64*s}`,
    thoughtful: `M ${44*s} ${65*s} Q ${50*s} ${62*s} ${56*s} ${65*s}`,
  }

  const renderEyes = () => {
    const lcx = 40 * s, rcx = 60 * s, cy = 48 * s

    switch (eyeType) {
      case 'crescent':
        // Happy closed eyes (upward curves)
        return (
          <>
            <path d={`M ${32*s} ${48*s} Q ${40*s} ${42*s} ${48*s} ${48*s}`} fill="none" stroke="#1E293B" strokeWidth={2.5*s} strokeLinecap="round" />
            <path d={`M ${52*s} ${48*s} Q ${60*s} ${42*s} ${68*s} ${48*s}`} fill="none" stroke="#1E293B" strokeWidth={2.5*s} strokeLinecap="round" />
          </>
        )
      case 'spiral':
        // Confused spiral eyes
        return (
          <>
            <circle cx={lcx} cy={cy} r={8*s} fill="white" stroke="#1E293B" strokeWidth={1.5*s} />
            <circle cx={rcx} cy={cy} r={8*s} fill="white" stroke="#1E293B" strokeWidth={1.5*s} />
            <path d={`M ${40*s} ${48*s} m ${-3*s} 0 a ${3*s} ${3*s} 0 1 1 ${4*s} ${-2*s}`} fill="none" stroke="#1E293B" strokeWidth={1.5*s} />
            <path d={`M ${60*s} ${48*s} m ${-3*s} 0 a ${3*s} ${3*s} 0 1 1 ${4*s} ${-2*s}`} fill="none" stroke="#1E293B" strokeWidth={1.5*s} />
          </>
        )
      case 'star':
        // Amazed star eyes
        return (
          <>
            <circle cx={lcx} cy={cy} r={9*s} fill="white" stroke="#1E293B" strokeWidth={1.5*s} />
            <circle cx={rcx} cy={cy} r={9*s} fill="white" stroke="#1E293B" strokeWidth={1.5*s} />
            <polygon points={`${40*s},${42*s} ${41.5*s},${46*s} ${46*s},${46*s} ${42.5*s},${49*s} ${43.5*s},${53*s} ${40*s},${50.5*s} ${36.5*s},${53*s} ${37.5*s},${49*s} ${34*s},${46*s} ${38.5*s},${46*s}`} fill="#FFE66D" />
            <polygon points={`${60*s},${42*s} ${61.5*s},${46*s} ${66*s},${46*s} ${62.5*s},${49*s} ${63.5*s},${53*s} ${60*s},${50.5*s} ${56.5*s},${53*s} ${57.5*s},${49*s} ${54*s},${46*s} ${58.5*s},${46*s}`} fill="#FFE66D" />
          </>
        )
      case 'half':
        // Smug/sassy half-closed eyes
        return (
          <>
            <circle cx={lcx} cy={cy} r={8*s} fill="white" stroke="#1E293B" strokeWidth={1.5*s} />
            <circle cx={rcx} cy={cy} r={8*s} fill="white" stroke="#1E293B" strokeWidth={1.5*s} />
            <rect x={32*s} y={40*s} width={16*s} height={6*s} fill="#4ECDC4" />
            <rect x={52*s} y={40*s} width={16*s} height={6*s} fill="#4ECDC4" />
            <circle cx={41*s} cy={50*s} r={3*s} fill="#1E293B" />
            <circle cx={61*s} cy={50*s} r={3*s} fill="#1E293B" />
          </>
        )
      case 'big':
        // Excited big sparkly eyes
        return (
          <>
            <circle cx={lcx} cy={cy} r={10*s} fill="white" stroke="#1E293B" strokeWidth={1.5*s} />
            <circle cx={rcx} cy={cy} r={10*s} fill="white" stroke="#1E293B" strokeWidth={1.5*s} />
            <circle cx={42*s} cy={48*s} r={5*s} fill="#1E293B" />
            <circle cx={62*s} cy={48*s} r={5*s} fill="#1E293B" />
            <circle cx={44*s} cy={46*s} r={2*s} fill="white" />
            <circle cx={64*s} cy={46*s} r={2*s} fill="white" />
          </>
        )
      case 'look-up':
        // Thoughtful looking up
        return (
          <>
            <circle cx={lcx} cy={cy} r={8*s} fill="white" stroke="#1E293B" strokeWidth={1.5*s} />
            <circle cx={rcx} cy={cy} r={8*s} fill="white" stroke="#1E293B" strokeWidth={1.5*s} />
            <circle cx={41*s} cy={45*s} r={3.5*s} fill="#1E293B" />
            <circle cx={61*s} cy={45*s} r={3.5*s} fill="#1E293B" />
            <circle cx={42.5*s} cy={43.5*s} r={1.2*s} fill="white" />
            <circle cx={62.5*s} cy={43.5*s} r={1.2*s} fill="white" />
          </>
        )
      default:
        // Normal round eyes
        return (
          <>
            <circle cx={lcx} cy={cy} r={8*s} fill="white" stroke="#1E293B" strokeWidth={1.5*s} />
            <circle cx={rcx} cy={cy} r={8*s} fill="white" stroke="#1E293B" strokeWidth={1.5*s} />
            <circle cx={41*s} cy={48*s} r={4*s} fill="#1E293B" />
            <circle cx={61*s} cy={48*s} r={4*s} fill="#1E293B" />
            <circle cx={42.5*s} cy={46.5*s} r={1.5*s} fill="white" />
            <circle cx={62.5*s} cy={46.5*s} r={1.5*s} fill="white" />
          </>
        )
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${100*s} ${100*s}`}>
      {/* Star antennae */}
      <line x1={38*s} y1={22*s} x2={30*s} y2={8*s} stroke="#4ECDC4" strokeWidth={2*s} strokeLinecap="round" />
      <line x1={62*s} y1={22*s} x2={70*s} y2={8*s} stroke="#4ECDC4" strokeWidth={2*s} strokeLinecap="round" />
      {/* Antenna stars */}
      <polygon points={`${30*s},${3*s} ${31.5*s},${6*s} ${35*s},${7*s} ${32*s},${9.5*s} ${33*s},${13*s} ${30*s},${11*s} ${27*s},${13*s} ${28*s},${9.5*s} ${25*s},${7*s} ${28.5*s},${6*s}`} fill="#FFE66D" />
      <polygon points={`${70*s},${3*s} ${71.5*s},${6*s} ${75*s},${7*s} ${72*s},${9.5*s} ${73*s},${13*s} ${70*s},${11*s} ${67*s},${13*s} ${68*s},${9.5*s} ${65*s},${7*s} ${68.5*s},${6*s}`} fill="#FFE66D" />

      {/* Body (rounded square) */}
      <rect x={22*s} y={24*s} width={56*s} height={55*s} rx={20*s} fill="#4ECDC4" />
      {/* Body highlight */}
      <rect x={28*s} y={28*s} width={44*s} height={40*s} rx={16*s} fill="#5ED9D1" opacity={0.5} />
      {/* Belly */}
      <ellipse cx={50*s} cy={68*s} rx={14*s} ry={8*s} fill="#A7F3D0" opacity={0.6} />

      {/* Face area (lighter) */}
      <ellipse cx={50*s} cy={50*s} rx={26*s} ry={22*s} fill="#5ED9D1" />

      {/* Eyes */}
      {renderEyes()}

      {/* Blush */}
      <ellipse cx={30*s} cy={56*s} rx={5*s} ry={3*s} fill="#FF9AAD" opacity={0.4} />
      <ellipse cx={70*s} cy={56*s} rx={5*s} ry={3*s} fill="#FF9AAD" opacity={0.4} />

      {/* Mouth */}
      <path d={mouths[emotion] || mouths.happy} fill="none" stroke="#1E293B" strokeWidth={2*s} strokeLinecap="round" />

      {/* Little feet */}
      <ellipse cx={38*s} cy={82*s} rx={8*s} ry={5*s} fill="#3DBDB5" />
      <ellipse cx={62*s} cy={82*s} rx={8*s} ry={5*s} fill="#3DBDB5" />

      {/* Little arms */}
      <ellipse cx={20*s} cy={55*s} rx={6*s} ry={8*s} fill="#3DBDB5" transform={`rotate(-15 ${20*s} ${55*s})`} />
      <ellipse cx={80*s} cy={55*s} rx={6*s} ry={8*s} fill="#3DBDB5" transform={`rotate(15 ${80*s} ${55*s})`} />
    </svg>
  )
}
