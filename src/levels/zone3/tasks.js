// ─── Zone 3 Task Data ──────────────────────────────────────
// Canonical fields:
// {
//   equation, answer,
//   left:  { bagCount?, bagUnitValue?, coins, bagDeficit?, voids? }
//          bagCount defaults 1; bagUnitValue defaults answer; others default 0
//   right: { coins, bagCount?, groupSize?, voids? }
//   // Single-phase shortcut (legacy):
//   autoPhase: { action, count }, mode, groupSize
//   // OR multi-phase:
//   phases: [ { autoPhase, mode, groupSize?, subtitle? }, ... ]
//   targetTilt?: 'balanced' | 'leftHeavy' | 'rightHeavy'   // default 'balanced'
//   wordProblem?: { story, choices, correctIdx }          // only L12
//   explanation: { en, zh }
// }

export const BALANCE_BASICS = [
  {
    equation: 'x + 3 = 7', answer: 4,
    left: { coins: 3 }, right: { coins: 7 },
    autoPhase: { action: 'remove', count: 3 }, mode: 'grab',
    explanation: {
      en: 'The crane took 3 from the left. You grabbed 3 from the right. Inside the bag: x = 4.',
      zh: '钩子从左钩走 3 块,你从右也钩走 3 块。袋中数量 = x = 4。',
    },
  },
  {
    equation: 'x − 2 = 5', answer: 7,
    left: { coins: 0, bagDeficit: 2 }, right: { coins: 5 },
    autoPhase: { action: 'fill', count: 2 }, mode: 'drop',
    explanation: {
      en: 'Bag was short 2 — filled. Drop 2 on right. x = 7.',
      zh: '袋子差 2 块填上,右盘也加 2。x = 7。',
    },
  },
  {
    equation: 'x + 4 = 9', answer: 5,
    left: { coins: 4 }, right: { coins: 9 },
    autoPhase: { action: 'remove', count: 4 }, mode: 'grab',
    explanation: {
      en: 'Same rule both sides. x = 5.',
      zh: '两边同样操作。x = 5。',
    },
  },
  {
    equation: 'x − 3 = 4', answer: 7,
    left: { coins: 0, bagDeficit: 3 }, right: { coins: 4 },
    autoPhase: { action: 'fill', count: 3 }, mode: 'drop',
    explanation: {
      en: 'Fill → match on right. x = 7.',
      zh: '填袋 → 右盘跟上。x = 7。',
    },
  },
  {
    equation: 'x + 5 = 8', answer: 3,
    left: { coins: 5 }, right: { coins: 8 },
    autoPhase: { action: 'remove', count: 5 }, mode: 'grab',
    explanation: {
      en: "You've got it! x = 3.",
      zh: '你掌握了!x = 3。',
    },
  },
]

export const TWIN_MINES = [
  { equation: 'x + 6 = 11', answer: 5,
    left: { coins: 6 }, right: { coins: 11 },
    autoPhase: { action: 'remove', count: 6 }, mode: 'grab',
    explanation: { en: 'x = 5.', zh: 'x = 5。' } },
  { equation: 'x − 4 = 3', answer: 7,
    left: { coins: 0, bagDeficit: 4 }, right: { coins: 3 },
    autoPhase: { action: 'fill', count: 4 }, mode: 'drop',
    explanation: { en: 'x = 7.', zh: 'x = 7。' } },
  { equation: 'x + 7 = 10', answer: 3,
    left: { coins: 7 }, right: { coins: 10 },
    autoPhase: { action: 'remove', count: 7 }, mode: 'grab',
    explanation: { en: 'x = 3.', zh: 'x = 3。' } },
  { equation: 'x − 5 = 6', answer: 11,
    left: { coins: 0, bagDeficit: 5 }, right: { coins: 6 },
    autoPhase: { action: 'fill', count: 5 }, mode: 'drop',
    explanation: { en: 'x = 11.', zh: 'x = 11。' } },
  { equation: 'x + 9 = 12', answer: 3,
    left: { coins: 9 }, right: { coins: 12 },
    autoPhase: { action: 'remove', count: 9 }, mode: 'grab',
    explanation: { en: 'Final! x = 3.', zh: '终战!x = 3。' } },
]

export const HEAVY_LOAD = [
  { equation: 'x + 8 = 15', answer: 7,
    left: { coins: 8 }, right: { coins: 15 },
    autoPhase: { action: 'remove', count: 8 }, mode: 'grab',
    explanation: { en: 'x = 7.', zh: 'x = 7。' } },
  { equation: 'x − 6 = 11', answer: 17,
    left: { coins: 0, bagDeficit: 6 }, right: { coins: 11 },
    autoPhase: { action: 'fill', count: 6 }, mode: 'drop',
    explanation: { en: 'x = 17.', zh: 'x = 17。' } },
  { equation: 'x + 12 = 20', answer: 8,
    left: { coins: 12 }, right: { coins: 20 },
    autoPhase: { action: 'remove', count: 12 }, mode: 'grab',
    explanation: { en: 'x = 8.', zh: 'x = 8。' } },
  { equation: 'x − 4 = 16', answer: 20,
    left: { coins: 0, bagDeficit: 4 }, right: { coins: 16 },
    autoPhase: { action: 'fill', count: 4 }, mode: 'drop',
    explanation: { en: 'x = 20.', zh: 'x = 20。' } },
  { equation: 'x + 10 = 22', answer: 12,
    left: { coins: 10 }, right: { coins: 22 },
    autoPhase: { action: 'remove', count: 10 }, mode: 'grab',
    explanation: { en: 'x = 12.', zh: 'x = 12。' } },
]

export const MULTIPLIER_SHAFT = [
  { equation: '2x = 10', answer: 5,
    left: { bagCount: 2, coins: 0 }, right: { coins: 10, groupSize: 5 },
    autoPhase: { action: 'removeBag', count: 1 }, mode: 'grabGroup',
    explanation: { en: '2 bags = 10 blocks. Divide by 2 on both sides. x = 5.', zh: '2 袋 = 10 块。两边同除以 2。x = 5。' } },
  { equation: '3x = 12', answer: 4,
    left: { bagCount: 3, coins: 0 }, right: { coins: 12, groupSize: 4 },
    autoPhase: { action: 'removeBag', count: 2 }, mode: 'grabGroup',
    explanation: { en: 'x = 4.', zh: 'x = 4。' } },
  { equation: '2x = 14', answer: 7,
    left: { bagCount: 2, coins: 0 }, right: { coins: 14, groupSize: 7 },
    autoPhase: { action: 'removeBag', count: 1 }, mode: 'grabGroup',
    explanation: { en: 'x = 7.', zh: 'x = 7。' } },
  { equation: '4x = 8', answer: 2,
    left: { bagCount: 4, coins: 0 }, right: { coins: 8, groupSize: 2 },
    autoPhase: { action: 'removeBag', count: 3 }, mode: 'grabGroup',
    explanation: { en: 'x = 2.', zh: 'x = 2。' } },
  { equation: '3x = 18', answer: 6,
    left: { bagCount: 3, coins: 0 }, right: { coins: 18, groupSize: 6 },
    autoPhase: { action: 'removeBag', count: 2 }, mode: 'grabGroup',
    explanation: { en: 'x = 6.', zh: 'x = 6。' } },
]

// ─── L5 Division Pit ──  x/N = M  →  answer = N*M
// Start with 1 small bag (weight M). Auto adds N-1 more bags. Player drops groups.
export const DIVISION_PIT = [
  { equation: 'x/2 = 3', answer: 6,
    left: { bagCount: 1, bagUnitValue: 3, coins: 0 }, right: { coins: 3, groupSize: 3 },
    autoPhase: { action: 'addBag', count: 1 }, mode: 'dropGroup',
    explanation: { en: 'Multiply both sides by 2: left → 2 bags, right → 2 groups of 3. x = 6.', zh: '两边同乘 2:左变 2 袋,右变 2 组 3。x = 6。' } },
  { equation: 'x/3 = 2', answer: 6,
    left: { bagCount: 1, bagUnitValue: 2, coins: 0 }, right: { coins: 2, groupSize: 2 },
    autoPhase: { action: 'addBag', count: 2 }, mode: 'dropGroup',
    explanation: { en: 'x = 6.', zh: 'x = 6。' } },
  { equation: 'x/2 = 5', answer: 10,
    left: { bagCount: 1, bagUnitValue: 5, coins: 0 }, right: { coins: 5, groupSize: 5 },
    autoPhase: { action: 'addBag', count: 1 }, mode: 'dropGroup',
    explanation: { en: 'x = 10.', zh: 'x = 10。' } },
  { equation: 'x/4 = 3', answer: 12,
    left: { bagCount: 1, bagUnitValue: 3, coins: 0 }, right: { coins: 3, groupSize: 3 },
    autoPhase: { action: 'addBag', count: 3 }, mode: 'dropGroup',
    explanation: { en: 'x = 12. Four small bags = one full x.', zh: 'x = 12。四个小袋 = 一个完整 x。' } },
  { equation: 'x/3 = 4', answer: 12,
    left: { bagCount: 1, bagUnitValue: 4, coins: 0 }, right: { coins: 4, groupSize: 4 },
    autoPhase: { action: 'addBag', count: 2 }, mode: 'dropGroup',
    explanation: { en: 'x = 12.', zh: 'x = 12。' } },
]

// ─── L6 Two-Step Vault ──  Nx + C = M  (two phases)
// Phase 0: cancel constants. Phase 1: divide by N.
function twoStep({ equation, bagCount, constC, rhs, signConst = 1 }) {
  // leftWeight = bagCount * x + signConst * constC = rhs
  // answer x = (rhs - signConst*constC) / bagCount
  const answer = (rhs - signConst * constC) / bagCount
  const isAdd = signConst > 0
  const phase0 = isAdd
    ? { autoPhase: { action: 'remove', count: constC }, mode: 'grab' }
    : { autoPhase: { action: 'fill', count: constC }, mode: 'drop' }
  return {
    equation, answer,
    left: isAdd ? { bagCount, coins: constC } : { bagCount, coins: 0, bagDeficit: constC, bagUnitValue: answer },
    right: { coins: rhs },
    phases: [
      phase0,
      { autoPhase: { action: 'removeBag', count: bagCount - 1 }, mode: 'grabGroup', groupSize: answer },
    ],
    explanation: {
      en: `Two steps: cancel ${isAdd ? '+' : '−'}${constC}, then divide by ${bagCount}. x = ${answer}.`,
      zh: `两步:先消 ${isAdd ? '+' : '−'}${constC},再除以 ${bagCount}。x = ${answer}。`,
    },
  }
}
export const TWO_STEP_VAULT = [
  twoStep({ equation: '2x + 3 = 11', bagCount: 2, constC: 3, rhs: 11 }),
  twoStep({ equation: '3x − 2 = 10', bagCount: 3, constC: 2, rhs: 10, signConst: -1 }),
  twoStep({ equation: '2x + 5 = 13', bagCount: 2, constC: 5, rhs: 13 }),
  twoStep({ equation: '3x + 3 = 15', bagCount: 3, constC: 3, rhs: 15 }),
  twoStep({ equation: '2x − 4 = 8',  bagCount: 2, constC: 4, rhs: 8, signConst: -1 }),
]

// ─── L7 Negative Cave ──  answer is negative; use voids on right pan
// voids weight -1 each. Grabbing from empty pan spawns voids.
// Dropping on pan with voids cancels voids.
export const NEGATIVE_CAVE = [
  {
    equation: 'x + 5 = 2', answer: -3,
    left: { bagUnitValue: -3, coins: 5 }, right: { coins: 2 },
    autoPhase: { action: 'remove', count: 5 }, mode: 'grab',
    explanation: { en: "Right pan emptied, then voids appeared — x is negative. x = -3.", zh: '右盘掏空后继续会出现"虚空",说明 x 是负数。x = -3。' } },
  {
    equation: 'x − 3 = −5', answer: -2,
    left: { bagUnitValue: -2, coins: 0, bagDeficit: 3 }, right: { coins: 0, voids: 5 },
    autoPhase: { action: 'fill', count: 3 }, mode: 'drop',
    explanation: { en: 'Right started with 5 voids. Each drop cancels one. x = -2.', zh: '右盘起初有 5 个虚空,每次投一块消一个。x = -2。' } },
  {
    equation: 'x + 7 = 4', answer: -3,
    left: { bagUnitValue: -3, coins: 7 }, right: { coins: 4 },
    autoPhase: { action: 'remove', count: 7 }, mode: 'grab',
    explanation: { en: 'x = -3.', zh: 'x = -3。' } },
  {
    equation: 'x + 2 = −3', answer: -5,
    left: { bagUnitValue: -5, coins: 2 }, right: { coins: 0, voids: 3 },
    autoPhase: { action: 'remove', count: 2 }, mode: 'grab',
    explanation: { en: 'x = -5.', zh: 'x = -5。' } },
  {
    equation: 'x − 1 = −4', answer: -3,
    left: { bagUnitValue: -3, coins: 0, bagDeficit: 1 }, right: { coins: 0, voids: 4 },
    autoPhase: { action: 'fill', count: 1 }, mode: 'drop',
    explanation: { en: 'x = -3.', zh: 'x = -3。' } },
]

// ─── L8 Twin Weights ──  Nx + a = Mx + b  (bags on BOTH sides)
// Phase 0: remove bag from both sides (mirror). Phase 1: cancel consts. Phase 2: divide if needed.
function twinWeights({ equation, leftBags, leftConst, rightBags, rightConst }) {
  // leftBags*x + leftConst = rightBags*x + rightConst
  // (leftBags - rightBags)*x = rightConst - leftConst
  const netBags = leftBags - rightBags
  const netConst = rightConst - leftConst
  const answer = netConst / netBags
  const phases = []
  // Phase 0: mirror-remove rightBags bags from both sides (so right has 0 bags, left has netBags)
  if (rightBags > 0) {
    phases.push({ autoPhase: { action: 'removeBagBothSides', count: rightBags }, mode: 'none' })
  }
  // After P0: netBags bags on left + leftConst, 0 bags on right + rightConst
  // Phase 1: cancel leftConst from both sides (if positive: remove; if negative: fill — but we keep leftConst >=0)
  if (leftConst > 0) {
    phases.push({ autoPhase: { action: 'remove', count: leftConst }, mode: 'grab' })
  }
  // After P1: netBags bags on left, (rightConst - leftConst) on right = answer * netBags
  // Phase 2: divide (remove netBags-1 bags, grab groups)
  if (netBags > 1) {
    phases.push({ autoPhase: { action: 'removeBag', count: netBags - 1 }, mode: 'grabGroup', groupSize: answer })
  }
  return {
    equation, answer,
    left: { bagCount: leftBags, coins: leftConst },
    right: { bagCount: rightBags, coins: rightConst },
    phases,
    explanation: {
      en: `Same bag on both sides → cancel. Then cancel const. Then divide. x = ${answer}.`,
      zh: `两边都有袋 → 消掉。再消常数。最后分组。x = ${answer}。`,
    },
  }
}
export const TWIN_WEIGHTS = [
  twinWeights({ equation: '2x + 1 = x + 5',  leftBags: 2, leftConst: 1, rightBags: 1, rightConst: 5 }),   // x=4
  twinWeights({ equation: '3x + 2 = x + 8',  leftBags: 3, leftConst: 2, rightBags: 1, rightConst: 8 }),   // x=3
  twinWeights({ equation: '4x + 1 = 2x + 7', leftBags: 4, leftConst: 1, rightBags: 2, rightConst: 7 }),   // x=3
  twinWeights({ equation: '3x + 4 = x + 10', leftBags: 3, leftConst: 4, rightBags: 1, rightConst: 10 }),  // x=3
  twinWeights({ equation: '5x + 2 = 3x + 8', leftBags: 5, leftConst: 2, rightBags: 3, rightConst: 8 }),   // x=3
]

// ─── L9 Fraction Forge ──  x/N + C = M
// Phase 0: cancel C. Phase 1: multiply by N (addBag).
function fractionForge({ equation, divisor, constC, rhs, signConst = 1 }) {
  // x/divisor + signConst*constC = rhs  →  x/divisor = rhs - signConst*constC
  const unit = rhs - signConst * constC
  const answer = unit * divisor
  const isAdd = signConst > 0
  const phase0 = isAdd
    ? { autoPhase: { action: 'remove', count: constC }, mode: 'grab' }
    : { autoPhase: { action: 'fill', count: constC }, mode: 'drop' }
  return {
    equation, answer,
    left: isAdd
      ? { bagCount: 1, bagUnitValue: unit, coins: constC }
      : { bagCount: 1, bagUnitValue: unit, coins: 0, bagDeficit: constC },
    right: { coins: rhs },
    phases: [
      phase0,
      { autoPhase: { action: 'addBag', count: divisor - 1 }, mode: 'dropGroup', groupSize: unit },
    ],
    explanation: {
      en: `First cancel ${isAdd ? '+' : '−'}${constC}. Then multiply both sides by ${divisor}. x = ${answer}.`,
      zh: `先消 ${isAdd ? '+' : '−'}${constC},再两边同乘 ${divisor}。x = ${answer}。`,
    },
  }
}
export const FRACTION_FORGE = [
  fractionForge({ equation: 'x/2 + 1 = 4', divisor: 2, constC: 1, rhs: 4 }),   // x=6
  fractionForge({ equation: 'x/3 + 2 = 5', divisor: 3, constC: 2, rhs: 5 }),   // x=9
  fractionForge({ equation: 'x/2 − 1 = 3', divisor: 2, constC: 1, rhs: 3, signConst: -1 }), // x=8
  fractionForge({ equation: 'x/4 + 2 = 4', divisor: 4, constC: 2, rhs: 4 }),   // x=8
  fractionForge({ equation: 'x/3 − 1 = 3', divisor: 3, constC: 1, rhs: 3, signConst: -1 }), // x=12
]

// ─── L10 Distribution Blade ──  N(x + C) = M
// Phase 0: unwrap bundles (visual: N bundles → N bags + N*C coins). Weight preserved.
// Phase 1: cancel N*C constants. Phase 2: divide by N.
function distribution({ equation, n, c, rhs }) {
  // N(x + c) = rhs  →  x + c = rhs/N  →  x = rhs/N - c
  const answer = rhs / n - c
  const totalTopCoins = n * c
  return {
    equation, answer,
    // Coins live on top of each bag (c per bag). No loose coins on pan initially.
    left: { bagCount: n, coins: 0, isBundled: true, bundleSize: c },
    right: { coins: rhs },
    phases: [
      { autoPhase: { action: 'remove', count: totalTopCoins }, mode: 'grab' },
      { autoPhase: { action: 'removeBag', count: n - 1 }, mode: 'grabGroup', groupSize: answer },
    ],
    explanation: {
      en: `Crane grabs ${c} coins from each of ${n} bags → ${totalTopCoins} total. Then divide by ${n}. x = ${answer}.`,
      zh: `钩子从每个袋顶钩走 ${c} 块 — 共 ${totalTopCoins} 块。再除以 ${n}。x = ${answer}。`,
    },
  }
}
export const DISTRIBUTION_BLADE = [
  distribution({ equation: '2(x + 1) = 8', n: 2, c: 1, rhs: 8 }),    // x=3
  distribution({ equation: '3(x + 2) = 15', n: 3, c: 2, rhs: 15 }),  // x=3
  distribution({ equation: '2(x + 3) = 14', n: 2, c: 3, rhs: 14 }),  // x=4
  distribution({ equation: '3(x + 1) = 12', n: 3, c: 1, rhs: 12 }),  // x=3
  distribution({ equation: '4(x + 2) = 20', n: 4, c: 2, rhs: 20 }),  // x=3
]

// ─── L11 Inequality Edge ──  Nx + C > M  (keep scale tipped LEFT)
function inequality({ equation, n, c, rhs, sign = '>' }) {
  // For simplicity use a canonical x slightly above the threshold for display
  // Nx + c > rhs → x > (rhs - c)/n
  const threshold = (rhs - c) / n
  const displayAnswer = threshold + 1   // a valid x
  const wantLeft = sign === '>'
  const phases = []
  if (c > 0) phases.push({ autoPhase: { action: 'remove', count: c }, mode: 'grab' })
  if (n > 1) phases.push({ autoPhase: { action: 'removeBag', count: n - 1 }, mode: 'grabGroup', groupSize: threshold })
  return {
    equation, answer: displayAnswer,
    left: { bagCount: n, coins: c },
    right: { coins: rhs },
    phases,
    targetTilt: wantLeft ? 'leftHeavy' : 'rightHeavy',
    inequalityResult: `x ${sign} ${threshold}`,
    explanation: {
      en: `Keep scale tipped ${wantLeft ? 'LEFT' : 'RIGHT'}. Final: x ${sign} ${threshold}.`,
      zh: `保持天平往${wantLeft ? '左' : '右'}倾。结果:x ${sign} ${threshold}。`,
    },
  }
}
export const INEQUALITY_EDGE = [
  inequality({ equation: '2x + 1 > 7',  n: 2, c: 1, rhs: 7, sign: '>' }),   // x > 3
  inequality({ equation: '3x + 2 > 8',  n: 3, c: 2, rhs: 8, sign: '>' }),   // x > 2
  inequality({ equation: 'x + 5 > 9',   n: 1, c: 5, rhs: 9, sign: '>' }),   // x > 4
  inequality({ equation: '3x > 12',     n: 3, c: 0, rhs: 12, sign: '>' }),  // x > 4
  inequality({ equation: '2x + 3 > 11', n: 2, c: 3, rhs: 11, sign: '>' }),  // x > 4
]

// ─── L12 Word Warrior ──  word problem first, then solve
// Each task shows a story with multiple equation choices. Correct one runs the engine.
export const WORD_WARRIOR = [
  {
    wordProblem: {
      story: {
        en: 'A miner found x gold blocks Monday. Tuesday he found 3 more. Total 10. Which equation?',
        zh: '矿工周一挖了 x 块金矿,周二又挖 3 块,共 10 块。方程是?',
      },
      choices: ['x + 3 = 10', '3x = 10', 'x − 3 = 10'],
      correctIdx: 0,
    },
    equation: 'x + 3 = 10', answer: 7,
    left: { coins: 3 }, right: { coins: 10 },
    autoPhase: { action: 'remove', count: 3 }, mode: 'grab',
    explanation: { en: 'x = 7 blocks on Monday.', zh: '周一挖了 7 块。' },
  },
  {
    wordProblem: {
      story: {
        en: 'Twice yesterday\'s haul equals 16. Which equation?',
        zh: '昨天挖的金矿翻倍 = 16。方程是?',
      },
      choices: ['2x = 16', 'x + 2 = 16', 'x − 2 = 16'],
      correctIdx: 0,
    },
    equation: '2x = 16', answer: 8,
    left: { bagCount: 2, coins: 0 }, right: { coins: 16, groupSize: 8 },
    autoPhase: { action: 'removeBag', count: 1 }, mode: 'grabGroup',
    explanation: { en: 'x = 8.', zh: 'x = 8。' },
  },
  {
    wordProblem: {
      story: {
        en: '3 equal bags + 4 loose blocks = 16 blocks total. Which equation?',
        zh: '3 个等量袋子 + 4 块 = 共 16 块。方程是?',
      },
      choices: ['3x + 4 = 16', 'x + 4 = 16', '4x = 16'],
      correctIdx: 0,
    },
    ...twoStep({ equation: '3x + 4 = 16', bagCount: 3, constC: 4, rhs: 16 }),
  },
  {
    wordProblem: {
      story: {
        en: 'Half my stock plus 1 equals 6. Which equation?',
        zh: '我的库存一半再加 1 = 6。方程是?',
      },
      choices: ['x/2 + 1 = 6', 'x + 2 = 6', '2x + 1 = 6'],
      correctIdx: 0,
    },
    ...fractionForge({ equation: 'x/2 + 1 = 6', divisor: 2, constC: 1, rhs: 6 }),
  },
  {
    wordProblem: {
      story: {
        en: 'Twice (x+3) equals 14. Which equation?',
        zh: '两倍的 (x+3) 等于 14。方程是?',
      },
      choices: ['2(x + 3) = 14', '2x + 3 = 14', 'x + 6 = 14'],
      correctIdx: 0,
    },
    ...distribution({ equation: '2(x + 3) = 14', n: 2, c: 3, rhs: 14 }),
  },
]

// ─── Boss: Equation Colossus ──  3 phases chained with HP
// Each "task" here = one boss phase. Level has 3 tasks total.
export const EQUATION_COLOSSUS = [
  { ...twoStep({ equation: '4x − 5 = 11', bagCount: 4, constC: 5, rhs: 11, signConst: -1 }),
    bossPhase: 1,
    explanation: {
      en: 'Phase 1 complete — Colossus weakened! x = 4.',
      zh: '阶段 1 完成 — 巨像受创!x = 4。',
    },
  },
  { ...distribution({ equation: '3(x + 2) = 15', n: 3, c: 2, rhs: 15 }),
    bossPhase: 2,
    explanation: {
      en: 'Phase 2 complete — Colossus cracks! x = 3.',
      zh: '阶段 2 完成 — 巨像开裂!x = 3。',
    },
  },
  { ...twinWeights({ equation: '5x + 2 = 2x + 8', leftBags: 5, leftConst: 2, rightBags: 2, rightConst: 8 }),
    bossPhase: 3,
    explanation: {
      en: 'VICTORY! Colossus defeated! Equal Eve is free. x = 2.',
      zh: '胜利!巨像败北!平等夏娃重获自由。x = 2。',
    },
  },
]
