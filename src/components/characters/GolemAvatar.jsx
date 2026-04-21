// Golem — Stone face with glowing eyes, cracked surface, heavy brow
export default function GolemAvatar({ size = 80, emotion = 'serious' }) {
  const s = size / 100

  const eyeGlow = emotion === 'friendly' ? '#4ADE80' : emotion === 'awakening' ? '#FBBF24' : '#60A5FA'

  const mouths = {
    serious: `M ${36*s} ${68*s} L ${64*s} ${68*s}`,
    angry: `M ${36*s} ${72*s} Q ${50*s} ${64*s} ${64*s} ${72*s}`,
    friendly: `M ${38*s} ${68*s} Q ${50*s} ${76*s} ${62*s} ${68*s}`,
    awakening: `M ${42*s} ${68*s} Q ${50*s} ${74*s} ${58*s} ${68*s}`,
    confused: `M ${38*s} ${70*s} Q ${50*s} ${66*s} ${62*s} ${70*s}`,
  }

  const browAngle = emotion === 'angry' ? 6 : emotion === 'friendly' ? -2 : 2

  return (
    <svg width={size} height={size} viewBox={`0 0 ${100*s} ${100*s}`}>
      {/* Head (rough stone shape) */}
      <path d={`
        M ${25*s} ${30*s}
        L ${30*s} ${15*s}
        L ${45*s} ${8*s}
        L ${60*s} ${10*s}
        L ${72*s} ${18*s}
        L ${78*s} ${32*s}
        L ${80*s} ${55*s}
        L ${75*s} ${75*s}
        L ${65*s} ${85*s}
        L ${50*s} ${90*s}
        L ${35*s} ${85*s}
        L ${25*s} ${75*s}
        L ${20*s} ${55*s}
        Z
      `} fill="#9CA3AF" />

      {/* Stone texture - lighter patches */}
      <path d={`
        M ${30*s} ${25*s}
        L ${42*s} ${18*s}
        L ${55*s} ${20*s}
        L ${65*s} ${28*s}
        L ${70*s} ${45*s}
        L ${65*s} ${55*s}
        L ${50*s} ${58*s}
        L ${35*s} ${55*s}
        L ${28*s} ${40*s}
        Z
      `} fill="#B0B8C4" opacity={0.5} />

      {/* Cracks */}
      <path d={`M ${35*s} ${15*s} L ${38*s} ${28*s} L ${34*s} ${38*s}`} fill="none" stroke="#6B7280" strokeWidth={1.5*s} />
      <path d={`M ${68*s} ${22*s} L ${65*s} ${35*s} L ${70*s} ${42*s}`} fill="none" stroke="#6B7280" strokeWidth={1.5*s} />
      <path d={`M ${28*s} ${65*s} L ${35*s} ${72*s}`} fill="none" stroke="#6B7280" strokeWidth={1*s} />

      {/* Heavy brow ridge */}
      <path d={`M ${26*s} ${38*s} L ${48*s} ${34*s} L ${52*s} ${34*s} L ${76*s} ${38*s}`}
        fill="#7C8590" />

      {/* Eye sockets (dark) */}
      <ellipse cx={38*s} cy={48*s} rx={10*s} ry={8*s} fill="#4B5563" />
      <ellipse cx={62*s} cy={48*s} rx={10*s} ry={8*s} fill="#4B5563" />

      {/* Glowing eyes */}
      <ellipse cx={38*s} cy={48*s} rx={7*s} ry={6*s} fill={eyeGlow} opacity={0.8} />
      <ellipse cx={62*s} cy={48*s} rx={7*s} ry={6*s} fill={eyeGlow} opacity={0.8} />
      {/* Eye glow effect */}
      <ellipse cx={38*s} cy={48*s} rx={4*s} ry={3*s} fill="white" opacity={0.5} />
      <ellipse cx={62*s} cy={48*s} rx={4*s} ry={3*s} fill="white" opacity={0.5} />
      {/* Pupils */}
      <ellipse cx={38*s} cy={48*s} rx={2.5*s} ry={2*s} fill="white" />
      <ellipse cx={62*s} cy={48*s} rx={2.5*s} ry={2*s} fill="white" />

      {/* Eyebrows (heavy stone slabs) */}
      <line x1={28*s} y1={(40 - browAngle)*s} x2={48*s} y2={(38 + browAngle)*s}
        stroke="#6B7280" strokeWidth={4*s} strokeLinecap="round" />
      <line x1={52*s} y1={(38 + browAngle)*s} x2={72*s} y2={(40 - browAngle)*s}
        stroke="#6B7280" strokeWidth={4*s} strokeLinecap="round" />

      {/* Mouth (carved line) */}
      <path d={mouths[emotion] || mouths.serious}
        fill="none" stroke="#4B5563" strokeWidth={3*s} strokeLinecap="round" />

      {/* Rune symbol on forehead */}
      <path d={`M ${50*s} ${22*s} L ${46*s} ${28*s} L ${54*s} ${28*s} Z`}
        fill="none" stroke={eyeGlow} strokeWidth={1.5*s} opacity={0.7} />
      <circle cx={50*s} cy={26*s} r={1.5*s} fill={eyeGlow} opacity={0.6} />

      {/* Shoulder suggestion */}
      <path d={`M ${20*s} ${80*s} L ${25*s} ${75*s}`} fill="none" stroke="#7C8590" strokeWidth={3*s} strokeLinecap="round" />
      <path d={`M ${80*s} ${80*s} L ${75*s} ${75*s}`} fill="none" stroke="#7C8590" strokeWidth={3*s} strokeLinecap="round" />
    </svg>
  )
}
