import type { TrimTier } from '../types'

// Normalized trim ladder so you don't have to memorize each brand's
// nomenclature. This is an APPROXIMATE equipment-level mapping, not an
// exact equivalence — the raw trim is always preserved on each car and
// shown alongside the tier.

export const TIER_LABELS: Record<TrimTier, string> = {
  1: 'Base',
  2: 'Mid',
  3: 'Upper',
  4: 'Top',
}

export function tierLabel(tier: TrimTier): string {
  return TIER_LABELS[tier]
}

/** Human-readable mapping shown in the methodology / notes section. */
export const TIER_EXPLAINER: { tier: TrimTier; label: string; examples: string }[] = [
  { tier: 1, label: 'Base', examples: 'Toyota L / LE · Honda LX · Subaru base / Solterra Premium · Tesla RWD · Niro EV Wind' },
  { tier: 2, label: 'Mid', examples: 'Toyota XLE · Honda EX / EX-L / Sport · Subaru Premium(+) · Civic Sport Hybrid' },
  { tier: 3, label: 'Upper', examples: 'Honda Touring / Sport-L · Civic Sport Touring · Tesla Long Range' },
  { tier: 4, label: 'Top', examples: 'Limited / Platinum / Performance trims' },
]
