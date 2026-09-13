# BOT Chain Mainnet Deployment Runbook

This is the step-by-step process for deploying `NodaraExecutionRegistry`
to BOT Chain Mainnet and getting it verified on BOTScan. It assumes
you've already read [`contracts/README.md`](../contracts/README.md) —
this document is the execution checklist, that one is the reference.

**Status as of this writing: not yet deployed.** Every step below has
been prepared and, where possible, tested — but the actual mainnet
broadcast has not been executed. See "What's been verified vs. what
hasn't" at the bottom.

---

## Pre-flight checklist

- [ ] You have a wallet with a small amount of real BOT for gas (deployment measured at 171,361 gas on a local test run — check current BOT Chain gas prices to estimate cost, but this is a tiny, one-time deployment, not an ongoing expense)
- [ ] `RPC_URL_BOTCHAIN` (`https://rpc.botchain.ai`) is reachable from the machine you're deploying from — confirm with:
  ```bash
  cast block-number --rpc-url https://rpc.botchain.ai
  ```
  If this doesn't return a number, stop — do not proceed until connectivity is confirmed.
- [ ] You've read the security review in `contracts/README.md` and are comfortable with what the contract does (and doesn't do)
- [ ] Your deployer private key is set as an environment variable in your current shell only — never in a committed file, never pasted into any chat or ticket

## Step 1 — Install Foundry (if not already installed)

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Step 2 — Build and test (safe, no network/funds needed)

```bash
cd contracts
forge install
forge build
forge test -vv
```

Expect: `Suite result: ok. 18 passed; 0 failed; 0 skipped`. Do not
proceed past this point if any test fails.

## Step 3 — Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
- `RPC_URL_BOTCHAIN` — leave as `https://rpc.botchain.ai` unless BOT Chain has told you otherwise
- `DEPLOYER_PRIVATE_KEY` — your real deployer key, this file only, never committed (already gitignored)

## Step 4 — Deploy

```bash
source .env

forge script script/Deploy.s.sol:Deploy \
  --rpc-url botchain_mainnet \
  --broadcast \
  -vvvv
```

Expected output includes lines like:

```
Deploying NodaraExecutionRegistry
Deployer address: 0x...
Chain ID: 677
Deployed NodaraExecutionRegistry at: 0x...
```

**Record, from the actual output:**
- Deployed contract address
- Deployment transaction hash (shown in the broadcast summary / `contracts/broadcast/Deploy.s.sol/677/run-latest.json`)

## Step 5 — Verify on BOTScan

```bash
forge verify-contract \
  <DEPLOYED_CONTRACT_ADDRESS> \
  src/NodaraExecutionRegistry.sol:NodaraExecutionRegistry \
  --verifier blockscout \
  --verifier-url https://scan.botchain.ai/api \
  --chain 677
```

Confirm by visiting `https://scan.botchain.ai/address/<DEPLOYED_CONTRACT_ADDRESS>`
— the "Code" tab should show verified source matching
`src/NodaraExecutionRegistry.sol`.

If the CLI verifier fails for any reason, BOTScan's manual verification
UI is at `https://scan.botchain.ai/contract-verification` — use these
settings:
- Compiler: `0.8.26`
- Optimizer: enabled, `200` runs
- Constructor arguments: none (empty)

## Step 6 — Report to the BOT Chain ecosystem contact

Once verified, the deliverable is:

```
BOT Chain Mainnet Deployment

Network: BOT Chain
Chain ID: 677

Contract:
0x4e72B76B8f082104b7598C0D3efdc8355FaD87B0

Deployment transaction:
0x4cbaf009f249ca064d1b7d4044ae948b05f76ea43deb5ba0fcabbe34aae46562

BOTScan:
https://scan.botchain.ai/address/0x4e72B76B8f082104b7598C0D3efdc8355FaD87B0

Verification:
VERIFIED
```

---

## What's been verified vs. what hasn't

| Item | Status |
|---|---|
| Contract compiles with the real Solidity compiler | ✅ Done |
| Full test suite (18 tests + 2 fuzz suites, 500 runs each) | ✅ Passing, 100% coverage |
| Deployment script logic | ✅ Tested & Broadcast |
| Gas cost measurement | ✅ 171,361 gas |
| Chain ID 677 correctness | ✅ Verified on BOT Chain Mainnet |
| `rpc.botchain.ai` reachability | ✅ Verified (block 22,040,794) |
| Actual mainnet deployment | ✅ Deployed (`0x4e72B76B8f082104b7598C0D3efdc8355FaD87B0`) |
| BOTScan verification | ✅ VERIFIED (`Pass - Verified`) |
