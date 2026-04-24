import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

// ─── Audio ──────────────────────────────────────────────────
let audioCtx = null
let audioUnlocked = false
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}
function unlockAudio() {
  try {
    const ctx = getCtx()
    if (!audioUnlocked) {
      audioUnlocked = true
      const buf = ctx.createBuffer(1, 1, 22050)
      const src = ctx.createBufferSource()
      src.buffer = buf; src.connect(ctx.destination); src.start(0)
    }
  } catch {}
}
function tone({ type = 'sine', f1, f2, dur, gain = 0.12, delay = 0 }) {
  try {
    const ctx = getCtx()
    const t = ctx.currentTime + delay
    const osc = ctx.createOscillator(); const g = ctx.createGain()
    osc.connect(g); g.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(f1, t)
    if (f2 != null && f2 !== f1) osc.frequency.exponentialRampToValueAtTime(Math.max(40, f2), t + dur)
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    osc.start(t); osc.stop(t + dur + 0.02)
  } catch {}
}
const sfx = {
  jump: () => tone({ type: 'triangle', f1: 500, f2: 850, dur: 0.12, gain: 0.1 }),
  land: () => { tone({ type: 'sine', f1: 180, f2: 100, dur: 0.08, gain: 0.1 }); tone({ type: 'triangle', f1: 600, f2: 400, dur: 0.05, gain: 0.04 }) },
  fall: () => { tone({ type: 'sawtooth', f1: 400, f2: 80, dur: 0.4, gain: 0.14 }); tone({ type: 'square', f1: 200, f2: 60, dur: 0.3, gain: 0.08, delay: 0.05 }) },
  victory: () => { [523, 659, 784, 1047].forEach((f, i) => tone({ type: 'triangle', f1: f, f2: f, dur: 0.3, gain: 0.12, delay: i * 0.08 })) },
}

// ─── Constants / Level Data ─────────────────────────────────
const W = 420, H = 340
const UNIT = 34
const ORIGIN_X = 50
const ORIGIN_Y = 280
const START_X = 30
const START_Y = 280
const GROUND_RIGHT = 60  // ground platform extends to this screen x

// Default level = L1 Pattern Jump (y = x)
const DEFAULT_LEVEL = {
  planks: [
    { gx: 1, gy: 1, gw: 0.8 },
    { gx: 2, gy: 2, gw: 0.8 },
    { gx: 3, gy: 3, gw: 0.8 },
    { gx: 4, gy: 4, gw: 0.8 },
    { gx: 5, gy: 5, gw: 1.2, isGoal: true },
  ],
  equation: 'y = x',
  titleEn: 'PATTERN JUMP',
  titleZh: '\u89C4\u5F8B\u8DF3\u53F0',
  slope: 1,
  intercept: 0,
}

function toPlankScreens(planks) {
  return planks.map(p => ({
    top: ORIGIN_Y - p.gy * UNIT,
    left: ORIGIN_X + (p.gx - p.gw / 2) * UNIT,
    right: ORIGIN_X + (p.gx + p.gw / 2) * UNIT,
    isGoal: p.isGoal,
    gx: p.gx, gy: p.gy,
  }))
}

// ─── Scenery ────────────────────────────────────────────────
function Background() {
  return (
    <g>
      <defs>
        <linearGradient id="pkSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="60%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill="url(#pkSky)" />
      {/* Stars */}
      {[{cx:40,cy:30},{cx:110,cy:60},{cx:200,cy:25},{cx:290,cy:70},{cx:330,cy:20},{cx:60,cy:90},{cx:250,cy:110}].map((s,i)=>(
        <circle key={i} cx={s.cx} cy={s.cy} r={1} fill="white" opacity={0.8}>
          <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2+i*0.5}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Moon */}
      <circle cx={360} cy={50} r={12} fill="#FEF9C3" />
      <circle cx={360} cy={50} r={24} fill="#FEF9C3" opacity={0.15} />
      {/* Far mountain silhouettes */}
      <path d="M 0 220 L 80 160 L 140 200 L 220 140 L 300 190 L 380 150 L 420 180 L 420 260 L 0 260 Z"
        fill="#1E293B" opacity={0.6} />
      <path d="M 0 240 L 60 210 L 140 230 L 210 195 L 280 220 L 360 200 L 420 225 L 420 280 L 0 280 Z"
        fill="#0F172A" opacity={0.8} />
    </g>
  )
}

function Grid() {
  const GRID_MAX_X = 9, GRID_MAX_Y = 7
  const axisColor = 'rgba(255,255,255,0.5)'
  const gridColor = 'rgba(255,255,255,0.1)'
  const lines = []
  for (let i = 0; i <= GRID_MAX_X; i++) {
    const x = ORIGIN_X + i * UNIT
    lines.push(<line key={`gx${i}`} x1={x} y1={ORIGIN_Y} x2={x} y2={ORIGIN_Y - GRID_MAX_Y * UNIT} stroke={gridColor} strokeWidth={0.6} />)
  }
  for (let i = 0; i <= GRID_MAX_Y; i++) {
    const y = ORIGIN_Y - i * UNIT
    lines.push(<line key={`gy${i}`} x1={ORIGIN_X} y1={y} x2={ORIGIN_X + GRID_MAX_X * UNIT} y2={y} stroke={gridColor} strokeWidth={0.6} />)
  }
  return (
    <g>
      {lines}
      <line x1={ORIGIN_X} y1={ORIGIN_Y} x2={ORIGIN_X + GRID_MAX_X * UNIT} y2={ORIGIN_Y} stroke={axisColor} strokeWidth={1.5} />
      <line x1={ORIGIN_X} y1={ORIGIN_Y} x2={ORIGIN_X} y2={ORIGIN_Y - GRID_MAX_Y * UNIT} stroke={axisColor} strokeWidth={1.5} />
      <text x={ORIGIN_X - 6} y={ORIGIN_Y + 4} textAnchor="end" fontSize={10} fill={axisColor} fontFamily="Nunito, sans-serif">0</text>
      <text x={ORIGIN_X + GRID_MAX_X * UNIT + 4} y={ORIGIN_Y + 5} fontSize={14} fontWeight={800} fill="rgba(255,255,255,0.75)" fontFamily="Nunito, sans-serif">x</text>
      <text x={ORIGIN_X - 6} y={ORIGIN_Y - GRID_MAX_Y * UNIT + 2} textAnchor="end" fontSize={14} fontWeight={800} fill="rgba(255,255,255,0.75)" fontFamily="Nunito, sans-serif">y</text>
    </g>
  )
}

// ─── Plank ──────────────────────────────────────────────────
function Plank({ left, right, top, isGoal }) {
  const w = right - left
  const color = isGoal ? '#D97706' : '#92400E'
  const hl = isGoal ? '#FDE047' : '#D97706'
  return (
    <g>
      {/* Shadow */}
      <rect x={left} y={top + 5} width={w} height={4} rx={1} fill="#000" opacity={0.4} />
      {/* Main */}
      <rect x={left} y={top} width={w} height={7} rx={1.5} fill={color} stroke="#451A03" strokeWidth={1} />
      {/* Highlight */}
      <rect x={left} y={top} width={w} height={2} fill={hl} opacity={0.7} />
      {isGoal && (
        <rect x={left} y={top - 2} width={w} height={10} rx={2} fill="none" stroke="#FDE047" strokeWidth={1} opacity={0.4}>
          <animate attributeName="stroke-opacity" values="0.2;0.6;0.2" dur="1.2s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  )
}

// ─── Character ──────────────────────────────────────────────
function Character({ x, y, facing, grounded }) {
  const flip = facing === 'left' ? -1 : 1
  return (
    <g transform={`translate(${x}, ${y})`}>
      <ellipse cx={0} cy={0} rx={8} ry={2} fill="#000" opacity={0.3} />
      <g transform={`scale(${flip}, 1)`}>
        {/* Body */}
        <rect x={-6} y={-18} width={12} height={16} rx={2} fill="#EF4444" stroke="#991B1B" strokeWidth={1} />
        {/* Head */}
        <circle cx={0} cy={-22} r={5} fill="#FBCFE8" stroke="#BE185D" strokeWidth={0.8} />
        {/* Face (eye) */}
        <circle cx={2} cy={-22} r={1} fill="#1E293B" />
        {/* Hat */}
        <path d="M -6 -26 L 6 -26 L 4 -30 L -4 -30 Z" fill="#78350F" />
        <rect x={-7} y={-27} width={14} height={1.5} fill="#78350F" />
        {/* Arms */}
        {grounded ? (
          <>
            <rect x={-9} y={-16} width={2} height={8} rx={1} fill="#EF4444" />
            <rect x={7} y={-16} width={2} height={8} rx={1} fill="#EF4444" />
          </>
        ) : (
          <>
            <rect x={-10} y={-18} width={2} height={8} rx={1} fill="#EF4444" transform="rotate(-30 -9 -14)" />
            <rect x={8} y={-18} width={2} height={8} rx={1} fill="#EF4444" transform="rotate(30 9 -14)" />
          </>
        )}
        {/* Legs */}
        {grounded ? (
          <>
            <rect x={-4} y={-2} width={2} height={3} fill="#78350F" />
            <rect x={2} y={-2} width={2} height={3} fill="#78350F" />
          </>
        ) : (
          <>
            <rect x={-4} y={-4} width={2} height={5} fill="#78350F" transform="rotate(-20 -3 -2)" />
            <rect x={2} y={-4} width={2} height={5} fill="#78350F" transform="rotate(20 3 -2)" />
          </>
        )}
      </g>
    </g>
  )
}

// ─── Virtual Joystick ───────────────────────────────────────
function VirtualJoystick({ onDirectionChange, disabled }) {
  const BASE = 120, KNOB = 44, MAX = (BASE - KNOB) / 2
  const containerRef = useRef(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const centerRef = useRef({ x: 0, y: 0 })

  const down = useCallback((e) => {
    unlockAudio()
    if (disabled) return
    e.preventDefault()
    try { e.target.setPointerCapture(e.pointerId) } catch {}
    dragging.current = true
    const rect = containerRef.current.getBoundingClientRect()
    centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    move(e)
  }, [disabled])

  const move = useCallback((e) => {
    if (!dragging.current) return
    e.preventDefault()
    const dx = e.clientX - centerRef.current.x
    const dy = e.clientY - centerRef.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const clamped = dist > MAX ? MAX : dist
    const angle = Math.atan2(dy, dx)
    const ox = dist > 0 ? Math.cos(angle) * clamped : 0
    const oy = dist > 0 ? Math.sin(angle) * clamped : 0
    setOffset({ x: ox, y: oy })
    onDirectionChange({ dx: ox / MAX, dy: oy / MAX })
  }, [onDirectionChange])

  const up = useCallback(() => {
    dragging.current = false
    setOffset({ x: 0, y: 0 })
    onDirectionChange({ dx: 0, dy: 0 })
  }, [onDirectionChange])

  return (
    <div
      ref={containerRef}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      style={{
        width: BASE, height: BASE, borderRadius: '50%',
        background: 'rgba(96, 165, 250, 0.12)',
        border: '2px solid rgba(96, 165, 250, 0.25)',
        position: 'relative', touchAction: 'none', userSelect: 'none',
        opacity: disabled ? 0.3 : 1, flexShrink: 0,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: 0.2, fontSize: 14, color: '#93C5FD' }}>
        <span style={{ position: 'absolute', left: 10 }}>{'\u25C0'}</span>
        <span style={{ position: 'absolute', right: 10 }}>{'\u25B6'}</span>
      </div>
      <div style={{
        width: KNOB, height: KNOB, borderRadius: '50%',
        background: 'radial-gradient(circle, #93C5FD 0%, #3B82F6 100%)',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
        position: 'absolute', left: '50%', top: '50%',
        transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
        transition: dragging.current ? 'none' : 'transform 0.15s ease-out',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

// ─── Jump Button ────────────────────────────────────────────
function JumpButton({ onJumpDown, onJumpUp, disabled }) {
  const [pressed, setPressed] = useState(false)
  const handleDown = useCallback((e) => {
    unlockAudio()
    if (disabled) return
    e.preventDefault()
    setPressed(true)
    onJumpDown()
  }, [disabled, onJumpDown])
  const handleUp = useCallback((e) => {
    if (disabled) return
    e.preventDefault()
    setPressed(false)
    onJumpUp()
  }, [disabled, onJumpUp])
  return (
    <button
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onPointerLeave={handleUp}
      style={{
        width: 80, height: 80, borderRadius: '50%',
        background: pressed
          ? 'radial-gradient(circle, #FDE047 0%, #F59E0B 100%)'
          : 'radial-gradient(circle, #60A5FA 0%, #1E40AF 100%)',
        border: '3px solid rgba(255,255,255,0.3)',
        boxShadow: pressed ? '0 0 20px rgba(253,224,71,0.5)' : '0 4px 12px rgba(59,130,246,0.4)',
        color: 'white',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        transform: pressed ? 'scale(0.9)' : 'scale(1)',
        transition: 'transform 0.1s, background 0.1s, box-shadow 0.1s',
        touchAction: 'none', userSelect: 'none', flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span style={{ fontSize: 24, lineHeight: 1 }}>{'\u2B06\uFE0F'}</span>
      <span style={{ fontSize: 10, fontWeight: 800, fontFamily: 'Nunito, sans-serif', marginTop: 2 }}>JUMP</span>
    </button>
  )
}

// ─── Main Component ─────────────────────────────────────────
export default function Parkour({ onComplete, levelData = DEFAULT_LEVEL }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'

  const plankScreens = useMemo(() => toPlankScreens(levelData.planks), [levelData.planks])

  const [pose, setPose] = useState({ x: START_X, y: START_Y, grounded: true, facing: 'right' })
  const [falls, setFalls] = useState(0)
  const [reached, setReached] = useState(false)

  const physRef = useRef({ x: START_X, y: START_Y, vx: 0, vy: 0, grounded: true, facing: 'right', coyoteFrames: 0, jumpWasHeld: false })
  const inputRef = useRef({ joyX: 0, jumpTs: 0, jumpHeld: false })
  const reachedRef = useRef(false)

  // ── Physics loop ──
  useEffect(() => {
    let raf
    const tick = () => {
      const p = physRef.current
      const inp = inputRef.current

      // Horizontal acceleration (smoother than instant snap)
      const targetVx = inp.joyX * 4
      const accel = p.grounded ? 0.55 : 0.35
      const decel = p.grounded ? 0.45 : 0.18
      if (Math.abs(inp.joyX) > 0.1) {
        if (p.vx < targetVx) p.vx = Math.min(targetVx, p.vx + accel)
        else p.vx = Math.max(targetVx, p.vx - accel)
        if (inp.joyX > 0.15) p.facing = 'right'
        else if (inp.joyX < -0.15) p.facing = 'left'
      } else {
        if (p.vx > 0) p.vx = Math.max(0, p.vx - decel)
        else if (p.vx < 0) p.vx = Math.min(0, p.vx + decel)
      }

      // Coyote time: brief grace period after leaving a platform
      if (p.grounded) p.coyoteFrames = 7
      else if (p.coyoteFrames > 0) p.coyoteFrames -= 1

      // Buffered jump + coyote time: press within 120ms AND can still jump
      const canJump = p.grounded || p.coyoteFrames > 0
      if (performance.now() - inp.jumpTs < 120 && canJump) {
        p.vy = -10
        p.grounded = false
        p.coyoteFrames = 0
        inp.jumpTs = 0
        sfx.jump()
      }

      // Variable jump height: release jump mid-ascent → cut short
      const justReleased = p.jumpWasHeld && !inp.jumpHeld
      p.jumpWasHeld = inp.jumpHeld
      if (justReleased && p.vy < -3) p.vy = -3

      // Gravity
      p.vy += 0.5
      if (p.vy > 15) p.vy = 15

      // Apply velocity
      const prevY = p.y
      p.x += p.vx
      p.y += p.vy

      // Horizontal clamp
      if (p.x < 10) p.x = 10
      if (p.x > W - 10) p.x = W - 10

      // Landing: one-way collision (from above, moving down)
      let landed = false
      for (const plank of plankScreens) {
        if (p.x + 7 > plank.left && p.x - 7 < plank.right) {
          if (prevY <= plank.top + 0.5 && p.y >= plank.top && p.vy >= 0) {
            p.y = plank.top
            p.vy = 0
            landed = true
          }
        }
      }
      // Ground platform
      if (!landed && p.x < GROUND_RIGHT + 7) {
        if (prevY <= ORIGIN_Y + 0.5 && p.y >= ORIGIN_Y && p.vy >= 0) {
          p.y = ORIGIN_Y
          p.vy = 0
          landed = true
        }
      }
      const wasGrounded = p.grounded
      p.grounded = landed
      if (!wasGrounded && landed) sfx.land()

      // Fall off screen
      if (p.y > H + 40) {
        p.x = START_X; p.y = START_Y; p.vx = 0; p.vy = 0; p.grounded = true
        setFalls((f) => f + 1)
        sfx.fall()
      }

      // Goal check
      if (!reachedRef.current && p.grounded) {
        const goal = plankScreens[plankScreens.length - 1]
        if (p.x + 5 > goal.left && p.x - 5 < goal.right && Math.abs(p.y - goal.top) < 2) {
          reachedRef.current = true
          setReached(true)
          sfx.victory()
        }
      }

      setPose({ x: p.x, y: p.y, grounded: p.grounded, facing: p.facing })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [plankScreens])

  const handleNext = useCallback(() => {
    const stars = falls === 0 ? 3 : falls <= 3 ? 2 : 1
    onComplete({ stars, mistakes: falls })
  }, [falls, onComplete])

  const handleDirection = useCallback((dir) => {
    inputRef.current.joyX = dir.dx
  }, [])

  const handleJumpDown = useCallback(() => {
    inputRef.current.jumpTs = performance.now()
    inputRef.current.jumpHeld = true
  }, [])
  const handleJumpUp = useCallback(() => {
    inputRef.current.jumpHeld = false
  }, [])

  const goal = plankScreens[plankScreens.length - 1]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 12px 30px', minHeight: '100vh', gap: 10,
      background: 'radial-gradient(ellipse at top, #1E3A8A 0%, #0B1120 100%)',
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{
          fontSize: 'clamp(1.1rem, 4vw, 1.35rem)', fontWeight: 900, color: '#93C5FD',
          margin: 0, textShadow: '0 2px 6px rgba(0,0,0,0.6)', letterSpacing: 1,
        }}>
          {lang === 'zh' ? levelData.titleZh : levelData.titleEn}
        </h2>
        <div style={{ fontSize: 12, color: '#BFDBFE', marginTop: 2, fontWeight: 700 }}>
          {levelData.equation}
          {falls > 0 && <span style={{ marginLeft: 10, color: '#FCA5A5' }}>{lang === 'zh' ? `\u8DCC\u5012 × ${falls}` : `falls × ${falls}`}</span>}
        </div>
      </div>

      {/* Scene */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{
          width: '100%', maxWidth: 480, display: 'block', borderRadius: 14,
          boxShadow: '0 6px 24px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(147,197,253,0.2)',
          touchAction: 'none',
        }}
      >
        <Background />
        <Grid />

        {/* Ground platform */}
        <rect x={0} y={ORIGIN_Y} width={GROUND_RIGHT + 7} height={H - ORIGIN_Y} fill="#374151" />
        <rect x={0} y={ORIGIN_Y} width={GROUND_RIGHT + 7} height={4} fill="#4B5563" />

        {/* Planks */}
        {plankScreens.map((plank, i) => (
          <Plank key={i} left={plank.left} right={plank.right} top={plank.top} isGoal={plank.isGoal} />
        ))}

        {/* Goal flag — planted exactly at the grid point (goal.gx, goal.gy) */}
        <g transform={`translate(${ORIGIN_X + goal.gx * UNIT}, ${goal.top})`}>
          <line x1={0} y1={0} x2={0} y2={-28} stroke="#78350F" strokeWidth={2} />
          <path d="M 0 -28 L 16 -23 L 0 -18 Z" fill="#FDE047" stroke="#F59E0B" strokeWidth={1}>
            <animate attributeName="d" values="M 0 -28 L 16 -23 L 0 -18 Z;M 0 -28 L 13 -22 L 0 -18 Z;M 0 -28 L 16 -23 L 0 -18 Z"
              dur="1.5s" repeatCount="indefinite" />
          </path>
        </g>

        {/* Character */}
        <Character x={pose.x} y={pose.y} facing={pose.facing} grounded={pose.grounded} />

        {/* After-victory: glowing dashed line through all planks + coord labels */}
        {reached && (
          <g>
            <polyline
              points={[
                `${ORIGIN_X},${ORIGIN_Y}`,
                ...plankScreens.map(p => `${ORIGIN_X + p.gx * UNIT},${p.top}`),
              ].join(' ')}
              fill="none" stroke="#FDE047" strokeWidth={2.5}
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="6 4" opacity={0.9}
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1s" repeatCount="indefinite" />
            </polyline>
            {/* Origin label (0,0) */}
            <text x={ORIGIN_X - 4} y={ORIGIN_Y - 4} textAnchor="end" fontSize={10} fontWeight={900}
              fill="#FDE047" fontFamily="Nunito, sans-serif"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              (0,0)
            </text>
            {/* Coord label at each plank */}
            {plankScreens.map((p, i) => (
              <text key={`lbl${i}`} x={ORIGIN_X + p.gx * UNIT} y={p.top - 14}
                textAnchor="middle" fontSize={10} fontWeight={900}
                fill="#FDE047" fontFamily="Nunito, sans-serif"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                ({p.gx},{p.gy})
              </text>
            ))}
          </g>
        )}
      </svg>

      {/* Victory card or Controls */}
      {reached ? (
        <div style={{
          maxWidth: 420, width: '100%', padding: '16px 18px',
          background: 'linear-gradient(135deg, rgba(219,234,254,0.95), rgba(147,197,253,0.9))',
          border: '3px solid #3B82F6', borderRadius: 16, textAlign: 'center',
          boxShadow: '0 8px 30px rgba(59,130,246,0.5)',
          animation: 'bounce-in 0.4s',
        }}>
          <div style={{ fontSize: 26, marginBottom: 2 }}>{'\u2728'}</div>
          <div style={{
            fontSize: 26, fontWeight: 900, color: '#1E3A8A',
            fontFamily: 'Nunito, sans-serif', letterSpacing: 2,
            textShadow: '0 2px 4px rgba(59,130,246,0.2)', margin: '4px 0',
          }}>
            {levelData.equation}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1E3A8A', marginTop: 6, lineHeight: 1.5 }}>
            {lang === 'zh'
              ? `\u6BCF\u5411\u53F3 1 \u6B65\uFF0C\u5C31\u5411\u4E0A ${levelData.slope} \u683C`
              : `Each step right → ${levelData.slope} step${levelData.slope > 1 ? 's' : ''} up`}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginTop: 6 }}>
            {lang === 'zh' ? `\u659C\u7387 m = ${levelData.slope}` : `Slope m = ${levelData.slope}`}
            &nbsp;·&nbsp; {lang === 'zh' ? '\u8DCC\u5012' : 'falls'}: {falls}
          </div>
          <button onClick={handleNext} style={{
            marginTop: 14, padding: '10px 28px',
            background: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
            color: 'white', border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
            fontFamily: 'Nunito, sans-serif', letterSpacing: 1,
          }}>
            {lang === 'zh' ? '\u4E0B\u4E00\u5173 \u2192' : 'NEXT \u2192'}
          </button>
        </div>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', marginTop: 4, width: '100%', maxWidth: 480,
          background: 'rgba(15, 23, 42, 0.6)', borderRadius: 16, backdropFilter: 'blur(8px)',
        }}>
          <VirtualJoystick onDirectionChange={handleDirection} disabled={false} />
          <JumpButton onJumpDown={handleJumpDown} onJumpUp={handleJumpUp} disabled={false} />
        </div>
      )}
    </div>
  )
}
