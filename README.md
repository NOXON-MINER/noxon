<div align="center">

<img src="assets/logo.jpg" alt="NOXON logo" width="120" />

# NOXON

**Mine NOX on Robinhood Chain. Claim a free rig, buy devices with ETH, and claim NOX straight to your connected wallet — any amount, instantly.**

[![Website](https://img.shields.io/badge/Website-noxonminer.com-00C805?style=flat-square)](https://noxonminer.com)
[![X](https://img.shields.io/badge/X-@noxonminer-000000?style=flat-square&logo=x)](https://x.com/noxonminer)
[![Chain](https://img.shields.io/badge/Chain-Robinhood%204663-00C805?style=flat-square)](https://robinhoodchain.blockscout.com)
[![License](https://img.shields.io/badge/License-MIT-00C805?style=flat-square)](LICENSE)

[Website](https://noxonminer.com) · [X](https://x.com/noxonminer) · [Live app](https://noxonminer.com)

</div>

## What is NOXON

NOXON is a mining terminal on **Robinhood Chain Mainnet** (chain ID **4663**, ETH native). Every account gets a free mining rig. Buying a device adds hashrate. Earnings accrue continuously and can be claimed at any time — any amount, instantly, with no minimum and no fee. The claim pays straight to the wallet connected to the account.

- **Free rig:** 10 H, one per account, claim any time.
- **Devices:** 6 tiers, 180 days active, max 10 units per tier per account.
- **Token:** NOX, fixed supply of 1,000,000,000, 18 decimals. Contract: `0x2fb1422011cc33c610b24fcccf0d1755212afd2b` on Robinhood Chain.
- **Login:** X login (embedded wallet auto-created) or any wallet via WalletConnect. Robinhood Chain is the only chain.
- **Status:** the NOX token is live — contract `0x2fb1422011cc33c610b24fcccf0d1755212afd2b` on Robinhood Chain (4663).

## How mining works

### 1. Free rig

Every account starts with a free rig of **10 H**. It accrues NOX continuously, every minute, up to **50,000 NOX per day**. There is no vesting, no claim window, and no re-claim requirement — claim whenever you want.

### 2. Devices

A device is bought with a direct ETH transfer on Robinhood Chain to the payment receiver. The server verifies the payment on-chain (exact amount, sender, receiver, confirmations) before the device activates. Each device adds its hashrate for **180 days** and has its own daily cap and lifetime cap.

| Device | Price | Hashrate | Max / day | Lifetime cap |
| --- | --- | --- | --- | --- |
| NOX-NANO S1 | 0.0006 ETH | 50 H | 250,000 NOX | 81,000 NOX |
| NOX-PULSE S2 | 0.0018 ETH | 165 H | 825,000 NOX | 243,000 NOX |
| NOX-BLADE X3 | 0.0050 ETH | 480 H | 2,400,000 NOX | 675,000 NOX |
| NOX-CORE C5 | 0.0150 ETH | 1,500 H | 7,500,000 NOX | 2,025,000 NOX |
| NOX-TITAN T7 | 0.0450 ETH | 4,800 H | 24,000,000 NOX | 6,075,000 NOX |
| NOX-QUANTUM Q9 | 0.1200 ETH | 13,500 H | 67,500,000 NOX | 16,200,000 NOX |

Caps are ceilings, not promised earnings. A rig running a full day earns exactly its daily cap at most.

### 3. Claim

Claiming pays the unpaid balance instantly to the linked wallet — the embedded wallet for X logins, or the connected wallet for wallet logins. Any amount, no minimum, no fee. After a paid claim the unpaid balance resets to zero. One active payout wallet per account.

## The math

The whole reward model is three numbers. The code in [`mining/calculation.mjs`](mining/calculation.mjs) is a standalone port of the production accrual logic — same constants, same formulas — with tests in [`mining/calculation.test.mjs`](mining/calculation.test.mjs) (`node --test mining/calculation.test.mjs`).

**Base rate:** `5,000 NOX per hashrate per day`, paced evenly per minute.

```
accrual per minute = hashrate × 5,000 / 1,440
```

**Daily cap per source:** `50,000 × hashrate / 10` — which equals the base daily rate, so a rig running a full day earns exactly its cap. The free rig and each device are capped separately, per source, never shared.

```
daily cap = hashrate × 5,000
```

**Lifetime cap per device:** a fixed NOX amount per tier (see the table above). A device stops earning once it has paid its lifetime cap, even if its 180 days are not over.

**Earnings for a period** are the smallest of the three bounds:

```
earned = min(rate × minutes, daily remaining, lifetime remaining)
```

### Worked example

Free rig, 10 H:

```
per minute = 10 × 5,000 / 1,440 ≈ 34.72 NOX/min
per day    = 34.72 × 1,440 = 50,000 NOX (the daily cap)
```

Free rig + one NOX-NANO S1, 60 H combined:

```
per minute = 60 × 5,000 / 1,440 ≈ 208.33 NOX/min
per day    = 50,000 (free) + 250,000 (device) = 300,000 NOX
lifetime   = NANO S1 stops at 81,000 NOX total
```

## What's in this repo

| Path | What it is |
| --- | --- |
| `mining/calculation.mjs` | The mining math: base rate, per-minute accrual, daily and lifetime caps, device catalog. Zero dependencies. |
| `mining/calculation.test.mjs` | Tests for the math above. Run with `node --test mining/calculation.test.mjs`. |
| `assets/` | NOXON logo and the Robinhood, X, and GitHub marks used by the site header. |
| `README.md` | This file. |

This repo contains the mining math and the documentation only. The full application (frontend, API, database) is private. No private keys, secrets, or wallet credentials are in this repo — and none ever will be.

## Links

- Website: <https://noxonminer.com>
- X: <https://x.com/noxonminer>
- Chain explorer: <https://robinhoodchain.blockscout.com>

## License

MIT — see [LICENSE](LICENSE).
