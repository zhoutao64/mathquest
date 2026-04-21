// Bug仔 — Green bug, asymmetric eyes (one big one small), curved antennae, short legs
export default function BugAvatar({ size = 80, emotion = 'smug' }) {
  const s = size / 100

  const mouths = {
    smug: `M ${38*s} ${62*s} Q ${55*s} ${70*s} ${62*s} ${60*s}`, // crooked grin
    panicked: `M ${42*s} ${62*s} Q ${50*s} ${74*s} ${58*s} ${62*s}`, // wide O
    flustered: `M ${40*s} ${66*s} Q ${50*s} ${60*s} ${60*s} ${66*s}`, // wobbly frown
    distant: `M ${44*s} ${65*s} L ${56*s} ${65*s}`, // flat
    happy: `M ${38*s} ${62*s} Q ${50*s} ${72*s} ${62*s} ${62*s}`,
    serious: `M ${42*s} ${65*s} L ${58*s} ${65*s}`,
  }

  const isPanicked = emotion === 'panicked'
  const isFlustered = emotion === 'flustered'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${100*s} ${100*s}`}>
      {/* Antennae */}
      <path d={`M ${40*s} ${22*s} Q ${30*s} ${5*s} ${22*s} ${12*s}`} fill="none" stroke="#F59E0B" strokeWidth={2.5*s} strokeLinecap="round" />
      <path d={`M ${60*s} ${22*s} Q ${70*s} ${5*s} ${78*s} ${12*s}`} fill="none" stroke="#F59E0B" strokeWidth={2.5*s} strokeLinecap="round" />
      {/* Antenna tips */}
      <circle cx={22*s} cy={12*s} r={4*s} fill="#FBBF24" />
      <circle cx={78*s} cy={12*s} r={4*s} fill="#FBBF24" />

      {/* Body (oval) */}
      <ellipse cx={50*s} cy={55*s} rx={30*s} ry={34*s} fill="#84CC16" />
      {/* Body stripes */}
      <ellipse cx={50*s} cy={45*s} rx={25*s} ry={5*s} fill="#65A30D" opacity={0.3} />
      <ellipse cx={50*s} cy={58*s} rx={22*s} ry={4*s} fill="#65A30D" opacity={0.3} />
      <ellipse cx={50*s} cy={70*s} rx={18*s} ry={3.5*s} fill="#65A30D" opacity={0.3} />

      {/* Belly */}
      <ellipse cx={50*s} cy={60*s} rx={18*s} ry={20*s} fill="#D9F99D" opacity={0.5} />

      {/* Asymmetric eyes — left bigger, right smaller */}
      {/* Left eye (big) */}
      <circle cx={38*s} cy={44*s} r={11*s} fill="white" stroke="#1E293B" strokeWidth={1.5*s} />
      <circle cx={40*s} cy={44*s} r={5*s} fill="#1E293B" />
      <circle cx={42*s} cy={42*s} r={2*s} fill="white" />

      {/* Right eye (small) */}
      <circle cx={62*s} cy={46*s} r={8*s} fill="white" stroke="#1E293B" strokeWidth={1.5*s} />
      <circle cx={63*s} cy={46*s} r={3.5*s} fill="#1E293B" />
      <circle cx={64.5*s} cy={44.5*s} r={1.3*s} fill="white" />

      {/* Eyebrows */}
      {emotion === 'smug' && (
        <>
          <line x1={30*s} y1={32*s} x2={46*s} y2={30*s} stroke="#4D7C0F" strokeWidth={2.5*s} strokeLinecap="round" />
          <line x1={54*s} y1={35*s} x2={70*s} y2={33*s} stroke="#4D7C0F" strokeWidth={2.5*s} strokeLinecap="round" />
        </>
      )}
      {isPanicked && (
        <>
          <line x1={28*s} y1={30*s} x2={44*s} y2={34*s} stroke="#4D7C0F" strokeWidth={2.5*s} strokeLinecap="round" />
          <line x1={56*s} y1={34*s} x2={72*s} y2={30*s} stroke="#4D7C0F" strokeWidth={2.5*s} strokeLinecap="round" />
        </>
      )}

      {/* Sweat drops when flustered/panicked */}
      {(isFlustered || isPanicked) && (
        <>
          <path d={`M ${74*s} ${36*s} Q ${76*s} ${30*s} ${78*s} ${36*s} Q ${76*s} ${40*s} ${74*s} ${36*s}`} fill="#93C5FD" />
          {isPanicked && (
            <path d={`M ${22*s} ${38*s} Q ${24*s} ${32*s} ${26*s} ${38*s} Q ${24*s} ${42*s} ${22*s} ${38*s}`} fill="#93C5FD" />
          )}
        </>
      )}

      {/* Mouth */}
      <path d={mouths[emotion] || mouths.smug} fill={isPanicked ? '#1E293B' : 'none'} stroke="#1E293B" strokeWidth={2*s} strokeLinecap="round" />

      {/* Tooth for smug */}
      {emotion === 'smug' && (
        <rect x={52*s} y={62*s} width={4*s} height={4*s} rx={1*s} fill="white" />
      )}

      {/* Blush */}
      <ellipse cx={28*s} cy={54*s} rx={5*s} ry={3*s} fill="#FBBF24" opacity={0.3} />
      <ellipse cx={72*s} cy={54*s} rx={5*s} ry={3*s} fill="#FBBF24" opacity={0.3} />

      {/* Short legs */}
      <ellipse cx={38*s} cy={88*s} rx={7*s} ry={4*s} fill="#65A30D" />
      <ellipse cx={62*s} cy={88*s} rx={7*s} ry={4*s} fill="#65A30D" />
      {/* Tiny arms */}
      <ellipse cx={20*s} cy={52*s} rx={5*s} ry={7*s} fill="#65A30D" transform={`rotate(-20 ${20*s} ${52*s})`} />
      <ellipse cx={80*s} cy={52*s} rx={5*s} ry={7*s} fill="#65A30D" transform={`rotate(20 ${80*s} ${52*s})`} />
    </svg>
  )
}
