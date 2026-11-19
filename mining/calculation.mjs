// NOXON mining math — standalone port of the production accrual logic.
// Same constants, same formulas. Pure functions, zero dependencies.
// The live app runs this exact math server-side, lazily, once per minute.
//
// Rules:
// - Base rate: 5,000 NOX per hashrate per day, paced evenly per minute.
// - Daily cap per source: 50,000 x hashrate / 10 (= hashrate x 5,000),
//   so a rig running a full day earns exactly its cap. The free rig and
//   each device are capped separately, per source, never shared.
// - Lifetime cap per device: a fixed NOX amount per tier. A device stops
//   earning once it has paid its lifetime cap, even inside its 180 days.
// - Caps are ceilings, not promised earnings.

export const BASE_NOX_PER_HASHRATE_PER_DAY = 5000
export const MINUTES_PER_DAY = 1440
export const DEVICE_TERM_DAYS = 180
export const MAX_UNITS_PER_TIER = 10

export const FREE_RIG = {
  id: 'free',
  name: 'Free Rig',
  hashrate: 10,
  dailyCapNox: 50000,
  // No lifetime cap on the free rig.
  lifetimeCapNox: null,
}

// priceEth, hashrate, dailyCapNox and lifetimeCapNox are the catalog
// values. dailyCapNox always equals hashrate x 5,000 by construction.
export const DEVICE_CATALOG = [
  { id: 'nano-s1', name: 'NOX-NANO S1', priceEth: 0.0006, hashrate: 50, dailyCapNox: 250000, lifetimeCapNox: 81000 },
  { id: 'pulse-s2', name: 'NOX-PULSE S2', priceEth: 0.0018, hashrate: 165, dailyCapNox: 825000, lifetimeCapNox: 243000 },
  { id: 'blade-x3', name: 'NOX-BLADE X3', priceEth: 0.005, hashrate: 480, dailyCapNox: 2400000, lifetimeCapNox: 675000 },
  { id: 'core-c5', name: 'NOX-CORE C5', priceEth: 0.015, hashrate: 1500, dailyCapNox: 7500000, lifetimeCapNox: 2025000 },
  { id: 'titan-t7', name: 'NOX-TITAN T7', priceEth: 0.045, hashrate: 4800, dailyCapNox: 24000000, lifetimeCapNox: 6075000 },
  { id: 'quantum-q9', name: 'NOX-QUANTUM Q9', priceEth: 0.12, hashrate: 13500, dailyCapNox: 67500000, lifetimeCapNox: 16200000 },
]

export function dailyCapNox(hashrate) {
  return (50000 * hashrate) / 10
}

export function accrualPerMinute(hashrate) {
  return (hashrate * BASE_NOX_PER_HASHRATE_PER_DAY) / MINUTES_PER_DAY
}

export function accrualPerDay(hashrate) {
  return Math.min(hashrate * BASE_NOX_PER_HASHRATE_PER_DAY, dailyCapNox(hashrate))
}

// Earnings for one source over `minutes`, bounded by the remaining daily
// cap and the remaining lifetime cap (null = no lifetime cap, as for the
// free rig). Returns the NOX earned in that period.
export function accrue({ hashrate, minutes, dailyRemainingNox, lifetimeRemainingNox = null }) {
  if (minutes <= 0 || hashrate <= 0) return 0
  let earned = accrualPerMinute(hashrate) * minutes
  earned = Math.min(earned, dailyRemainingNox)
  if (lifetimeRemainingNox !== null) earned = Math.min(earned, lifetimeRemainingNox)
  return Math.max(0, earned)
}
