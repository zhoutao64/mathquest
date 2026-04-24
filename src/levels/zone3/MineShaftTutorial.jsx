// Opening tutorial used by Balance Basics (L1). Other Zone 3 levels skip it.
export default function MineShaftTutorial({ lang, onClose }) {
  const strings = lang === 'zh' ? {
    title: '\u77FF\u4E95\u5929\u5E73',
    sub: '\u89C4\u5219\uFF1A\u5DE6\u8FB9\u53D1\u751F\u7684\u4E8B\uFF0C\u53F3\u8FB9\u4E5F\u8981\u53D1\u751F\u4E00\u904D',
    step1Title: '\u81EA\u52A8\u9636\u6BB5',
    step1: '\u77FF\u8F66\u4ECE\u5DE6\u76D8\u642C\u8D70\u91D1\u77FF\uFF0C\u6216\u8005\u91D1\u77FF\u4ECE\u4E0A\u9762\u6389\u4E0B\u586B\u5751\u3002\u5929\u5E73\u5931\u8861\uFF01',
    step2Title: '\u8F6E\u5230\u4F60',
    step2: '\u8D77\u91CD\u673A\u5728\u5929\u82B1\u677F\u6765\u56DE\u6447\uFF0C\u70B9\u5C4F\u5E55 = \u91CA\u653E\u3002\u9488\u5BF9\u53F3\u76D8\u8FDB\u884C\u540C\u6837\u7684\u64CD\u4F5C\u3002',
    step3Title: '\u63ED\u6653',
    step3: '\u5E73\u8861\u6062\u590D \u2192 \u5DE6\u76D8\u888B\u5B50\u5F00\u542F \u2192 \u91CC\u9762\u7684\u91D1\u77FF\u6570\u91CF\u5C31\u662F x',
    ready: '\u5F00\u59CB\uFF01',
  } : {
    title: 'MINE SHAFT BALANCE',
    sub: 'RULE: Whatever happens on the left, must also happen on the right',
    step1Title: 'AUTO-PHASE',
    step1: "The crane removes blocks from the left pan, or blocks drop to fill the bag. Scale tips!",
    step2Title: 'YOUR TURN',
    step2: 'Crane swings overhead. Tap screen = release. Do the same to the right pan.',
    step3Title: 'THE REVEAL',
    step3: 'Balance restored → bag on the left opens → the gold inside is x',
    ready: 'START!',
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15,8,5,0.93)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, backdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 380, width: '100%',
          background: 'linear-gradient(135deg, #3D2410, #1C1008)',
          border: '2px solid #F59E0B',
          borderRadius: 20, padding: '22px',
          boxShadow: '0 20px 60px rgba(251,191,36,0.3), 0 0 0 4px rgba(251,191,36,0.08)',
          color: '#FEF3C7',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 34 }}>{'\u26CF\uFE0F\u2696\uFE0F'}</div>
          <h3 style={{
            fontSize: 18, fontWeight: 900, color: '#FDE047',
            margin: '6px 0 4px', letterSpacing: 1.5,
          }}>{strings.title}</h3>
          <div style={{ fontSize: 12, color: '#FCA5A5', fontWeight: 700, lineHeight: 1.4 }}>
            {strings.sub}
          </div>
        </div>

        <Step n={1} title={strings.step1Title} body={strings.step1} demo={<DemoAutoPhase />} />
        <Step n={2} title={strings.step2Title} body={strings.step2} demo={<DemoCrane />} />
        <Step n={3} title={strings.step3Title} body={strings.step3} demo={<DemoReveal />} />

        <button
          onClick={onClose}
          style={{
            width: '100%', marginTop: 14, padding: '12px 24px',
            background: 'linear-gradient(135deg, #F59E0B, #DC2626)',
            color: 'white', border: '2px solid rgba(255,255,255,0.25)',
            borderRadius: 12, fontSize: 15, fontWeight: 900, cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(220,38,38,0.5)',
            fontFamily: 'Nunito, sans-serif', letterSpacing: 1.5,
          }}
        >
          {strings.ready}
        </button>
      </div>
    </div>
  )
}

function Step({ n, title, body, demo }) {
  return (
    <div style={{
      display: 'flex', gap: 12, alignItems: 'flex-start',
      padding: '10px 0', borderBottom: '1px solid rgba(251,191,36,0.18)',
    }}>
      <div style={{
        width: 26, height: 26, flexShrink: 0, borderRadius: '50%',
        background: 'linear-gradient(135deg, #F59E0B, #DC2626)',
        color: 'white', fontWeight: 900, fontSize: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{n}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#FDE047', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 11, color: '#FCA5A5', lineHeight: 1.4 }}>{body}</div>
      </div>
      <div style={{ flexShrink: 0, width: 60 }}>{demo}</div>
    </div>
  )
}

function DemoAutoPhase() {
  return (
    <svg width={60} height={40} viewBox="0 0 60 40">
      <rect x={0} y={34} width={60} height={3} fill="#4a3018" />
      <g>
        <line x1={10} y1={16} x2={50} y2={24} stroke="#7a5a30" strokeWidth={2} strokeLinecap="round">
          <animate attributeName="y2" values="16;24;24;16" keyTimes="0;0.5;0.8;1" dur="2s" repeatCount="indefinite" />
          <animate attributeName="y1" values="16;8;8;16" keyTimes="0;0.5;0.8;1" dur="2s" repeatCount="indefinite" />
        </line>
        <rect x={7} y={8} width={6} height={6} rx={1} fill="#FFD166" stroke="#B8770F" strokeWidth={0.5}>
          <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.3;0.4;1" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x={47} y={16} width={6} height={6} rx={1} fill="#FFD166" stroke="#B8770F" strokeWidth={0.5}>
          <animate attributeName="y" values="16;24;24;16" keyTimes="0;0.5;0.8;1" dur="2s" repeatCount="indefinite" />
        </rect>
        <circle cx={30} cy={20} r={2} fill="#FFD166" />
      </g>
    </svg>
  )
}

function DemoCrane() {
  return (
    <svg width={60} height={40} viewBox="0 0 60 40">
      <line x1={5} y1={4} x2={55} y2={4} stroke="#4a3018" strokeWidth={1.5} />
      <line stroke="#4a3018" strokeWidth={1}>
        <animate attributeName="x1" values="15;45;15" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="x2" values="15;45;15" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="y1" values="4;4;4" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="y2" values="20;20;20" dur="1.5s" repeatCount="indefinite" />
      </line>
      <circle r={3} fill="#7a6a4a" stroke="#2a1a08" strokeWidth={0.5}>
        <animate attributeName="cx" values="15;45;15" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="cy" values="20;20;20" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <line x1={10} y1={32} x2={50} y2={32} stroke="#7a5a30" strokeWidth={1.5} />
      <circle cx={30} cy={32} r={1.5} fill="#FFD166" />
    </svg>
  )
}

function DemoReveal() {
  return (
    <svg width={60} height={40} viewBox="0 0 60 40">
      <path d="M 14 14 Q 12 6 20 4 L 40 4 Q 48 6 46 14 Q 46 26 30 28 Q 14 26 14 14 Z"
        fill="#8B4513" stroke="#4a2a10" strokeWidth={1}>
        <animate attributeName="opacity" values="1;1;0.3;0.3" keyTimes="0;0.3;0.5;1" dur="2s" repeatCount="indefinite" />
      </path>
      <text x={30} y={20} textAnchor="middle" fontSize={11} fontWeight={900} fill="#FFD166" fontFamily="Nunito, sans-serif">
        <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.3;0.5;1" dur="2s" repeatCount="indefinite" />
        x
      </text>
      <text x={30} y={22} textAnchor="middle" fontSize={16} fontWeight={900} fill="#FDE047" fontFamily="Nunito, sans-serif">
        <animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.5;0.6;1" dur="2s" repeatCount="indefinite" />
        4
      </text>
      <circle cx={12} cy={14} r={1.5} fill="#FDE047">
        <animate attributeName="opacity" values="0;0;1;0" keyTimes="0;0.5;0.7;1" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={48} cy={14} r={1.5} fill="#FDE047">
        <animate attributeName="opacity" values="0;0;1;0" keyTimes="0;0.5;0.8;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
