// ─── Zone 2: Ratio Lab — Level Definitions ──────────────────

export const ZONE2_LEVELS = [
  { id: 1, component: 'RatioRecon', icon: '\uD83C\uDFF9', color: '#A78BFA', xpReward: 50, cardId: 'ratio_basics' },
  { id: 2, component: 'EquivalentElixir', icon: '\u2697\uFE0F', color: '#60A5FA', xpReward: 50, cardId: 'equivalent_ratios' },
  { id: 3, component: 'SimplifySerum', icon: '\uD83E\uDDEA', color: '#4ECDC4', xpReward: 55, cardId: 'simplify_ratios' },
  { id: 4, component: 'RecipeTable', icon: '\uD83D\uDCCB', color: '#F472B6', xpReward: 55, cardId: 'ratio_tables' },
  { id: 5, component: 'UnitBrew', icon: '\uD83E\uDDF4', color: '#FFE66D', xpReward: 60, cardId: 'unit_rate' },
  { id: 6, component: 'PotionRace', icon: '\uD83C\uDFC1', color: '#FF6B6B', xpReward: 60, cardId: 'comparing_rates' },
  { id: 7, component: 'ProportionGuard', icon: '\uD83D\uDEE1\uFE0F', color: '#34D399', xpReward: 65, cardId: 'proportions' },
  { id: 8, component: 'CrossMix', icon: '\u2694\uFE0F', color: '#F59E0B', xpReward: 65, cardId: 'solving_proportions' },
  { id: 9, component: 'BlueprintShot', icon: '\uD83D\uDDFA\uFE0F', color: '#818CF8', xpReward: 70, cardId: 'scale_drawings' },
  { id: 10, component: 'PercentPotion', icon: '\uD83D\uDCCA', color: '#EC4899', xpReward: 70, cardId: 'percent_ratio' },
  { id: 11, component: 'ConversionCauldron', icon: '\uD83E\uDD2F', color: '#14B8A6', xpReward: 75, cardId: 'frac_dec_pct' },
  { id: 12, component: 'GraphGrinder', icon: '\uD83D\uDCC8', color: '#8B5CF6', xpReward: 80, cardId: 'proportional_graphs' },
]

export const ZONE2_BOSS = {
  id: 'boss',
  component: 'ChimeraAmalgam',
  icon: '\uD83D\uDC32',
  color: '#FF6B6B',
  xpReward: 200,
  cardId: 'ratio_mastery',
}

export const ZONE2_INFO = {
  id: 'zone2',
  name: 'Ratio Lab',
  icon: '\u2697\uFE0F',
  color: '#A78BFA',
  bgGradient: 'linear-gradient(135deg, #EDE9FE 0%, #C4B5FD 100%)',
}
