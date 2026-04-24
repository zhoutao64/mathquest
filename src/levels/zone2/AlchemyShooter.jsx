import { useState, useCallback, useRef, useEffect } from 'react'

// ─── Sound Effects (Web Audio API, no files needed) ─────────
let audioCtx = null
let audioUnlocked = false
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

// Must be called directly in a user gesture (pointerdown/click) to unlock audio on mobile.
// Plays a silent buffer to force the context into 'running' state immediately.
export function unlockAudio() {
  try {
    const ctx = getAudioCtx()
    if (!audioUnlocked) {
      audioUnlocked = true
      // Play a tiny silent buffer — this forces iOS/Android to actually start the context
      const buf = ctx.createBuffer(1, 1, 22050)
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.connect(ctx.destination)
      src.start(0)
    }
  } catch {}
}

function playShootSound() {
  try {
    const ctx = getAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.12)
  } catch {}
}

function playHitSound() {
  try {
    const ctx = getAudioCtx()
    // Glass break: noise burst + high tone
    const t = ctx.currentTime
    // Tone
    const osc = ctx.createOscillator()
    const g1 = ctx.createGain()
    osc.connect(g1)
    g1.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, t)
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.15)
    g1.gain.setValueAtTime(0.2, t)
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
    osc.start(t)
    osc.stop(t + 0.2)
    // Sparkle
    const osc2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    osc2.connect(g2)
    g2.connect(ctx.destination)
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(2400, t + 0.05)
    osc2.frequency.exponentialRampToValueAtTime(800, t + 0.25)
    g2.gain.setValueAtTime(0.1, t + 0.05)
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
    osc2.start(t + 0.05)
    osc2.stop(t + 0.25)
  } catch {}
}

function playWrongSound() {
  try {
    const ctx = getAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(250, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.2)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.25)
  } catch {}
}

function playMissSound() {
  try {
    const ctx = getAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
  } catch {}
}

export function playSuccessSound() {
  try {
    const ctx = getAudioCtx()
    const t = ctx.currentTime
    // Ascending arpeggio: 3 quick notes
    ;[523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t + i * 0.1)
      gain.gain.setValueAtTime(0.15, t + i * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.2)
      osc.start(t + i * 0.1)
      osc.stop(t + i * 0.1 + 0.2)
    })
  } catch {}
}

export function playNextSound() {
  try {
    const ctx = getAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
  } catch {}
}

// ─── Starfield / Workshop background ────────────────────────
function WorkshopBackground({ W, H, variant }) {
  const bgColor = variant === 'vault' ? '#1a1525' : variant === 'garden' ? '#0f1a15' : '#1B1230'
  const wallColor = variant === 'vault' ? '#2a2035' : variant === 'garden' ? '#1a2a1f' : '#251845'

  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={bgColor} />
      {/* Stone wall pattern */}
      {[0, 60, 120, 180, 240].map(y => (
        <line key={y} x1={0} y1={y} x2={W} y2={y} stroke={wallColor} strokeWidth={0.5} opacity={0.4} />
      ))}
      {[0, 80, 160, 240, 320, 400].map(x => (
        <line key={x} x1={x} y1={0} x2={x} y2={H} stroke={wallColor} strokeWidth={0.5} opacity={0.3} />
      ))}
      {/* Ambient particles (bubbles) */}
      {[
        { cx: 40, cy: 60, r: 3, dur: '4s', delay: '0s' },
        { cx: 120, cy: 200, r: 2, dur: '5s', delay: '1s' },
        { cx: 280, cy: 80, r: 2.5, dur: '3.5s', delay: '0.5s' },
        { cx: 350, cy: 180, r: 2, dur: '4.5s', delay: '2s' },
        { cx: 200, cy: 250, r: 3, dur: '6s', delay: '1.5s' },
      ].map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#A78BFA" opacity={0.15}>
          <animate attributeName="cy" values={`${p.cy};${p.cy - 30};${p.cy}`} dur={p.dur} begin={p.delay} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.15;0.3;0.15" dur={p.dur} begin={p.delay} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Flask silhouettes */}
      <g opacity={0.08} fill="#A78BFA">
        <path d="M15 270 L15 250 Q15 240 25 240 L25 250 L25 270 Z" />
        <path d="M370 265 Q370 255 380 250 L380 260 Q390 260 390 270 L370 270 Z" />
      </g>
    </g>
  )
}

// ─── Bottle Break Effect (HTML overlay, no SVG animate) ─────
function BottleBreakEffect({ x, y, color, svgW, svgH, containerRef }) {
  const [progress, setProgress] = useState(0) // 0→1 over 600ms

  useEffect(() => {
    let start = null
    let raf
    const duration = 600
    const tick = (ts) => {
      if (!start) start = ts
      const p = Math.min(1, (ts - start) / duration)
      setProgress(p)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Convert SVG coords to % positions
  const pxPct = (100 * x) / svgW
  const pyPct = (100 * y) / svgH

  const particles = [
    { dx: -9, dy: -7, shard: true },
    { dx: 8, dy: -9, shard: true },
    { dx: -10, dy: 4, shard: true },
    { dx: 9, dy: 6, shard: true },
    { dx: 2, dy: -11, shard: true },
    { dx: -4, dy: 9, shard: true },
    { dx: -12, dy: -3, shard: false },
    { dx: 13, dy: -2, shard: false },
    { dx: -7, dy: 10, shard: false },
    { dx: 8, dy: 9, shard: false },
    { dx: 0, dy: -13, shard: false },
    { dx: -14, dy: 2, shard: false },
    { dx: 12, dy: 3, shard: false },
    { dx: 3, dy: 12, shard: false },
  ]

  const opacity = progress < 0.7 ? 1 : 1 - ((progress - 0.7) / 0.3)
  const flashScale = progress < 0.3 ? 1 + progress * 5 : 2.5
  const flashOpacity = progress < 0.3 ? 1 - progress * 2 : 0

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
    }}>
      {/* Flash */}
      <div style={{
        position: 'absolute',
        left: `${pxPct}%`, top: `${pyPct}%`,
        width: 16, height: 16, marginLeft: -8, marginTop: -8,
        borderRadius: '50%',
        background: 'white',
        transform: `scale(${flashScale})`,
        opacity: flashOpacity,
      }} />
      {/* Particles */}
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `calc(${pxPct}% + ${p.dx * progress * 3}px)`,
          top: `calc(${pyPct}% + ${p.dy * progress * 3}px)`,
          width: p.shard ? 6 : 8,
          height: p.shard ? 6 : 8,
          marginLeft: p.shard ? -3 : -4,
          marginTop: p.shard ? -3 : -4,
          borderRadius: p.shard ? 1 : '50%',
          background: p.shard ? 'rgba(255,255,255,0.9)' : color,
          border: p.shard ? `1px solid ${color}` : 'none',
          opacity,
          transform: `rotate(${progress * 180}deg) scale(${1 - progress * 0.6})`,
        }} />
      ))}
      {/* Checkmark */}
      <div style={{
        position: 'absolute',
        left: `${pxPct}%`, top: `${pyPct}%`,
        transform: 'translate(-50%, -50%)',
        fontSize: 20, fontWeight: 900, color: '#4ADE80',
        opacity: progress > 0.2 ? opacity : 0,
        textShadow: '0 1px 4px rgba(0,0,0,0.4)',
      }}>
        &#x2714;
      </div>
    </div>
  )
}

// ─── Potion Bottle target ───────────────────────────────────
function PotionBottle({ x, y, label, color, state, hitRadius }) {
  const bottleColor = color || '#A78BFA'
  const isCorrect = state === 'correct'
  const isWrong = state === 'wrong'
  const isIdle = state === 'idle'

  // When correct, render nothing in SVG (the HTML overlay handles the effect)
  if (isCorrect) return null

  return (
    <g>
      {/* Bottle body */}
      <rect x={x - 12} y={y - 8} width={24} height={22} rx={4}
        fill={isWrong ? '#EF4444' : bottleColor}
        opacity={0.85}
        stroke={isWrong ? '#DC2626' : 'rgba(255,255,255,0.3)'}
        strokeWidth={1} />
      {/* Shake on wrong — use CSS style instead of SVG animate */}
      {/* Bottle neck */}
      <rect x={x - 5} y={y - 16} width={10} height={10} rx={2}
        fill={isWrong ? '#EF4444' : bottleColor} opacity={0.7} />
      {/* Cork */}
      <rect x={x - 4} y={y - 20} width={8} height={5} rx={2} fill="#D4A574" />
      {/* Liquid shine */}
      <rect x={x - 8} y={y - 4} width={4} height={12} rx={2}
        fill="rgba(255,255,255,0.25)" />
      {/* Glow pulse for idle */}
      {isIdle && (
        <circle cx={x} cy={y} r={22} fill="none" stroke={bottleColor} strokeWidth={1} opacity={0.3}>
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Label text */}
      <text x={x} y={y + 32} textAnchor="middle"
        fill="white" fontSize={12} fontWeight={700}
        fontFamily="Nunito, sans-serif"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)', pointerEvents: 'none' }}>
        {label}
      </text>
    </g>
  )
}

// ─── Crosshair ──────────────────────────────────────────────
function Crosshair({ x, y, locked }) {
  const ringColor = locked ? '#4ADE80' : '#A78BFA'
  const lineColor = locked ? '#86EFAC' : '#C4B5FD'
  const dotColor = locked ? '#4ADE80' : '#FFE66D'
  return (
    <g transform={`translate(${x}, ${y})`} style={{ pointerEvents: 'none' }}>
      {/* Lock-on glow */}
      {locked && (
        <circle cx={0} cy={0} r={24} fill="none" stroke="#4ADE80" strokeWidth={2} opacity={0.4}>
          <animate attributeName="r" values="22;26;22" dur="0.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="0.6s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Outer ring */}
      <circle cx={0} cy={0} r={16} fill="none" stroke={ringColor} strokeWidth={locked ? 2 : 1.5} opacity={locked ? 0.9 : 0.6}>
        {!locked && <animate attributeName="r" values="16;18;16" dur="1.5s" repeatCount="indefinite" />}
      </circle>
      {/* Inner ring */}
      <circle cx={0} cy={0} r={6} fill="none" stroke={ringColor} strokeWidth={1} opacity={0.8} />
      {/* Cross lines */}
      <line x1={-20} y1={0} x2={-8} y2={0} stroke={lineColor} strokeWidth={1.5} />
      <line x1={8} y1={0} x2={20} y2={0} stroke={lineColor} strokeWidth={1.5} />
      <line x1={0} y1={-20} x2={0} y2={-8} stroke={lineColor} strokeWidth={1.5} />
      <line x1={0} y1={8} x2={0} y2={20} stroke={lineColor} strokeWidth={1.5} />
      {/* Center dot */}
      <circle cx={0} cy={0} r={locked ? 3 : 2} fill={dotColor} />
    </g>
  )
}


// ─── Shield Bar ─────────────────────────────────────────────
function ShieldBar({ current, max, x, y, width }) {
  const pct = current / max
  const barColor = pct > 0.5 ? '#4ECDC4' : pct > 0.25 ? '#FFE66D' : '#EF4444'
  return (
    <g>
      <text x={x} y={y - 4} fill="#94A3B8" fontSize={9} fontWeight={700}
        fontFamily="Nunito, sans-serif">SHIELD</text>
      <rect x={x} y={y} width={width} height={8} rx={4} fill="#1E1B2E" stroke="#334155" strokeWidth={0.5} />
      <rect x={x} y={y} width={width * pct} height={8} rx={4} fill={barColor}>
        <animate attributeName="width" to={width * pct} dur="0.3s" fill="freeze" />
      </rect>
    </g>
  )
}

// ─── Miss spark effect ──────────────────────────────────────
function MissSpark({ x, y }) {
  return (
    <g>
      <circle cx={x} cy={y} r={3} fill="#FFE66D" opacity={0.8}>
        <animate attributeName="r" values="3;8;0" dur="0.4s" fill="freeze" />
        <animate attributeName="opacity" values="0.8;0.3;0" dur="0.4s" fill="freeze" />
      </circle>
    </g>
  )
}

// ─── Virtual Joystick ───────────────────────────────────────
function VirtualJoystick({ onDirectionChange, disabled }) {
  const baseSize = 120
  const knobSize = 44
  const maxDist = (baseSize - knobSize) / 2
  const containerRef = useRef(null)
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const centerRef = useRef({ x: 0, y: 0 })

  const handleDown = useCallback((e) => {
    unlockAudio()
    if (disabled) return
    e.preventDefault()
    e.target.setPointerCapture(e.pointerId)
    dragging.current = true
    const rect = containerRef.current.getBoundingClientRect()
    centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    const dx = e.clientX - centerRef.current.x
    const dy = e.clientY - centerRef.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const clamped = dist > maxDist ? maxDist : dist
    const angle = Math.atan2(dy, dx)
    const ox = dist > 0 ? Math.cos(angle) * clamped : 0
    const oy = dist > 0 ? Math.sin(angle) * clamped : 0
    setKnobOffset({ x: ox, y: oy })
    onDirectionChange({ dx: ox / maxDist, dy: oy / maxDist })
  }, [disabled, maxDist, onDirectionChange])

  const handleMove = useCallback((e) => {
    if (!dragging.current) return
    e.preventDefault()
    const dx = e.clientX - centerRef.current.x
    const dy = e.clientY - centerRef.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const clamped = dist > maxDist ? maxDist : dist
    const angle = Math.atan2(dy, dx)
    const ox = Math.cos(angle) * clamped
    const oy = Math.sin(angle) * clamped
    setKnobOffset({ x: ox, y: oy })
    onDirectionChange({ dx: ox / maxDist, dy: oy / maxDist })
  }, [maxDist, onDirectionChange])

  const handleUp = useCallback(() => {
    dragging.current = false
    setKnobOffset({ x: 0, y: 0 })
    onDirectionChange({ dx: 0, dy: 0 })
  }, [onDirectionChange])

  return (
    <div
      ref={containerRef}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      style={{
        width: baseSize, height: baseSize, borderRadius: '50%',
        background: 'rgba(167, 139, 250, 0.12)',
        border: '2px solid rgba(167, 139, 250, 0.25)',
        position: 'relative',
        touchAction: 'none',
        userSelect: 'none',
        opacity: disabled ? 0.3 : 1,
        flexShrink: 0,
      }}
    >
      {/* Direction guides */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', opacity: 0.15, fontSize: 16, color: '#C4B5FD',
      }}>
        <span style={{ position: 'absolute', top: 8 }}>&#x25B2;</span>
        <span style={{ position: 'absolute', bottom: 8 }}>&#x25BC;</span>
        <span style={{ position: 'absolute', left: 10 }}>&#x25C0;</span>
        <span style={{ position: 'absolute', right: 10 }}>&#x25B6;</span>
      </div>
      {/* Knob */}
      <div style={{
        width: knobSize, height: knobSize, borderRadius: '50%',
        background: 'radial-gradient(circle, #C4B5FD 0%, #8B5CF6 100%)',
        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)',
        position: 'absolute',
        left: '50%', top: '50%',
        transform: `translate(calc(-50% + ${knobOffset.x}px), calc(-50% + ${knobOffset.y}px))`,
        transition: dragging.current ? 'none' : 'transform 0.15s ease-out',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

// ─── Fire Button ────────────────────────────────────────────
function FireButton({ onFire, disabled }) {
  const [pressed, setPressed] = useState(false)
  const cooldown = useRef(false)

  const handlePress = useCallback((e) => {
    // Unlock audio on first user gesture (required by mobile browsers)
    unlockAudio()
    if (disabled || cooldown.current) return
    setPressed(true)
    cooldown.current = true
    onFire()
    setTimeout(() => setPressed(false), 120)
    setTimeout(() => { cooldown.current = false }, 200)
  }, [disabled, onFire])

  return (
    <button
      onPointerDown={handlePress}
      style={{
        width: 80, height: 80, borderRadius: '50%',
        background: pressed
          ? 'radial-gradient(circle, #FFE66D 0%, #F59E0B 100%)'
          : 'radial-gradient(circle, #EF4444 0%, #DC2626 100%)',
        border: '3px solid rgba(255,255,255,0.3)',
        boxShadow: pressed
          ? '0 0 20px rgba(255, 230, 109, 0.5)'
          : '0 4px 12px rgba(239, 68, 68, 0.4)',
        color: 'white',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        transform: pressed ? 'scale(0.9)' : 'scale(1)',
        transition: 'transform 0.1s, background 0.1s, box-shadow 0.1s',
        touchAction: 'none',
        userSelect: 'none',
        flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span style={{ fontSize: 24, lineHeight: 1 }}>&#x1F3F9;</span>
      <span style={{ fontSize: 10, fontWeight: 800, fontFamily: 'Nunito, sans-serif', marginTop: 2 }}>FIRE</span>
    </button>
  )
}

// ─── Outer wrapper: forces full remount on task change via key ──
export default function AlchemyShooter(props) {
  const targetsKey = props.targets.map(t => `${t.id}:${t.label}`).join(',')
  return <AlchemyShooterInner key={targetsKey} {...props} />
}

// ─── Inner Engine Component (remounted each task) ───────────
function AlchemyShooterInner({
  targets,
  onShoot,
  mode = 'single',
  solved = false,
  background = 'workshop',
  hitRadius = 28,
  drift = false,
  children,
}) {
  const W = 400, H = 280
  const [crosshair, setCrosshair] = useState({ x: W / 2, y: H / 2 })
  const [targetStates, setTargetStates] = useState(() => {
    const s = {}
    targets.forEach(t => { s[t.id] = 'idle' })
    return s
  })
  const [shield, setShield] = useState(5)
  const [effects, setEffects] = useState([])
  const [lockedTarget, setLockedTarget] = useState(null)
  const [breakEffects, setBreakEffects] = useState([])
  const [driftOffsets, setDriftOffsets] = useState({})
  const effectId = useRef(0)
  const breakId = useRef(0)

  // RAF-driven crosshair movement
  const directionRef = useRef({ dx: 0, dy: 0 })
  const crosshairRef = useRef({ x: W / 2, y: H / 2 })
  const rafId = useRef(null)

  // Drift state stored in ref for RAF access
  const driftRef = useRef(() => {
    if (!drift) return {}
    const d = {}
    targets.forEach(t => {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.3 + Math.random() * 0.3
      d[t.id] = { x: 0, y: 0, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed }
    })
    return d
  })
  // Initialize driftRef on first render
  if (typeof driftRef.current === 'function') {
    driftRef.current = driftRef.current()
  }

  // Keep refs for RAF so the loop doesn't restart on every state change
  const targetsRef = useRef(targets)
  const targetStatesRef = useRef(targetStates)
  targetsRef.current = targets
  targetStatesRef.current = targetStates

  // RAF loop for joystick-driven movement + lock-on detection
  useEffect(() => {
    if (solved) return

    const SPEED = 3
    let frameCount = 0
    const tick = () => {
      const { dx, dy } = directionRef.current
      if (dx !== 0 || dy !== 0) {
        const pos = crosshairRef.current
        const nx = Math.max(10, Math.min(W - 10, pos.x + dx * SPEED))
        const ny = Math.max(10, Math.min(H - 10, pos.y + dy * SPEED))
        crosshairRef.current = { x: nx, y: ny }
        setCrosshair({ x: nx, y: ny })
      }
      // Update drift positions
      if (drift) {
        const d = driftRef.current
        const MARGIN = 15
        const MAX_DRIFT = 30
        let changed = false
        const ts = targetsRef.current
        ts.forEach(t => {
          const p = d[t.id]
          if (!p) return
          // Move
          p.x += p.vx
          p.y += p.vy
          // Clamp within max drift range
          if (Math.abs(p.x) > MAX_DRIFT) { p.vx = -p.vx; p.x = Math.sign(p.x) * MAX_DRIFT }
          if (Math.abs(p.y) > MAX_DRIFT) { p.vy = -p.vy; p.y = Math.sign(p.y) * MAX_DRIFT }
          // Bounce off viewport edges
          if (t.x + p.x < MARGIN || t.x + p.x > W - MARGIN) p.vx = -p.vx
          if (t.y + p.y < MARGIN || t.y + p.y > H - MARGIN) p.vy = -p.vy
          // Slight random jitter every ~60 frames
          if (frameCount % 60 === 0) {
            p.vx += (Math.random() - 0.5) * 0.15
            p.vy += (Math.random() - 0.5) * 0.15
            const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
            if (spd > 0.7) { p.vx *= 0.7 / spd; p.vy *= 0.7 / spd }
          }
          changed = true
        })
        // Update React state every 2 frames for smooth rendering
        if (changed && frameCount % 2 === 0) {
          const offsets = {}
          ts.forEach(t => {
            const p = d[t.id]
            if (p) offsets[t.id] = { x: p.x, y: p.y }
          })
          setDriftOffsets(offsets)
        }
      }
      // Check lock-on every 4 frames
      frameCount++
      if (frameCount % 4 === 0) {
        const pos = crosshairRef.current
        const ts = targetsRef.current
        let found = null
        let bestDist = Infinity
        ts.forEach(t => {
          if (targetStatesRef.current[t.id] === 'correct') return
          const off = driftRef.current[t.id]
          const tx = t.x + (off ? off.x : 0)
          const ty = t.y + (off ? off.y : 0)
          const ddx = pos.x - tx
          const ddy = pos.y - ty
          const dist = Math.sqrt(ddx * ddx + ddy * ddy)
          if (dist < hitRadius && dist < bestDist) {
            bestDist = dist
            found = t.id
          }
        })
        setLockedTarget(found)
      }
      rafId.current = requestAnimationFrame(tick)
    }
    rafId.current = requestAnimationFrame(tick)
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current) }
  }, [solved, hitRadius, drift])

  const handleDirectionChange = useCallback((dir) => {
    directionRef.current = dir
  }, [])

  // Keep onShoot in a ref so handleFire never goes stale
  const onShootRef = useRef(onShoot)
  onShootRef.current = onShoot

  const handleFire = useCallback(() => {
    if (solved) return

    playShootSound()
    const pos = crosshairRef.current

    // Use refs to avoid stale closures
    const currentTargets = targetsRef.current

    // Find closest target within hit radius
    let closestTarget = null
    let closestDist = Infinity

    currentTargets.forEach(t => {
      if (targetStatesRef.current[t.id] === 'correct') return
      const off = driftRef.current[t.id]
      const tx = t.x + (off ? off.x : 0)
      const ty = t.y + (off ? off.y : 0)
      const dx = pos.x - tx
      const dy = pos.y - ty
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < hitRadius && dist < closestDist) {
        closestDist = dist
        closestTarget = t
      }
    })

    if (!closestTarget) {
      // Miss
      playMissSound()
      const id = effectId.current++
      setEffects(prev => [...prev, { type: 'miss', x: pos.x, y: pos.y, id }])
      setTimeout(() => {
        setEffects(prev => prev.filter(e => e.id !== id))
      }, 500)
      return
    }

    const result = onShootRef.current(closestTarget)

    if (result === 'correct') {
      playHitSound()
      setTargetStates(prev => ({ ...prev, [closestTarget.id]: 'correct' }))
      const bid = breakId.current++
      const bOff = driftRef.current[closestTarget.id]
      setBreakEffects(prev => [...prev, {
        id: bid,
        x: closestTarget.x + (bOff ? bOff.x : 0),
        y: closestTarget.y + (bOff ? bOff.y : 0),
        color: closestTarget.color || '#A78BFA',
      }])
      setTimeout(() => {
        setBreakEffects(prev => prev.filter(e => e.id !== bid))
      }, 700)
    } else {
      playWrongSound()
      setTargetStates(prev => ({ ...prev, [closestTarget.id]: 'wrong' }))
      setShield(prev => Math.max(0, prev - 1))
      setTimeout(() => {
        setTargetStates(prev => ({ ...prev, [closestTarget.id]: 'idle' }))
      }, 600)
    }
  }, [solved, hitRadius])

  return (
    <div style={{ position: 'relative', maxWidth: 480, width: '100%', margin: '0 auto' }}>
      {/* Game area wrapper */}
      <div style={{ position: 'relative' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{
            width: '100%',
            display: 'block',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          <WorkshopBackground W={W} H={H} variant={background} />
          <ShieldBar current={shield} max={5} x={10} y={10} width={80} />
          {children}
          {targets.map(t => {
            const off = driftOffsets[t.id]
            return (
              <PotionBottle
                key={t.id}
                x={t.x + (off ? off.x : 0)}
                y={t.y + (off ? off.y : 0)}
                label={t.label}
                color={t.color}
                state={targetStates[t.id] || 'idle'}
                hitRadius={hitRadius}
              />
            )
          })}
          {effects.map(e => (
            e.type === 'miss' && <MissSpark key={e.id} x={e.x} y={e.y} />
          ))}
          {!solved && <Crosshair x={crosshair.x} y={crosshair.y} locked={!!lockedTarget} />}
        </svg>
        {/* HTML bottle break effects overlaid on SVG */}
        {breakEffects.map(b => (
          <BottleBreakEffect key={b.id} x={b.x} y={b.y} color={b.color} svgW={W} svgH={H} />
        ))}
      </div>

      {/* Controls */}
      {!solved && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', marginTop: 8,
          background: 'rgba(30, 27, 46, 0.6)',
          borderRadius: 16,
          backdropFilter: 'blur(8px)',
        }}>
          <VirtualJoystick onDirectionChange={handleDirectionChange} disabled={solved} />
          <FireButton onFire={handleFire} disabled={solved} />
        </div>
      )}
    </div>
  )
}
