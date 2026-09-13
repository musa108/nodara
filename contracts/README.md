# Nodara Smart Contracts

## NodaraExecutionRegistry

A minimal, non-custodial, permissionless on-chain log of Nodara workflow
executions on BOT Chain.

### Why this contract exists

Nodara's product is off-chain workflow automation — every actual asset
transfer, swap, or approval revocation is executed through KeeperHub
against existing contracts (a user's wallet, an ERC-20 token, a DEX
router). Nodara itself does not own or need a contract for its core
product to function.

This contract is a deliberate, narrow exception: it gives Nodara's
existing off-chain execution record (the `Execution` + `AuditLog` rows
already produced by every workflow firing) an *optional* on-chain anchor
specific to BOT Chain, so an execution's occurrence can be verified
independently of Nodara's own database — anyone can check
`isRecorded(executionId)` against the chain directly.

It was written after determining that Nodara had no existing contract
that could legitimately be deployed to satisfy BOT Chain's request for a
verifiable contract address — see the root README's
[BOT Chain integration](../README.md#bot-chain-integration) section for
that reasoning in full.

### What it does NOT do

- Does not hold funds. It is non-payable; a plain ETH/BOT transfer to it reverts (tested).
- Has no owner, no admin role, no privileged function of any kind.
- Is not upgradeable — the deployed bytecode is final.
- Does not execute arbitrary calls, does not touch tokens, does not interact with any other contract.
- Is not required for Nodara's automation product to function — Nodara works identically on BOT Chain with or without this contract deployed.

### Interface

```solidity
function recordExecution(bytes32 workflowId, bytes32 executionId) external;

mapping(bytes32 => bool) public isRecorded;
mapping(bytes32 => address) public recordedBy;

event WorkflowExecuted(address indexed wallet, bytes32 indexed workflowId, bytes32 executionId, uint256 timestamp);
```

Reverts with `EmptyWorkflowId()`, `EmptyExecutionId()`, or
`AlreadyRecorded(executionId)` as appropriate. Every `executionId` can be
recorded exactly once, by anyone — mirroring the idempotency guarantee
Nodara's own execution pipeline already provides off-chain.

### Security review

| Category | Status |
|---|---|
| Reentrancy | No external calls anywhere in the contract — nothing to reenter. |
| Access control | Intentionally none — fully permissionless by design (public bulletin board, not an oracle). |
| Arbitrary external calls | None. The contract never calls another contract. |
| Unsafe token transfers | N/A — no token interaction. |
| Unchecked external calls | N/A — no external calls. |
| Integer issues | No arithmetic in the contract at all (Solidity ≥0.8 also reverts on overflow by default). |
| Approval vulnerabilities | N/A — not a token, no approvals. |
| Upgradeability risk | None — no proxy, no delegatecall, immutable bytecode. |
| Ownership risk | None — no owner variable exists. |
| Denial of service | No loops, no unbounded arrays, no external calls that could be griefed. |
| Signature / replay | No signatures used; replay is explicitly prevented via the `isRecorded` write-once check. |
| Unintended fund custody | Non-payable function, contract has no `receive`/`fallback` — a plain value transfer reverts (tested in `test_Contract_RejectsPlainEtherTransfer`). |

### Verified test results

```
Ran 18 tests for test/NodaraExecutionRegistry.t.sol:NodaraExecutionRegistryTest
[PASS] testFuzz_RecordExecution_RevertsOnAnyDuplicate(address,address,bytes32) (runs: 500)
[PASS] testFuzz_RecordExecution_SucceedsForAnyNonZeroInputs(address,bytes32,bytes32) (runs: 500)
[PASS] test_Contract_RejectsPlainEtherTransfer()
[PASS] test_IsRecorded_FalseForUnknownExecutionId()
[PASS] test_RecordExecution_AcceptsMaxBytes32Values()
[PASS] test_RecordExecution_DifferentWalletsCanRecordDifferentExecutions()
[PASS] test_RecordExecution_EmitsExpectedEvent()
[PASS] test_RecordExecution_RevertsIfEtherSent()
[PASS] test_RecordExecution_RevertsOnBothZero()
[PASS] test_RecordExecution_RevertsOnDuplicateEvenFromDifferentWallet()
[PASS] test_RecordExecution_RevertsOnDuplicateEvenWithDifferentWorkflowId()
[PASS] test_RecordExecution_RevertsOnDuplicateExecutionId()
[PASS] test_RecordExecution_RevertsOnZeroExecutionId()
[PASS] test_RecordExecution_RevertsOnZeroWorkflowId()
[PASS] test_RecordExecution_SameWalletCanRecordMultipleDifferentExecutions()
[PASS] test_RecordExecution_Succeeds()
[PASS] test_RecordExecution_UsesActualBlockTimestamp()
[PASS] test_RecordedBy_ZeroAddressForUnknownExecutionId()

Suite result: ok. 18 passed; 0 failed; 0 skipped
Coverage: 100% lines, 100% statements, 100% branches, 100% functions
```

Contract size: 574 bytes runtime (EIP-170 limit is 24,576 bytes — ~98%
of the limit unused). Deployment gas, measured via a real broadcast
against a local chain: **171,361 gas**.

### Setup

```bash
cd contracts
forge install   # pulls forge-std if not already present
cp .env.example .env
# edit .env: set DEPLOYER_PRIVATE_KEY to your own key, locally only.
# .env is gitignored — never commit it.
```

### Testing (safe to run any time — no network, no funds required)

```bash
forge build
forge test -vv
forge coverage
```

### Deploying to BOT Chain Mainnet

This step is irreversible and costs real BOT. Do not run it until
you've reviewed the contract source, the security review above, and are
deploying from a wallet you control with only as much BOT as needed for
gas.

```bash
source .env   # loads DEPLOYER_PRIVATE_KEY and RPC_URL_BOTCHAIN into your shell — never echo/log this

forge script script/Deploy.s.sol:Deploy \
  --rpc-url botchain_mainnet \
  --broadcast \
  -vvvv
```

This will print the deployed contract address and the deployment
transaction hash. Save both — you'll need the address for verification
below and both for reporting back to the BOT Chain ecosystem contact.

### Verifying on BOTScan

`scan.botchain.ai` runs [Blockscout](https://www.blockscout.com)
(confirmed via its own footer attribution), not an Etherscan-family
explorer — verification uses Foundry's Blockscout verifier:

```bash
forge verify-contract \
  <DEPLOYED_CONTRACT_ADDRESS> \
  src/NodaraExecutionRegistry.sol:NodaraExecutionRegistry \
  --verifier blockscout \
  --verifier-url https://scan.botchain.ai/api \
  --chain 677
```

Compiler settings used for the build (needed if BOTScan's UI asks for
them instead, via https://scan.botchain.ai/contract-verification):
- Compiler: `0.8.26`
- Optimizer: enabled, `200` runs
- No constructor arguments (the constructor takes no parameters)

After verification, confirm the contract shows as verified at
`https://scan.botchain.ai/address/<DEPLOYED_CONTRACT_ADDRESS>` — the
source code tab should render your Solidity source directly.

### What this repo has and has not actually done

- ✅ Compiled with the real `solc 0.8.26` compiler
- ✅ 18/18 tests passing, 100% coverage, against a real local EVM (Foundry's test runner)
- ✅ Deployment script dry-run tested end-to-end against a local Anvil chain (not BOT Chain) — confirmed the script deploys correctly and produces a working contract instance
- ✅ **Deployed to BOT Chain Mainnet**: `0x4e72B76B8f082104b7598C0D3efdc8355FaD87B0` (tx: `0x4cbaf009f249ca064d1b7d4044ae948b05f76ea43deb5ba0fcabbe34aae46562`)
- ✅ **Verified on BOTScan**: https://scan.botchain.ai/address/0x4e72B76B8f082104b7598C0D3efdc8355FaD87B0
