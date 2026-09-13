// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/// @title NodaraExecutionRegistry
/// @notice A minimal, permissionless on-chain log of Nodara workflow
///         executions. Nodara's execution pipeline already produces a
///         durable off-chain record (Postgres `Execution` + `AuditLog`
///         rows) for every workflow firing; this contract gives that
///         record an optional on-chain anchor specific to the chain the
///         execution ran on, so an execution's occurrence can be
///         verified independently of Nodara's own database.
/// @dev    Design constraints, deliberately:
///         - No custody: the contract is non-payable and never holds funds.
///         - No ownership or admin functions: nothing here is privileged.
///         - No upgradeability: the deployed bytecode is final.
///         - Fully permissionless: any address may record an attestation
///           for itself. This is intentional — the contract is a public
///           bulletin board, not an access-controlled oracle. Authenticity
///           for Nodara's own purposes comes from cross-referencing the
///           `executionId` against Nodara's own off-chain audit log, which
///           only Nodara's backend can produce in the first place (a cuid,
///           not a guessable value) — a third party recording an
///           unrelated attestation costs them real gas and affects
///           nothing in Nodara's own systems.
///         - Idempotent: the same `executionId` can only be recorded once,
///           mirroring the idempotency guarantee Nodara's own execution
///           pipeline already provides off-chain.
contract NodaraExecutionRegistry {
    /// @notice Emitted when a workflow execution is recorded.
    /// @param wallet The address that submitted the attestation (indexed for lookup).
    /// @param workflowId The Nodara workflow's identifier, as bytes32 (indexed for lookup).
    /// @param executionId The Nodara execution's identifier, as bytes32.
    /// @param timestamp The block timestamp at which the attestation was recorded.
    event WorkflowExecuted(address indexed wallet, bytes32 indexed workflowId, bytes32 executionId, uint256 timestamp);

    /// @notice Thrown when `workflowId` is the zero value.
    error EmptyWorkflowId();

    /// @notice Thrown when `executionId` is the zero value.
    error EmptyExecutionId();

    /// @notice Thrown when `executionId` has already been recorded.
    error AlreadyRecorded(bytes32 executionId);

    /// @notice Whether a given executionId has already been recorded.
    mapping(bytes32 executionId => bool recorded) public isRecorded;

    /// @notice The address that recorded a given executionId, if any.
    mapping(bytes32 executionId => address recordedBy) public recordedBy;

    /// @notice Records an on-chain attestation for a Nodara workflow execution.
    /// @dev Reverts if either identifier is empty, or if this executionId
    ///      was already recorded (by anyone) — this is a write-once log,
    ///      not a mutable record.
    /// @param workflowId The Nodara workflow's identifier, as bytes32.
    /// @param executionId The Nodara execution's identifier, as bytes32.
    function recordExecution(bytes32 workflowId, bytes32 executionId) external {
        if (workflowId == bytes32(0)) revert EmptyWorkflowId();
        if (executionId == bytes32(0)) revert EmptyExecutionId();
        if (isRecorded[executionId]) revert AlreadyRecorded(executionId);

        isRecorded[executionId] = true;
        recordedBy[executionId] = msg.sender;

        emit WorkflowExecuted(msg.sender, workflowId, executionId, block.timestamp);
    }
}
