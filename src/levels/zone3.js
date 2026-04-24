// ─── Zone 3: Equation Arena — Level Definitions ────────────

export const ZONE3_LEVELS = [
  { id: 1, component: 'BalanceBasics', icon: '\u2696\uFE0F', color: '#FF6B6B', xpReward: 50, cardId: 'one_step_equations' },
  { id: 2, component: 'TwinMines', icon: '\u26CF\uFE0F', color: '#F59E0B', xpReward: 55, cardId: 'mixed_one_step' },
  { id: 3, component: 'HeavyLoad', icon: '\uD83D\uDE9B', color: '#F97316', xpReward: 60, cardId: 'larger_equations' },
  { id: 4, component: 'MultiplierShaft', icon: '\u2715', color: '#EAB308', xpReward: 65, cardId: 'multiplication_equations' },
  { id: 5, component: 'DivisionPit', icon: '\u2797', color: '#FBBF24', xpReward: 70, cardId: 'division_equations' },
  { id: 6, component: 'TwoStepVault', icon: '\uD83D\uDD12', color: '#818CF8', xpReward: 75, cardId: 'two_step_equations' },
  { id: 7, component: 'NegativeCave', icon: '\uD83C\uDF1A', color: '#7C3AED', xpReward: 80, cardId: 'negative_solutions' },
  { id: 8, component: 'TwinWeights', icon: '\u2696\uFE0F', color: '#10B981', xpReward: 85, cardId: 'variables_both_sides' },
  { id: 9, component: 'FractionForge', icon: '\uD83D\uDD28', color: '#06B6D4', xpReward: 90, cardId: 'fraction_equations' },
  { id: 10, component: 'DistributionBlade', icon: '\u2694\uFE0F', color: '#EF4444', xpReward: 95, cardId: 'distribution' },
  { id: 11, component: 'InequalityEdge', icon: '\u226B', color: '#EC4899', xpReward: 100, cardId: 'inequalities' },
  { id: 12, component: 'WordWarrior', icon: '\uD83D\uDCD6', color: '#8B5CF6', xpReward: 110, cardId: 'word_problems' },
]

export const ZONE3_BOSS = {
  id: 'boss',
  component: 'EquationColossus',
  icon: '\uD83D\uDDFF',
  color: '#7C2D12',
  xpReward: 250,
  cardId: 'equation_mastery',
}

export const ZONE3_INFO = {
  id: 'zone3',
  name: 'Equation Arena',
  icon: '\u2694\uFE0F',
  color: '#FF6B6B',
  bgGradient: 'linear-gradient(135deg, #FEE2E2 0%, #FCA5A5 100%)',
}
