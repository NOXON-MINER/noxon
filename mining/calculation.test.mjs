// Tests for the NOXON mining math. Run with: node --test mining/calculation.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BASE_NOX_PER_HASHRATE_PER_DAY,
  DEVICE_CATALOG,
  FREE_RIG,
  accrue,
  accrualPerDay,
  accrualPerMinute,
  dailyCapNox,
} from './calculation.mjs'

const approx = (actual, expected, epsilon = 1e-9) => {
  assert.ok(
    Math.abs(actual - expected) < epsilon,
    `expected ${actual} to be within ${epsilon} of ${expected}`,
  )
}

test('free rig accrues about 34.72 NOX per minute', () => {
  approx(accrualPerMinute(FREE_RIG.hashrate), 50000 / 1440)
})

test('free rig earns exactly its 50,000 NOX daily cap over a full day', () => {
  approx(accrualPerDay(FREE_RIG.hashrate), 50000)
  approx(accrue({ hashrate: 10, minutes: 1440, dailyRemainingNox: 50000 }), 50000)
})

test('free rig accrual is bounded by the daily cap, not the raw rate', () => {
  // 2,000 minutes at the raw rate would be ~69,444 NOX — the cap stops it.
  approx(accrue({ hashrate: 10, minutes: 2000, dailyRemainingNox: 50000 }), 50000)
})

test('free rig + NANO S1 accrue about 208.33 NOX per minute combined', () => {
  approx(accrualPerMinute(10 + 50), 300000 / 1440)
  approx(accrualPerDay(10) + accrualPerDay(50), 300000)
})

test('every device daily cap equals hashrate x 5,000', () => {
  for (const device of DEVICE_CATALOG) {
    assert.equal(dailyCapNox(device.hashrate), device.dailyCapNox)
    assert.equal(device.hashrate * BASE_NOX_PER_HASHRATE_PER_DAY, device.dailyCapNox)
  }
})

test('device lifetime cap binds before the daily cap over a long run', () => {
  const nano = DEVICE_CATALOG[0]
  // 30 days of NANO S1 would be 7,500,000 NOX at the daily rate — the
  // lifetime cap of 81,000 NOX stops it far earlier.
  approx(
    accrue({
      hashrate: nano.hashrate,
      minutes: 30 * 1440,
      dailyRemainingNox: nano.dailyCapNox,
      lifetimeRemainingNox: nano.lifetimeCapNox,
    }),
    81000,
  )
})

test('catalog has 6 tiers with increasing hashrate and caps', () => {
  assert.equal(DEVICE_CATALOG.length, 6)
  for (let i = 1; i < DEVICE_CATALOG.length; i++) {
    assert.ok(DEVICE_CATALOG[i].hashrate > DEVICE_CATALOG[i - 1].hashrate)
    assert.ok(DEVICE_CATALOG[i].dailyCapNox > DEVICE_CATALOG[i - 1].dailyCapNox)
    assert.ok(DEVICE_CATALOG[i].lifetimeCapNox > DEVICE_CATALOG[i - 1].lifetimeCapNox)
  }
})

test('accrue returns 0 for zero minutes or zero hashrate', () => {
  assert.equal(accrue({ hashrate: 10, minutes: 0, dailyRemainingNox: 50000 }), 0)
  assert.equal(accrue({ hashrate: 0, minutes: 60, dailyRemainingNox: 50000 }), 0)
})
