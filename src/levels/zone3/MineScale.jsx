import { useState, useCallback, useRef, useEffect, useMemo } from 'react'

// ─── Web Audio ──────────────────────────────────────────────
let audioCtx = null
let audioUnlocked = false
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}
export function unlockAudio() {
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
function tone({ type = 'sine', freqStart, freqEnd, duration, gain = 0.12, delay = 0 }) {
  try {
    const ctx = getCtx()
    const t = ctx.currentTime + delay
    const osc = ctx.createOscillator(); const g = ctx.createGain()
    osc.connect(g); g.connect(ctx.destination)
    osc.type = type; osc.frequency.setValueAtTime(freqStart, t)
    if (freqEnd != null && freqEnd !== freqStart) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), t + duration)
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + duration)
    osc.start(t); osc.stop(t + duration + 0.02)
  } catch {}
}
const sfx = {
  pickaxe: () => { tone({ type: 'square', freqStart: 1600, freqEnd: 800, duration: 0.08, gain: 0.1 }); tone({ type: 'triangle', freqStart: 3200, freqEnd: 1800, duration: 0.06, gain: 0.08 }) },
  creak: () => { tone({ type: 'sawtooth', freqStart: 140, freqEnd: 70, duration: 0.35, gain: 0.1 }); tone({ type: 'sawtooth', freqStart: 200, freqEnd: 90, duration: 0.3, gain: 0.07, delay: 0.1 }) },
  clink: () => tone({ type: 'triangle', freqStart: 1800, freqEnd: 1400, duration: 0.05, gain: 0.04 }),
  grab: () => { tone({ type: 'square', freqStart: 400, freqEnd: 700, duration: 0.15, gain: 0.13 }); tone({ type: 'sawtooth', freqStart: 180, freqEnd: 400, duration: 0.3, gain: 0.08, delay: 0.12 }) },
  drop: () => { tone({ type: 'sine', freqStart: 380, freqEnd: 180, duration: 0.18, gain: 0.14 }); tone({ type: 'triangle', freqStart: 900, freqEnd: 500, duration: 0.1, gain: 0.08, delay: 0.02 }) },
  miss: () => { tone({ type: 'sawtooth', freqStart: 250, freqEnd: 120, duration: 0.2, gain: 0.14 }); tone({ type: 'triangle', freqStart: 400, freqEnd: 200, duration: 0.12, gain: 0.06, delay: 0.02 }) },
  craterFill: () => { tone({ type: 'sine', freqStart: 500, freqEnd: 250, duration: 0.15, gain: 0.1 }); tone({ type: 'triangle', freqStart: 800, freqEnd: 400, duration: 0.12, gain: 0.07, delay: 0.04 }) },
  balance: () => { [440, 554, 659].forEach((f, i) => tone({ type: 'sine', freqStart: f, freqEnd: f, duration: 0.4, gain: 0.1, delay: i * 0.04 })) },
  bagOpen: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone({ type: 'triangle', freqStart: f, freqEnd: f, duration: 0.35, gain: 0.13, delay: i * 0.07 })) },
  whoosh: () => tone({ type: 'sawtooth', freqStart: 900, freqEnd: 200, duration: 0.18, gain: 0.1 }),
  depositHit: () => { tone({ type: 'square', freqStart: 500, freqEnd: 260, duration: 0.1, gain: 0.09 }); tone({ type: 'triangle', freqStart: 1200, freqEnd: 600, duration: 0.08, gain: 0.06, delay: 0.02 }) },
  voidPop: () => { tone({ type: 'sawtooth', freqStart: 220, freqEnd: 100, duration: 0.15, gain: 0.12 }); tone({ type: 'sine', freqStart: 140, freqEnd: 70, duration: 0.2, gain: 0.08, delay: 0.05 }) },
  phaseAdvance: () => { [440, 587].forEach((f, i) => tone({ type: 'triangle', freqStart: f, freqEnd: f, duration: 0.2, gain: 0.08, delay: i * 0.08 })) },
  unwrap: () => { tone({ type: 'triangle', freqStart: 600, freqEnd: 1200, duration: 0.3, gain: 0.1 }) },
}

const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

// ─── Mine Background ────────────────────────────────────────
function MineBackground({ W, H }) {
  return (
    <g>
      <defs>
        <linearGradient id="mineSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a0f08" /><stop offset="100%" stopColor="#3d2410" />
        </linearGradient>
        <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD166" stopOpacity="0.9" /><stop offset="100%" stopColor="#F76B1C" stopOpacity="0" />
        </radialGradient>
        <pattern id="stoneWall" x="0" y="0" width="24" height="18" patternUnits="userSpaceOnUse">
          <rect width="24" height="18" fill="#3a2615" />
          <rect x="1" y="1" width="10" height="7" rx="1" fill="#4a3018" />
          <rect x="13" y="1" width="10" height="7" rx="1" fill="#453020" />
          <rect x="1" y="10" width="22" height="7" rx="1" fill="#3f2a18" />
        </pattern>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill="url(#mineSky)" />
      <rect x={0} y={0} width={W} height={44} fill="url(#stoneWall)" opacity={0.8} />
      <rect x={0} y={H - 36} width={W} height={36} fill="url(#stoneWall)" opacity={0.9} />
      <rect x={8} y={0} width={10} height={H} fill="#3d2410" />
      <rect x={W - 18} y={0} width={10} height={H} fill="#3d2410" />
      <rect x={0} y={H - 16} width={W} height={3} fill="#5a4830" />
      <rect x={0} y={H - 9} width={W} height={3} fill="#5a4830" />
      {[40, 120, 200, 280, 360].map((x) => (
        <rect key={x} x={x} y={H - 14} width={4} height={8} fill="#6b5838" />
      ))}
      {[{ x: 60 }, { x: W - 60 }].map(({ x }, i) => (
        <g key={i}>
          <line x1={x} y1={0} x2={x} y2={16} stroke="#2a1a10" strokeWidth={1.5} />
          <rect x={x - 6} y={16} width={12} height={7} rx={1} fill="#4a2f1a" stroke="#2a1a10" strokeWidth={1} />
          <circle cx={x} cy={19} r={2.5} fill="#FFD166">
            <animate attributeName="opacity" values="0.7;1;0.7" dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={x} cy={19} r={14} fill="url(#lanternGlow)" opacity={0.5}>
            <animate attributeName="r" values="11;15;11" dur={`${1.3 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </g>
  )
}

// ─── Gold Block ─────────────────────────────────────────────
function GoldBlock({ x, y, size = 16, opacity = 1 }) {
  const s = size
  return (
    <g transform={`translate(${x - s / 2}, ${y - s / 2})`} opacity={opacity}>
      <rect x={0} y={0} width={s} height={s} rx={2} fill="#FFD166" stroke="#B8770F" strokeWidth={1} />
      <rect x={1.5} y={1.5} width={s - 3} height={3} fill="#FFE099" opacity={0.7} />
      <rect x={s * 0.55} y={s * 0.55} width={s * 0.3} height={s * 0.3} fill="#B8770F" opacity={0.4} />
    </g>
  )
}

// ─── Void block (negative weight) ───────────────────────────
function VoidBlock({ x, y, size = 14 }) {
  const s = size
  return (
    <g transform={`translate(${x - s / 2}, ${y - s / 2})`}>
      <rect x={0} y={0} width={s} height={s} rx={2} fill="#4C1D95" stroke="#1E0740" strokeWidth={1} />
      <rect x={1.5} y={1.5} width={s - 3} height={2.5} fill="#7C3AED" opacity={0.6} />
      <text x={s / 2} y={s / 2 + 3} textAnchor="middle" fontSize={s - 4} fontWeight={900}
        fill="#C4B5FD" fontFamily="Nunito, sans-serif">−</text>
    </g>
  )
}

// ─── Falling block animation ────────────────────────────────
function FallingBlock({ startX, startY, endX, endY, duration = 500 }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let raf, start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      setProgress(t); if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf)
  }, [duration])
  const x = startX + (endX - startX) * progress
  const y = startY + (endY - startY) * (progress * progress)
  return (
    <g transform={`translate(${x}, ${y}) scale(${1 - progress * 0.3})`}>
      <GoldBlock x={0} y={0} size={15} />
    </g>
  )
}

// ─── X Bag ──────────────────────────────────────────────────
function XBag({ x, y, opened, deficit = 0, small = false, topCoins = 0, negative = false }) {
  const hungry = deficit > 0
  const scale = small ? 0.75 : 1
  const bodyColor = negative ? '#581C87' : '#8B4513'
  const strokeColor = negative ? '#2E1065' : '#4a2a10'
  const labelColor = negative ? '#E9D5FF' : '#FFD166'
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={18} rx={16} ry={3} fill="#000" opacity={0.4} />
      {!opened && (
        <g>
          <path
            d={hungry
              ? "M -14 -2 Q -16 -14 -10 -12 L 10 -12 Q 16 -14 14 -2 Q 14 16 0 18 Q -14 16 -14 -2 Z"
              : "M -14 -2 Q -16 -14 -8 -16 L 8 -16 Q 16 -14 14 -2 Q 14 16 0 18 Q -14 16 -14 -2 Z"}
            fill={bodyColor} stroke={strokeColor} strokeWidth={1.5} />
          {!hungry && (
            <>
              <rect x={-6} y={-18} width={12} height={5} rx={1} fill={strokeColor} stroke={strokeColor} strokeWidth={1} />
              <ellipse cx={0} cy={-18} rx={3} ry={2} fill="#d4a060" />
            </>
          )}
          {hungry && (
            <>
              <ellipse cx={0} cy={-12} rx={9} ry={3} fill="#1a0f08" />
              <g transform="translate(16, -14)">
                <circle r={8.5} fill="#DC2626" stroke="white" strokeWidth={1.5} />
                <text y={3} textAnchor="middle" fontSize={10} fontWeight={900} fill="white" fontFamily="Nunito, sans-serif">−{deficit}</text>
              </g>
            </>
          )}
          <text x={0} y={5} textAnchor="middle" fontSize={16} fontWeight={900}
            fill={labelColor} fontFamily="Nunito, sans-serif"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>x</text>
          {/* Coins stacked on top (bundled: x + C visual) */}
          {topCoins > 0 && (
            <g>
              {/* Glow halo below stack */}
              <ellipse cx={0} cy={-20} rx={10} ry={2} fill="#000" opacity={0.35} />
              {/* + symbol between bag and stack */}
              <text x={0} y={-20} textAnchor="middle" fontSize={10} fontWeight={900}
                fill="#FDE047" fontFamily="Nunito, sans-serif"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>+</text>
              {/* Stacked coins (bottom to top) */}
              {Array.from({ length: topCoins }).map((_, i) => (
                <g key={i} transform={`translate(0, ${-28 - i * 9})`}>
                  <rect x={-6} y={-4} width={12} height={8} rx={1.5} fill="#FFD166" stroke="#B8770F" strokeWidth={0.9} />
                  <rect x={-5} y={-3} width={10} height={2} fill="#FFE099" opacity={0.7} />
                </g>
              ))}
            </g>
          )}
          <circle cx={0} cy={0} r={20} fill={negative ? '#A78BFA' : '#FFD166'} opacity={0.15}>
            <animate attributeName="opacity" values="0.1;0.25;0.1" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
      {opened && (
        <g>
          <path d="M -14 -2 Q -16 -14 -8 -10 L 8 -10 Q 16 -14 14 -2 Q 14 16 0 18 Q -14 16 -14 -2 Z"
            fill="#5a2f10" stroke="#4a2a10" strokeWidth={1.5} />
          <circle cx={0} cy={-6} r={26} fill={negative ? '#A78BFA' : '#FFD166'} opacity={0.5}>
            <animate attributeName="r" values="10;30;24" dur="0.8s" fill="freeze" />
            <animate attributeName="opacity" values="0.8;0.3;0.5" dur="0.8s" fill="freeze" />
          </circle>
        </g>
      )}
    </g>
  )
}

// ─── Pan Dish ───────────────────────────────────────────────
function PanDish({ cx, cy }) {
  return (
    <g>
      <path d={`M ${cx - 42} ${cy} Q ${cx} ${cy + 18} ${cx + 42} ${cy} Z`} fill="#6a5028" stroke="#3a2a10" strokeWidth={1.5} />
      <path d={`M ${cx - 42} ${cy} Q ${cx} ${cy + 8} ${cx + 42} ${cy}`} fill="none" stroke="#8a6a38" strokeWidth={1} opacity={0.6} />
    </g>
  )
}

// ─── Storage Pile (typed items) ─────────────────────────────
function StoragePile({ cx, cy, items, label }) {
  const count = items.length
  if (count === 0) return null
  const positions = []
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / 3), col = i % 3
    const rowCount = Math.min(3, count - row * 3)
    positions.push({ x: cx + (col - (rowCount - 1) / 2) * 14, y: cy - row * 13, type: items[i] })
  }
  return (
    <g>
      <rect x={cx - 28} y={cy - 30} width={56} height={38} rx={4}
        fill="rgba(0,0,0,0.35)" stroke="rgba(253,224,71,0.4)" strokeWidth={1} strokeDasharray="3 2" />
      {positions.map((p, i) => (
        p.type === 'bag' ? (
          <g key={i} transform={`translate(${p.x}, ${p.y - 2})`}>
            <path d="M -5 0 Q -6 -5 -3 -6 L 3 -6 Q 6 -5 5 0 Q 5 6 0 7 Q -5 6 -5 0 Z"
              fill="#8B4513" stroke="#4a2a10" strokeWidth={0.8} />
            <rect x={-2} y={-7} width={4} height={2} rx={0.5} fill="#6b3510" />
            <text y={3} textAnchor="middle" fontSize={5} fontWeight={900} fill="#FFD166" fontFamily="Nunito, sans-serif">x</text>
          </g>
        ) : p.type === 'void' ? <VoidBlock key={i} x={p.x} y={p.y} size={10} />
          : <GoldBlock key={i} x={p.x} y={p.y} size={12} />
      ))}
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize={9} fontWeight={800}
        fill="#FCA5A5" fontFamily="Nunito, sans-serif" opacity={0.85}>{label} × {count}</text>
    </g>
  )
}

// ─── Reveal (positive: gold; negative: voids) ───────────────
function XReveal({ cx, cy, answer }) {
  const count = Math.abs(answer)
  const negative = answer < 0
  const perRow = Math.min(count, 5)
  const blocks = []
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / perRow), col = i % perRow
    const thisRowCount = Math.min(perRow, count - row * perRow)
    blocks.push({ x: cx + (col - (thisRowCount - 1) / 2) * 18, y: cy - row * 18 })
  }
  return (
    <g>
      <circle cx={cx} cy={cy - 8} r={30} fill={negative ? '#A78BFA' : '#FDE047'} opacity={0.2}>
        <animate attributeName="r" values="20;40;30" dur="1s" fill="freeze" />
      </circle>
      {blocks.map((b, i) => (
        <g key={i} opacity={0}>
          <animate attributeName="opacity" values="0;1" begin={`${i * 0.08}s`} dur="0.3s" fill="freeze" />
          {negative ? <VoidBlock x={b.x} y={b.y} size={15} /> : <GoldBlock x={b.x} y={b.y} size={15} />}
        </g>
      ))}
      <g opacity={0}>
        <animate attributeName="opacity" values="0;1" begin={`${count * 0.08 + 0.2}s`} dur="0.4s" fill="freeze" />
        <rect x={cx - 42} y={cy + 16} width={84} height={26} rx={6}
          fill="rgba(0,0,0,0.75)" stroke={negative ? '#A78BFA' : '#FDE047'} strokeWidth={1.5} />
        <text x={cx} y={cy + 33} textAnchor="middle" fontSize={17} fontWeight={900}
          fill={negative ? '#C4B5FD' : '#FDE047'} fontFamily="Nunito, sans-serif"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
          x = {answer}
        </text>
      </g>
    </g>
  )
}

// ─── Scale Assembly ─────────────────────────────────────────
function buildScale({ cx, cy, angle }) {
  const beamLength = 110
  const rad = (angle * Math.PI) / 180
  const leftEnd = { x: cx - beamLength * Math.cos(rad), y: cy - beamLength * Math.sin(rad) }
  const rightEnd = { x: cx + beamLength * Math.cos(rad), y: cy + beamLength * Math.sin(rad) }
  const chainLen = 30
  const leftPan = { x: leftEnd.x, y: leftEnd.y + chainLen }
  const rightPan = { x: rightEnd.x, y: rightEnd.y + chainLen }
  return { leftEnd, rightEnd, leftPan, rightPan, cx, cy }
}
function ScaleRender({ s }) {
  return (
    <g>
      <rect x={s.cx - 14} y={s.cy + 18} width={28} height={40} rx={3} fill="#7a5a30" stroke="#3a2a10" strokeWidth={1.5} />
      <rect x={s.cx - 26} y={s.cy + 54} width={52} height={8} rx={2} fill="#5a4020" stroke="#3a2a10" strokeWidth={1.5} />
      <rect x={s.cx - 2} y={s.cy - 4} width={4} height={24} fill="#4a3018" />
      <circle cx={s.cx} cy={s.cy} r={4.5} fill="#FFD166" stroke="#6a4a10" strokeWidth={1.5} />
      <line x1={s.leftEnd.x} y1={s.leftEnd.y} x2={s.rightEnd.x} y2={s.rightEnd.y}
        stroke="#7a5a30" strokeWidth={5} strokeLinecap="round" />
      <line x1={s.leftEnd.x} y1={s.leftEnd.y} x2={s.rightEnd.x} y2={s.rightEnd.y}
        stroke="#FFD166" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
      <line x1={s.leftEnd.x} y1={s.leftEnd.y} x2={s.leftPan.x} y2={s.leftPan.y} stroke="#4a3018" strokeWidth={1.5} strokeDasharray="2 2" />
      <line x1={s.rightEnd.x} y1={s.rightEnd.y} x2={s.rightPan.x} y2={s.rightPan.y} stroke="#4a3018" strokeWidth={1.5} strokeDasharray="2 2" />
      <PanDish cx={s.leftPan.x} cy={s.leftPan.y} />
      <PanDish cx={s.rightPan.x} cy={s.rightPan.y} />
    </g>
  )
}

// ─── Crane Head ─────────────────────────────────────────────
function CraneHead({ x, y, holding }) {
  const isBag = holding === 'bag'
  const isBlock = holding === 'block'
  const isVoid = holding === 'void'
  const groupInfo = holding && typeof holding === 'object' && holding.type === 'group' ? holding : null
  const hasAny = isBag || isBlock || isVoid || groupInfo
  return (
    <g>
      <line x1={x} y1={0} x2={x} y2={y} stroke="#2a1a08" strokeWidth={2} />
      {Array.from({ length: Math.max(1, Math.floor(y / 12)) }).map((_, i) => (
        <circle key={i} cx={x} cy={i * 12 + 6} r={1.7} fill="#8a7a5a" />
      ))}
      {!hasAny && (
        <g transform={`translate(${x}, ${y})`}>
          <path d="M -5 -2 L 5 -2 L 5 6 Q 5 11 0 11 Q -5 11 -5 6 Z" fill="#4a3a20" stroke="#2a1a08" strokeWidth={1.5} />
          <path d="M 0 6 Q 4 8 6 14 Q 4 10 0 12 Q -4 10 -6 14 Q -4 8 0 6" fill="#7a6a4a" stroke="#2a1a08" strokeWidth={1} />
        </g>
      )}
      {isBlock && (
        <g transform={`translate(${x}, ${y + 8})`}>
          <path d="M -9 -6 L -4 -4 M 9 -6 L 4 -4" stroke="#2a1a08" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <GoldBlock x={0} y={0} size={15} />
        </g>
      )}
      {isVoid && (
        <g transform={`translate(${x}, ${y + 8})`}>
          <path d="M -9 -6 L -4 -4 M 9 -6 L 4 -4" stroke="#2a1a08" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <VoidBlock x={0} y={0} size={14} />
        </g>
      )}
      {isBag && (
        <g transform={`translate(${x}, ${y + 10})`}>
          <path d="M -11 -6 L -4 -3 M 11 -6 L 4 -3" stroke="#2a1a08" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M -10 -2 Q -12 -10 -6 -12 L 6 -12 Q 12 -10 10 -2 Q 10 10 0 12 Q -10 10 -10 -2 Z"
            fill="#8B4513" stroke="#4a2a10" strokeWidth={1.2} />
          <rect x={-4} y={-14} width={8} height={3} rx={1} fill="#6b3510" />
          <text y={4} textAnchor="middle" fontSize={11} fontWeight={900} fill="#FFD166" fontFamily="Nunito, sans-serif">x</text>
        </g>
      )}
      {groupInfo && (
        <g transform={`translate(${x}, ${y + 8})`}>
          <path d="M -13 -6 L -6 -4 M 13 -6 L 6 -4" stroke="#2a1a08" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          {Array.from({ length: Math.min(groupInfo.size, 9) }).map((_, i) => {
            const cols = Math.min(3, groupInfo.size)
            const col = i % cols, row = Math.floor(i / cols)
            const rowCount = Math.min(cols, groupInfo.size - row * cols)
            return <GoldBlock key={i} x={(col - (rowCount - 1) / 2) * 9} y={-row * 8} size={10} />
          })}
        </g>
      )}
    </g>
  )
}

// ─── Main Engine ────────────────────────────────────────────
export default function MineScale({ task, taskKey, onSolve, onMistake }) {
  const W = 420, H = 320
  const CENTER_X = W / 2
  const PIVOT_Y = 180
  const CRANE_REST_Y = 70
  const LEFT_STORAGE_X = 58
  const RIGHT_STORAGE_X = W - 58
  const STORAGE_Y = 38

  // ── Normalize task to canonical form ──
  const norm = useMemo(() => {
    const answer = task.answer
    const bagUnitValue = task.left?.bagUnitValue ?? answer
    const phases = task.phases || [{
      autoPhase: task.autoPhase,
      mode: task.mode,
      groupSize: task.right?.groupSize,
    }]
    return {
      answer, bagUnitValue,
      initialLeft: {
        bagCount: task.left?.bagCount ?? 1,
        coins: task.left?.coins ?? 0,
        bagDeficit: task.left?.bagDeficit ?? 0,
        voids: task.left?.voids ?? 0,
        bundleSize: task.left?.bundleSize ?? 0,
      },
      initialRight: {
        bagCount: task.right?.bagCount ?? 0,
        coins: task.right?.coins ?? 0,
        voids: task.right?.voids ?? 0,
      },
      phases,
      targetTilt: task.targetTilt ?? 'balanced',
      isBundled: task.left?.isBundled ?? false,
    }
  }, [task])

  // ── State ──
  const [phase, setPhase] = useState('setup') // setup | auto | player | solved
  const phaseRef = useRef('setup'); useEffect(() => { phaseRef.current = phase }, [phase])
  const [phaseIdx, setPhaseIdx] = useState(0)
  const phaseIdxRef = useRef(0); useEffect(() => { phaseIdxRef.current = phaseIdx }, [phaseIdx])

  const [leftCoins, setLeftCoins] = useState(norm.initialLeft.coins)
  const [bagDeficit, setBagDeficit] = useState(norm.initialLeft.bagDeficit)
  const [bagCount, setBagCount] = useState(norm.initialLeft.bagCount)
  const [leftVoids, setLeftVoids] = useState(norm.initialLeft.voids)
  const [rightCoins, setRightCoins] = useState(norm.initialRight.coins)
  const [rightBagCount, setRightBagCount] = useState(norm.initialRight.bagCount)
  const [rightVoids, setRightVoids] = useState(norm.initialRight.voids)
  const [leftStorage, setLeftStorage] = useState([])
  const [rightStorage, setRightStorage] = useState([])
  const [bagOpened, setBagOpened] = useState(false)
  const [misses, setMisses] = useState(0)
  const [playerActions, setPlayerActions] = useState(0)
  const playerActionsRef = useRef(0); useEffect(() => { playerActionsRef.current = playerActions }, [playerActions])
  const [fallingBlocks, setFallingBlocks] = useState([])
  // leftBundleCoins[i] = number of coins still sitting ON TOP of bag i
  const [leftBundleCoins, setLeftBundleCoins] = useState(() => {
    if (norm.isBundled && norm.initialLeft.bundleSize > 0) {
      return Array(norm.initialLeft.bagCount).fill(norm.initialLeft.bundleSize)
    }
    return []
  })
  const fallingBlockIdRef = useRef(0)

  const currentPhase = norm.phases[phaseIdx] || norm.phases[norm.phases.length - 1]
  const currentMode = currentPhase?.mode || 'grab'
  const currentGroupSize = currentPhase?.groupSize ?? 1

  // Bundle total (coins still on bag tops) contributes to left weight
  const bundleTotal = leftBundleCoins.reduce((a, b) => a + b, 0)

  // ── Scale physics ──
  const leftWeight = bagCount * norm.bagUnitValue - bagDeficit + leftCoins + bundleTotal - leftVoids
  const rightWeight = rightBagCount * norm.bagUnitValue + rightCoins - rightVoids
  const imbalance = rightWeight - leftWeight
  const absImb = Math.abs(imbalance)
  const tiltScale = absImb > 6 ? 1.8 : 3
  const beamAngle = Math.max(-22, Math.min(22, imbalance * tiltScale))

  // ── Crane state (mirrored between ref & state) ──
  const craneRef = useRef({ x: CENTER_X, y: CRANE_REST_Y, holding: false })
  const [cranePose, setCranePose] = useState({ x: CENTER_X, y: CRANE_REST_Y, holding: false })
  const queueRef = useRef([])
  const swingStartRef = useRef(0)
  const activeAnimRef = useRef(null)

  // ── Reset on task change ──
  useEffect(() => {
    setPhase('setup'); setPhaseIdx(0); setPlayerActions(0)
    setLeftCoins(norm.initialLeft.coins); setBagDeficit(norm.initialLeft.bagDeficit)
    setBagCount(norm.initialLeft.bagCount); setLeftVoids(norm.initialLeft.voids)
    setRightCoins(norm.initialRight.coins); setRightBagCount(norm.initialRight.bagCount)
    setRightVoids(norm.initialRight.voids)
    setLeftStorage([]); setRightStorage([])
    setBagOpened(false); setMisses(0); setFallingBlocks([])
    setLeftBundleCoins(norm.isBundled && norm.initialLeft.bundleSize > 0
      ? Array(norm.initialLeft.bagCount).fill(norm.initialLeft.bundleSize)
      : [])
    craneRef.current = { x: CENTER_X, y: CRANE_REST_Y, holding: false }
    queueRef.current = []; activeAnimRef.current = null
  }, [taskKey, norm])

  // ── Animation loop ──
  useEffect(() => {
    let raf, lastClink = 0
    const loop = (now) => {
      const c = craneRef.current
      if (activeAnimRef.current) {
        const a = activeAnimRef.current
        const t = Math.min(1, (now - a.start) / a.duration)
        const e = easeInOut(t)
        if (a.fromX != null) c.x = a.fromX + (a.toX - a.fromX) * e
        if (a.fromY != null) c.y = a.fromY + (a.toY - a.fromY) * e
        if (t >= 1) { activeAnimRef.current = null; if (a.onDone) a.onDone() }
      }
      if (!activeAnimRef.current && queueRef.current.length > 0) {
        const step = queueRef.current.shift()
        runStep(step, now)
      }
      if (!activeAnimRef.current && queueRef.current.length === 0 && phaseRef.current === 'player') {
        const t = (now - swingStartRef.current) / 1000
        c.x = CENTER_X + 150 * Math.sin(t * 0.45 * Math.PI * 2)
        c.y = CRANE_REST_Y
        const p01 = ((t * 0.45) % 1 + 1) % 1
        if ((p01 < 0.02 || Math.abs(p01 - 0.5) < 0.02) && now - lastClink > 300) { sfx.clink(); lastClink = now }
      }
      setCranePose({ x: c.x, y: c.y, holding: c.holding })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const runStep = (step, now) => {
    const c = craneRef.current
    switch (step.type) {
      case 'moveX':
        activeAnimRef.current = { fromX: c.x, toX: step.x, start: now, duration: step.duration || 400, onDone: step.onDone }; break
      case 'moveY':
        activeAnimRef.current = { fromY: c.y, toY: step.y, start: now, duration: step.duration || 350, onDone: step.onDone }; break
      case 'moveXY':
        activeAnimRef.current = { fromX: c.x, toX: step.x, fromY: c.y, toY: step.y, start: now, duration: step.duration || 400, onDone: step.onDone }; break
      case 'setHolding':
        c.holding = step.holding; if (step.onDone) step.onDone(); break
      case 'fn':
        step.fn(); if (step.onDone) step.onDone(); break
      case 'wait':
        activeAnimRef.current = { start: now, duration: step.duration, onDone: step.onDone }; break
    }
  }

  const enqueue = (steps) => { queueRef.current.push(...steps) }

  // ── Setup → auto (after short delay) ──
  useEffect(() => {
    if (phase !== 'setup') return
    const t = setTimeout(() => setPhase('auto'), 500)
    return () => clearTimeout(t)
  }, [phase])

  // ── Run auto phase ──
  useEffect(() => {
    if (phase !== 'auto') return
    const cp = norm.phases[phaseIdxRef.current]
    const ap = cp.autoPhase
    if (!ap) { setPhase('player'); return }
    const scale0 = buildScale({ cx: CENTER_X, cy: PIVOT_Y, angle: beamAngle })
    const leftPanX = scale0.leftPan.x, leftPanY = scale0.leftPan.y
    const rightPanX = scale0.rightPan.x, rightPanY = scale0.rightPan.y

    const steps = []

    // Helper: deposit to left storage
    const depositLeft = (type) => {
      steps.push({ type: 'moveY', y: CRANE_REST_Y, duration: 320 })
      steps.push({ type: 'moveX', x: LEFT_STORAGE_X, duration: 320 })
      steps.push({ type: 'moveY', y: STORAGE_Y + 14, duration: 180 })
      steps.push({ type: 'fn', fn: () => {
        sfx.depositHit()
        setLeftStorage((arr) => [...arr, type])
      } })
      steps.push({ type: 'setHolding', holding: false })
      steps.push({ type: 'moveY', y: CRANE_REST_Y, duration: 180 })
    }
    const depositRight = (type) => {
      steps.push({ type: 'moveY', y: CRANE_REST_Y, duration: 320 })
      steps.push({ type: 'moveX', x: RIGHT_STORAGE_X, duration: 320 })
      steps.push({ type: 'moveY', y: STORAGE_Y + 14, duration: 180 })
      steps.push({ type: 'fn', fn: () => {
        sfx.depositHit()
        setRightStorage((arr) => [...arr, type])
      } })
      steps.push({ type: 'setHolding', holding: false })
      steps.push({ type: 'moveY', y: CRANE_REST_Y, duration: 180 })
    }

    if (ap.action === 'remove') {
      // Check if this task has bundled coins on bag tops — if so, grab from there
      const isBundledRemove = norm.isBundled && norm.initialLeft.bundleSize > 0
      // Simulate bundle state across steps to compute crane targets
      const simBundle = isBundledRemove
        ? Array(norm.initialLeft.bagCount).fill(norm.initialLeft.bundleSize)
        : null
      for (let i = 0; i < ap.count; i++) {
        if (isBundledRemove) {
          // Find rightmost bag with coins, target its topmost coin
          let targetBag = -1
          for (let b = simBundle.length - 1; b >= 0; b--) {
            if (simBundle[b] > 0) { targetBag = b; break }
          }
          if (targetBag < 0) break
          const bagX = leftPanX + (targetBag - (norm.initialLeft.bagCount - 1) / 2) * 28 - 22
          const bagY = leftPanY - 20
          // Topmost coin y: bag center + (-28 - (stack-1)*9)
          const stack = simBundle[targetBag]
          const coinTargetY = bagY - 28 - (stack - 1) * 9
          simBundle[targetBag] -= 1
          steps.push({ type: 'moveX', x: bagX, duration: 450 })
          steps.push({ type: 'moveY', y: coinTargetY - 6, duration: 320 })
          steps.push({ type: 'fn', fn: () => {
            sfx.pickaxe()
            setLeftBundleCoins((arr) => {
              const out = arr.slice()
              for (let b = out.length - 1; b >= 0; b--) {
                if (out[b] > 0) { out[b] -= 1; break }
              }
              return out
            })
          } })
          steps.push({ type: 'setHolding', holding: 'block' })
          depositLeft('block')
        } else {
          // Loose coins on pan
          const blockIdx = ap.count - 1 - i
          const coinX = leftPanX + (blockIdx - (ap.count - 1) / 2) * 18
          steps.push({ type: 'moveX', x: coinX, duration: 450 })
          steps.push({ type: 'moveY', y: leftPanY - 12, duration: 320 })
          steps.push({ type: 'fn', fn: () => { sfx.pickaxe(); setLeftCoins((n) => Math.max(0, n - 1)) } })
          steps.push({ type: 'setHolding', holding: 'block' })
          depositLeft('block')
        }
      }
    } else if (ap.action === 'removeBag') {
      for (let i = 0; i < ap.count; i++) {
        const remaining = norm.initialLeft.bagCount - i
        const bagX = leftPanX + ((remaining - 1) / 2) * 28 - 22
        const bagY = leftPanY - 20
        steps.push({ type: 'moveX', x: bagX, duration: 500 })
        steps.push({ type: 'moveY', y: bagY - 6, duration: 340 })
        steps.push({ type: 'fn', fn: () => { sfx.grab(); setBagCount((n) => Math.max(1, n - 1)) } })
        steps.push({ type: 'setHolding', holding: 'bag' })
        depositLeft('bag')
      }
    } else if (ap.action === 'addBag') {
      for (let i = 0; i < ap.count; i++) {
        const afterIdx = norm.initialLeft.bagCount + i + 1
        const slotX = leftPanX + (afterIdx - 1 - (afterIdx - 1) / 2) * 28 - 22
        // Fly from top-left corner to pan
        steps.push({ type: 'moveXY', x: LEFT_STORAGE_X, y: STORAGE_Y + 14, duration: 260 })
        steps.push({ type: 'setHolding', holding: 'bag' })
        steps.push({ type: 'moveY', y: CRANE_REST_Y, duration: 200 })
        steps.push({ type: 'moveX', x: slotX, duration: 380 })
        steps.push({ type: 'moveY', y: leftPanY - 20, duration: 300 })
        steps.push({ type: 'fn', fn: () => {
          sfx.depositHit()
          setBagCount((n) => n + 1)
        } })
        steps.push({ type: 'setHolding', holding: false })
        steps.push({ type: 'moveY', y: CRANE_REST_Y, duration: 200 })
      }
    } else if (ap.action === 'removeBagBothSides') {
      for (let i = 0; i < ap.count; i++) {
        // Remove one from left first
        const leftRemaining = norm.initialLeft.bagCount - i
        const leftBagX = leftPanX + ((leftRemaining - 1) / 2) * 28 - 22
        steps.push({ type: 'moveX', x: leftBagX, duration: 450 })
        steps.push({ type: 'moveY', y: leftPanY - 22, duration: 320 })
        steps.push({ type: 'fn', fn: () => { sfx.grab(); setBagCount((n) => Math.max(1, n - 1)) } })
        steps.push({ type: 'setHolding', holding: 'bag' })
        depositLeft('bag')
        // Then right
        const rightRemaining = norm.initialRight.bagCount - i
        const rightBagX = rightPanX - ((rightRemaining - 1) / 2) * 28
        steps.push({ type: 'moveX', x: rightBagX, duration: 450 })
        steps.push({ type: 'moveY', y: rightPanY - 22, duration: 320 })
        steps.push({ type: 'fn', fn: () => { sfx.grab(); setRightBagCount((n) => Math.max(0, n - 1)) } })
        steps.push({ type: 'setHolding', holding: 'bag' })
        depositRight('bag')
      }
    } else if (ap.action === 'fill') {
      const bagTop = leftPanY - 14
      for (let i = 0; i < ap.count; i++) {
        steps.push({ type: 'fn', fn: () => {
          const id = ++fallingBlockIdRef.current
          const startX = leftPanX + (Math.random() - 0.5) * 10
          setFallingBlocks((prev) => [...prev, { id, startX, startY: 8, endX: leftPanX, endY: bagTop, start: performance.now() }])
        } })
        steps.push({ type: 'wait', duration: 460 })
        steps.push({ type: 'fn', fn: () => {
          sfx.craterFill()
          setBagDeficit((d) => Math.max(0, d - 1))
          setFallingBlocks((prev) => prev.slice(1))
        } })
        steps.push({ type: 'wait', duration: 120 })
      }
    }

    // End-of-auto: creak then advance to player (or auto-skip if mode=none)
    steps.push({ type: 'fn', fn: () => sfx.creak() })
    steps.push({ type: 'wait', duration: 400 })
    steps.push({ type: 'fn', fn: () => {
      swingStartRef.current = performance.now()
      if (cp.mode === 'drop' || cp.mode === 'dropGroup') craneRef.current.holding = 'block'
      if (cp.mode === 'none') {
        // Auto-advance immediately
        advancePhaseOrSolve(true)
      } else {
        setPhase('player')
      }
    } })
    enqueue(steps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, phaseIdx])

  // ── Advance / solve ──
  const stateRef = useRef({})
  useEffect(() => {
    stateRef.current = { leftCoins, bagDeficit, bagCount, leftVoids, rightCoins, rightBagCount, rightVoids, misses, playerActions, bundleTotal }
  }, [leftCoins, bagDeficit, bagCount, leftVoids, rightCoins, rightBagCount, rightVoids, misses, playerActions, bundleTotal])

  const advancePhaseOrSolveRef = useRef(null)
  const advancePhaseOrSolve = (fromAutoOnlyPhase = false) => {
    const currentIdx = phaseIdxRef.current
    const totalPhases = norm.phases.length
    if (currentIdx < totalPhases - 1) {
      // Advance
      sfx.phaseAdvance()
      setPhaseIdx(currentIdx + 1)
      setPlayerActions(0)
      setPhase('auto')
    } else {
      // Final phase done → solve
      doSolve()
    }
  }
  advancePhaseOrSolveRef.current = advancePhaseOrSolve

  const doSolve = () => {
    setPhase('solved')
    craneRef.current.holding = false
    const steps = [
      { type: 'moveXY', x: CENTER_X, y: CRANE_REST_Y, duration: 400 },
      { type: 'wait', duration: 200 },
      { type: 'fn', fn: () => sfx.balance() },
      { type: 'wait', duration: 500 },
      { type: 'fn', fn: () => { sfx.bagOpen(); setBagOpened(true) } },
      { type: 'wait', duration: 1800 },
      { type: 'fn', fn: () => onSolve({ misses: stateRef.current.misses }) },
    ]
    enqueue(steps)
  }

  const checkPhaseComplete = () => {
    if (phaseRef.current !== 'player') return
    const cp = norm.phases[phaseIdxRef.current]
    if (!cp) return
    const expected = cp.autoPhase?.count ?? 0
    if (playerActionsRef.current >= expected) {
      advancePhaseOrSolve()
    }
  }

  // ── Tap to release crane ──
  const handleTap = useCallback(() => {
    unlockAudio()
    if (phaseRef.current !== 'player') return
    if (queueRef.current.length > 0 || activeAnimRef.current) return
    const scale0 = buildScale({ cx: CENTER_X, cy: PIVOT_Y, angle: beamAngle })
    const rightPanX = scale0.rightPan.x, rightPanY = scale0.rightPan.y
    const tapX = craneRef.current.x
    const mode = currentMode
    const gs = currentGroupSize

    const finalize = () => ({ type: 'fn', fn: () => {
      swingStartRef.current = performance.now()
      const cp = norm.phases[phaseIdxRef.current]
      const expected = cp?.autoPhase?.count ?? 0
      if (playerActionsRef.current < expected && (cp.mode === 'drop' || cp.mode === 'dropGroup')) {
        craneRef.current.holding = 'block'
      }
      checkPhaseComplete()
    } })

    if (mode === 'grabGroup') {
      const groupsRemaining = Math.ceil(rightCoins / gs)
      if (groupsRemaining < 1) return
      const spacing = 48
      const groupStart = rightPanX - (groupsRemaining - 1) * spacing / 2
      let bestIdx = -1, bestDist = Infinity
      for (let gi = 0; gi < groupsRemaining; gi++) {
        const gx = groupStart + gi * spacing
        const d = Math.abs(tapX - gx)
        if (d < bestDist) { bestDist = d; bestIdx = gi }
      }
      if (bestIdx >= 0 && bestDist <= 36) {
        const gx = groupStart + bestIdx * spacing
        enqueue([
          { type: 'moveX', x: gx, duration: 200 },
          { type: 'moveY', y: rightPanY - 4, duration: 320 },
          { type: 'fn', fn: () => { sfx.grab(); setRightCoins((n) => Math.max(0, n - gs)); setPlayerActions((a) => a + 1) } },
          { type: 'setHolding', holding: { type: 'group', size: gs } },
          { type: 'moveY', y: CRANE_REST_Y, duration: 340 },
          { type: 'moveX', x: RIGHT_STORAGE_X, duration: 340 },
          { type: 'moveY', y: STORAGE_Y + 18, duration: 200 },
          { type: 'fn', fn: () => { sfx.depositHit(); setRightStorage((arr) => [...arr, ...Array(gs).fill('block')]) } },
          { type: 'setHolding', holding: false },
          { type: 'moveY', y: CRANE_REST_Y, duration: 180 },
          finalize(),
        ])
      } else {
        enqueue([
          { type: 'moveY', y: rightPanY, duration: 320 },
          { type: 'fn', fn: () => { sfx.miss(); setMisses((m) => m + 1); onMistake() } },
          { type: 'wait', duration: 150 },
          { type: 'moveY', y: CRANE_REST_Y, duration: 300 },
          finalize(),
        ])
      }
      return
    }

    if (mode === 'dropGroup') {
      const distToPan = Math.abs(tapX - rightPanX)
      const panHit = distToPan <= 50
      if (panHit) {
        enqueue([
          { type: 'setHolding', holding: 'block' },
          { type: 'fn', fn: () => sfx.whoosh() },
          { type: 'moveY', y: rightPanY - 10, duration: 350 },
          { type: 'fn', fn: () => { sfx.drop(); setRightCoins((n) => n + gs); setPlayerActions((a) => a + 1) } },
          { type: 'setHolding', holding: false },
          { type: 'moveY', y: CRANE_REST_Y, duration: 250 },
          finalize(),
        ])
      } else {
        enqueue([
          { type: 'setHolding', holding: 'block' },
          { type: 'moveY', y: rightPanY + 30, duration: 380 },
          { type: 'fn', fn: () => { sfx.miss(); setMisses((m) => m + 1); onMistake() } },
          { type: 'setHolding', holding: false },
          { type: 'wait', duration: 150 },
          { type: 'moveY', y: CRANE_REST_Y, duration: 300 },
          finalize(),
        ])
      }
      return
    }

    const distToRightPan = Math.abs(tapX - rightPanX)
    const panHit = distToRightPan <= 50

    if (mode === 'grab') {
      if (panHit) {
        // If right coins exist, grab a coin; else if we still need to make right lighter (by spawning voids), spawn one
        if (rightCoins > 0) {
          const blockIdx = rightCoins - 1
          const perRow = rightCoins > 15 ? 5 : rightCoins > 8 ? 5 : 4
          const blockSize = rightCoins > 15 ? 11 : rightCoins > 10 ? 12 : 14
          const row = Math.floor(blockIdx / perRow)
          const col = blockIdx % perRow
          const rowCount = Math.min(perRow, rightCoins - row * perRow)
          const coinX = rightPanX + (col - (rowCount - 1) / 2) * (blockSize + 2)
          const coinY = rightPanY - 4 - row * (blockSize - 2)
          enqueue([
            { type: 'moveX', x: coinX, duration: 180 },
            { type: 'moveY', y: coinY, duration: 300 },
            { type: 'fn', fn: () => { sfx.grab(); setRightCoins((n) => Math.max(0, n - 1)); setPlayerActions((a) => a + 1) } },
            { type: 'setHolding', holding: 'block' },
            { type: 'moveY', y: CRANE_REST_Y, duration: 320 },
            { type: 'moveX', x: RIGHT_STORAGE_X, duration: 320 },
            { type: 'moveY', y: STORAGE_Y + 12, duration: 180 },
            { type: 'fn', fn: () => { sfx.depositHit(); setRightStorage((arr) => [...arr, 'block']) } },
            { type: 'setHolding', holding: false },
            { type: 'moveY', y: CRANE_REST_Y, duration: 180 },
            finalize(),
          ])
        } else {
          // Right is empty — grabbing from empty pan spawns a VOID (right gets lighter)
          enqueue([
            { type: 'moveY', y: rightPanY - 4, duration: 300 },
            { type: 'fn', fn: () => { sfx.voidPop(); setRightVoids((v) => v + 1); setPlayerActions((a) => a + 1) } },
            { type: 'wait', duration: 150 },
            { type: 'moveY', y: CRANE_REST_Y, duration: 300 },
            finalize(),
          ])
        }
      } else {
        enqueue([
          { type: 'moveY', y: rightPanY, duration: 320 },
          { type: 'fn', fn: () => { sfx.miss(); setMisses((m) => m + 1); onMistake() } },
          { type: 'wait', duration: 150 },
          { type: 'moveY', y: CRANE_REST_Y, duration: 300 },
          finalize(),
        ])
      }
      return
    }

    if (mode === 'drop') {
      if (panHit) {
        // If right has voids, drop cancels a void; else add a coin
        if (rightVoids > 0) {
          enqueue([
            { type: 'setHolding', holding: 'block' },
            { type: 'fn', fn: () => sfx.whoosh() },
            { type: 'moveY', y: rightPanY - 10, duration: 350 },
            { type: 'fn', fn: () => { sfx.voidPop(); setRightVoids((v) => Math.max(0, v - 1)); setPlayerActions((a) => a + 1) } },
            { type: 'setHolding', holding: false },
            { type: 'moveY', y: CRANE_REST_Y, duration: 250 },
            finalize(),
          ])
        } else {
          enqueue([
            { type: 'setHolding', holding: 'block' },
            { type: 'fn', fn: () => sfx.whoosh() },
            { type: 'moveY', y: rightPanY - 10, duration: 350 },
            { type: 'fn', fn: () => { sfx.drop(); setRightCoins((n) => n + 1); setPlayerActions((a) => a + 1) } },
            { type: 'setHolding', holding: false },
            { type: 'moveY', y: CRANE_REST_Y, duration: 250 },
            finalize(),
          ])
        }
      } else {
        enqueue([
          { type: 'setHolding', holding: 'block' },
          { type: 'moveY', y: rightPanY + 30, duration: 380 },
          { type: 'fn', fn: () => { sfx.miss(); setMisses((m) => m + 1); onMistake() } },
          { type: 'setHolding', holding: false },
          { type: 'wait', duration: 150 },
          { type: 'moveY', y: CRANE_REST_Y, duration: 300 },
          finalize(),
        ])
      }
      return
    }
  }, [beamAngle, currentMode, currentGroupSize, rightCoins, rightVoids, onMistake])

  // ── Render ──
  const scale = buildScale({ cx: CENTER_X, cy: PIVOT_Y, angle: beamAngle })
  const leftPan = scale.leftPan, rightPan = scale.rightPan

  // Bag positions (left)
  const bagPositions = []
  for (let i = 0; i < bagCount; i++) {
    bagPositions.push({
      x: leftPan.x + (i - (bagCount - 1) / 2) * 28 - 22,
      y: leftPan.y - 20,
    })
  }
  // Right bag positions
  const rightBagPositions = []
  for (let i = 0; i < rightBagCount; i++) {
    rightBagPositions.push({
      x: rightPan.x + (i - (rightBagCount - 1) / 2) * 28 - 22,
      y: rightPan.y - 20,
    })
  }
  // Left coins to the right of bags
  const leftCoinBaseX = leftPan.x + ((bagCount - 1) / 2) * 28 - 22 + 22
  const leftCoinPositions = []
  for (let i = 0; i < leftCoins; i++) {
    leftCoinPositions.push({ x: leftCoinBaseX + (i + 1) * 16, y: leftPan.y - 4 })
  }
  // Left voids (same area)
  const leftVoidPositions = []
  for (let i = 0; i < leftVoids; i++) {
    leftVoidPositions.push({ x: leftCoinBaseX + (i + 1) * 16 + leftCoins * 16, y: leftPan.y - 4 })
  }
  // Right coins positions (or grouped)
  const rightCoinPositions = []
  if (currentGroupSize > 1) {
    const groupCount = Math.ceil(rightCoins / currentGroupSize)
    const spacing = 48
    const groupStart = rightPan.x + (rightBagCount > 0 ? ((rightBagCount - 1) / 2) * 28 - 22 + 40 : 0) - (groupCount - 1) * spacing / 2
    for (let g = 0; g < groupCount; g++) {
      const cx = groupStart + g * spacing
      const inGroup = g === groupCount - 1 && rightCoins % currentGroupSize !== 0 ? rightCoins % currentGroupSize : currentGroupSize
      const colsPerRow = Math.min(3, inGroup)
      for (let i = 0; i < inGroup; i++) {
        const col = i % colsPerRow, row = Math.floor(i / colsPerRow)
        const rowCount = Math.min(colsPerRow, inGroup - row * colsPerRow)
        rightCoinPositions.push({
          x: cx + (col - (rowCount - 1) / 2) * 12,
          y: rightPan.y - 4 - row * 11,
          size: 10, groupIdx: g,
        })
      }
    }
  } else {
    const rightCoinBaseX = rightPan.x + (rightBagCount > 0 ? ((rightBagCount - 1) / 2) * 28 - 22 + 24 : 0)
    const perRow = rightCoins > 15 ? 5 : rightCoins > 8 ? 5 : 4
    const blockSize = rightCoins > 15 ? 11 : rightCoins > 10 ? 12 : 14
    for (let i = 0; i < rightCoins; i++) {
      const row = Math.floor(i / perRow), col = i % perRow
      const rowCount = Math.min(perRow, rightCoins - row * perRow)
      rightCoinPositions.push({
        x: rightCoinBaseX + (col - (rowCount - 1) / 2) * (blockSize + 2),
        y: rightPan.y - 4 - row * (blockSize - 2),
        size: blockSize,
      })
    }
  }
  // Right voids
  const rightVoidPositions = []
  for (let i = 0; i < rightVoids; i++) {
    const row = Math.floor(i / 4), col = i % 4
    const rowCount = Math.min(4, rightVoids - row * 4)
    rightVoidPositions.push({
      x: rightPan.x + (col - (rowCount - 1) / 2) * 16,
      y: rightPan.y - 8 - row * 14,
    })
  }

  const negativeAnswer = task.answer < 0

  return (
    <div style={{ position: 'relative', maxWidth: 480, width: '100%', margin: '0 auto' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{
          width: '100%', display: 'block', borderRadius: 14,
          boxShadow: '0 6px 24px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(251,191,36,0.2)',
          touchAction: 'none', cursor: phase === 'player' ? 'pointer' : 'default',
        }}
        onPointerDown={(e) => { unlockAudio(); e.preventDefault(); handleTap() }}
      >
        <MineBackground W={W} H={H} />
        <rect x={30} y={26} width={W - 60} height={4} fill="#3a2a10" />
        <rect x={30} y={26} width={W - 60} height={1} fill="#7a5a30" opacity={0.5} />
        <StoragePile cx={LEFT_STORAGE_X} cy={STORAGE_Y + 26} items={leftStorage} label="L" />
        <StoragePile cx={RIGHT_STORAGE_X} cy={STORAGE_Y + 26} items={rightStorage} label="R" />
        <ScaleRender s={scale} />

        {/* Left bags (each may have coins still stacked on top) */}
        {bagPositions.map((p, i) => (
          <XBag key={`lb${i}`} x={p.x} y={p.y}
            opened={bagOpened && i === 0}
            deficit={i === 0 ? bagDeficit : 0}
            small={bagCount > 2}
            topCoins={leftBundleCoins[i] || 0}
            negative={i === 0 && negativeAnswer}
          />
        ))}

        {/* Right bags */}
        {rightBagPositions.map((p, i) => (
          <XBag key={`rb${i}`} x={p.x} y={p.y} opened={false} deficit={0} small={rightBagCount > 2} />
        ))}

        {/* Falling blocks (per-block endpoints) */}
        {fallingBlocks.map((b) => (
          <FallingBlock key={b.id} startX={b.startX} startY={b.startY}
            endX={b.endX ?? (bagPositions[0]?.x || leftPan.x)}
            endY={b.endY ?? (leftPan.y - 18)} duration={460} />
        ))}

        {/* Reveal on bag open */}
        {bagOpened && (
          <XReveal cx={bagPositions[0]?.x || leftPan.x} cy={leftPan.y - 40} answer={task.answer} />
        )}

        {/* Left loose coins on pan */}
        {leftCoinPositions.map((p, i) => <GoldBlock key={`lc${i}`} x={p.x} y={p.y} size={14} />)}
        {/* Left voids */}
        {leftVoidPositions.map((p, i) => <VoidBlock key={`lv${i}`} x={p.x} y={p.y} size={14} />)}

        {/* Right coins / groups */}
        {rightCoinPositions.map((p, i) => (
          <GoldBlock key={`rc${i}`} x={p.x} y={p.y} size={p.size || 14} />
        ))}
        {/* Group boxes */}
        {currentGroupSize > 1 && (() => {
          const groupCount = Math.ceil(rightCoins / currentGroupSize)
          const spacing = 48
          const groupStart = rightPan.x - (groupCount - 1) * spacing / 2
          return Array.from({ length: groupCount }, (_, g) => (
            <rect key={`gbox${g}`}
              x={groupStart + g * spacing - 20} y={rightPan.y - 26}
              width={40} height={28} rx={4}
              fill="none" stroke="rgba(253,224,71,0.3)" strokeWidth={1} strokeDasharray="3 2" />
          ))
        })()}

        {/* Right voids */}
        {rightVoidPositions.map((p, i) => <VoidBlock key={`rv${i}`} x={p.x} y={p.y} size={13} />)}

        {/* Crane */}
        <CraneHead x={cranePose.x} y={cranePose.y} holding={cranePose.holding} />

        {/* Phase banner */}
        {phase === 'auto' && (
          <g>
            <rect x={CENTER_X - 105} y={H - 32} width={210} height={22} rx={11}
              fill="rgba(0,0,0,0.75)" stroke="#F59E0B" strokeWidth={1} />
            <text x={CENTER_X} y={H - 17} textAnchor="middle" fontSize={11} fontWeight={900}
              fill="#FDE047" fontFamily="Nunito, sans-serif">
              {currentPhase.autoPhase?.action === 'remove' && 'CRANE REMOVING FROM LEFT'}
              {currentPhase.autoPhase?.action === 'removeBag' && 'CRANE LIFTING BAGS AWAY'}
              {currentPhase.autoPhase?.action === 'addBag' && 'BAGS ADDED TO LEFT'}
              {currentPhase.autoPhase?.action === 'removeBagBothSides' && 'MIRROR: BAG FROM BOTH SIDES'}
              {currentPhase.autoPhase?.action === 'fill' && 'BLOCKS DROPPING INTO BAG'}
              {currentPhase.autoPhase?.action === 'unwrap' && 'UNWRAPPING BUNDLES'}
            </text>
          </g>
        )}
        {phase === 'player' && queueRef.current.length === 0 && !activeAnimRef.current && (
          <g>
            <rect x={CENTER_X - 120} y={H - 32} width={240} height={22} rx={11}
              fill="rgba(0,0,0,0.8)" stroke="#FDE047" strokeWidth={1.5}>
              <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
            </rect>
            <text x={CENTER_X} y={H - 17} textAnchor="middle" fontSize={11} fontWeight={900}
              fill="#FDE047" fontFamily="Nunito, sans-serif">
              {currentMode === 'grab' && 'TAP TO GRAB FROM RIGHT'}
              {currentMode === 'grabGroup' && 'TAP OVER A GROUP TO GRAB IT'}
              {currentMode === 'drop' && 'TAP TO DROP BLOCK ON RIGHT'}
              {currentMode === 'dropGroup' && `TAP TO DROP ${currentGroupSize} BLOCKS ON RIGHT`}
            </text>
          </g>
        )}
        {/* Phase progress (if multi-phase) */}
        {norm.phases.length > 1 && (
          <g>
            {norm.phases.map((_, i) => (
              <circle key={i} cx={W - 20 - i * 10} cy={H - 24} r={3.5}
                fill={i < phaseIdx ? '#FDE047' : i === phaseIdx ? '#F59E0B' : '#3F1F1F'}
                stroke={i === phaseIdx ? '#FDE047' : 'none'} strokeWidth={1} />
            ))}
          </g>
        )}
      </svg>
    </div>
  )
}
