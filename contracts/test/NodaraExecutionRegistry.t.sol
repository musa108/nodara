// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {NodaraExecutionRegistry} from "../src/NodaraExecutionRegistry.sol";

contract NodaraExecutionRegistryTest is Test {
    NodaraExecutionRegistry internal registry;

    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    bytes32 internal constant WORKFLOW_ID = keccak256("workflow-1");
    bytes32 internal constant EXECUTION_ID = keccak256("execution-1");

    function setUp() public {
        registry = new NodaraExecutionRegistry();
    }

    // ---------------------------------------------------------------
    // Happy path
    // ---------------------------------------------------------------

    function test_RecordExecution_Succeeds() public {
        vm.prank(alice);
        registry.recordExecution(WORKFLOW_ID, EXECUTION_ID);

        assertTrue(registry.isRecorded(EXECUTION_ID));
        assertEq(registry.recordedBy(EXECUTION_ID), alice);
    }

    function test_RecordExecution_EmitsExpectedEvent() public {
        vm.expectEmit(true, true, false, true, address(registry));
        emit NodaraExecutionRegistry.WorkflowExecuted(alice, WORKFLOW_ID, EXECUTION_ID, block.timestamp);

        vm.prank(alice);
        registry.recordExecution(WORKFLOW_ID, EXECUTION_ID);
    }

    function test_RecordExecution_UsesActualBlockTimestamp() public {
        uint256 futureTimestamp = block.timestamp + 12345;
        vm.warp(futureTimestamp);

        vm.expectEmit(true, true, false, true, address(registry));
        emit NodaraExecutionRegistry.WorkflowExecuted(alice, WORKFLOW_ID, EXECUTION_ID, futureTimestamp);

        vm.prank(alice);
        registry.recordExecution(WORKFLOW_ID, EXECUTION_ID);
    }

    function test_RecordExecution_DifferentWalletsCanRecordDifferentExecutions() public {
        vm.prank(alice);
        registry.recordExecution(WORKFLOW_ID, keccak256("execution-alice"));

        vm.prank(bob);
        registry.recordExecution(WORKFLOW_ID, keccak256("execution-bob"));

        assertEq(registry.recordedBy(keccak256("execution-alice")), alice);
        assertEq(registry.recordedBy(keccak256("execution-bob")), bob);
    }

    function test_RecordExecution_SameWalletCanRecordMultipleDifferentExecutions() public {
        vm.startPrank(alice);
        registry.recordExecution(WORKFLOW_ID, keccak256("execution-1"));
        registry.recordExecution(WORKFLOW_ID, keccak256("execution-2"));
        vm.stopPrank();

        assertTrue(registry.isRecorded(keccak256("execution-1")));
        assertTrue(registry.isRecorded(keccak256("execution-2")));
    }

    // ---------------------------------------------------------------
    // Idempotency / duplicate prevention
    // ---------------------------------------------------------------

    function test_RecordExecution_RevertsOnDuplicateExecutionId() public {
        vm.prank(alice);
        registry.recordExecution(WORKFLOW_ID, EXECUTION_ID);

        vm.expectRevert(abi.encodeWithSelector(NodaraExecutionRegistry.AlreadyRecorded.selector, EXECUTION_ID));
        vm.prank(alice);
        registry.recordExecution(WORKFLOW_ID, EXECUTION_ID);
    }

    function test_RecordExecution_RevertsOnDuplicateEvenFromDifferentWallet() public {
        // A second wallet cannot "steal" or re-record an executionId that
        // was already attested — write-once semantics apply regardless
        // of who calls, not just per-caller.
        vm.prank(alice);
        registry.recordExecution(WORKFLOW_ID, EXECUTION_ID);

        vm.expectRevert(abi.encodeWithSelector(NodaraExecutionRegistry.AlreadyRecorded.selector, EXECUTION_ID));
        vm.prank(bob);
        registry.recordExecution(WORKFLOW_ID, EXECUTION_ID);
    }

    function test_RecordExecution_RevertsOnDuplicateEvenWithDifferentWorkflowId() public {
        // executionId is the uniqueness key, not the (workflowId, executionId) pair.
        vm.prank(alice);
        registry.recordExecution(WORKFLOW_ID, EXECUTION_ID);

        vm.expectRevert(abi.encodeWithSelector(NodaraExecutionRegistry.AlreadyRecorded.selector, EXECUTION_ID));
        vm.prank(alice);
        registry.recordExecution(keccak256("a-different-workflow"), EXECUTION_ID);
    }

    // ---------------------------------------------------------------
    // Input validation / malicious inputs
    // ---------------------------------------------------------------

    function test_RecordExecution_RevertsOnZeroWorkflowId() public {
        vm.expectRevert(NodaraExecutionRegistry.EmptyWorkflowId.selector);
        vm.prank(alice);
        registry.recordExecution(bytes32(0), EXECUTION_ID);
    }

    function test_RecordExecution_RevertsOnZeroExecutionId() public {
        vm.expectRevert(NodaraExecutionRegistry.EmptyExecutionId.selector);
        vm.prank(alice);
        registry.recordExecution(WORKFLOW_ID, bytes32(0));
    }

    function test_RecordExecution_RevertsOnBothZero() public {
        // workflowId is checked first — assert that ordering explicitly
        // so a future refactor can't silently swap the check order.
        vm.expectRevert(NodaraExecutionRegistry.EmptyWorkflowId.selector);
        vm.prank(alice);
        registry.recordExecution(bytes32(0), bytes32(0));
    }

    function test_RecordExecution_AcceptsMaxBytes32Values() public {
        bytes32 maxValue = bytes32(type(uint256).max);
        vm.prank(alice);
        registry.recordExecution(maxValue, maxValue == EXECUTION_ID ? EXECUTION_ID : maxValue);
        assertTrue(registry.isRecorded(maxValue));
    }

    // ---------------------------------------------------------------
    // No fund custody
    // ---------------------------------------------------------------

    function test_Contract_RejectsPlainEtherTransfer() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        (bool success,) = address(registry).call{value: 1 ether}("");
        assertFalse(success);
        assertEq(address(registry).balance, 0);
    }

    function test_RecordExecution_RevertsIfEtherSent() public {
        // recordExecution is non-payable — calling it with value attached
        // must revert, confirming the function cannot accidentally
        // receive funds.
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        (bool success,) = address(registry).call{value: 1 ether}(
            abi.encodeCall(registry.recordExecution, (WORKFLOW_ID, EXECUTION_ID))
        );
        assertFalse(success);
    }

    // ---------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------

    function test_IsRecorded_FalseForUnknownExecutionId() public view {
        assertFalse(registry.isRecorded(keccak256("never-recorded")));
    }

    function test_RecordedBy_ZeroAddressForUnknownExecutionId() public view {
        assertEq(registry.recordedBy(keccak256("never-recorded")), address(0));
    }

    // ---------------------------------------------------------------
    // Fuzzing
    // ---------------------------------------------------------------

    function testFuzz_RecordExecution_SucceedsForAnyNonZeroInputs(
        address caller,
        bytes32 workflowId,
        bytes32 executionId
    ) public {
        vm.assume(caller != address(0));
        vm.assume(workflowId != bytes32(0));
        vm.assume(executionId != bytes32(0));

        vm.prank(caller);
        registry.recordExecution(workflowId, executionId);

        assertTrue(registry.isRecorded(executionId));
        assertEq(registry.recordedBy(executionId), caller);
    }

    function testFuzz_RecordExecution_RevertsOnAnyDuplicate(
        address firstCaller,
        address secondCaller,
        bytes32 executionId
    ) public {
        vm.assume(firstCaller != address(0));
        vm.assume(secondCaller != address(0));
        vm.assume(executionId != bytes32(0));

        vm.prank(firstCaller);
        registry.recordExecution(WORKFLOW_ID, executionId);

        vm.expectRevert(abi.encodeWithSelector(NodaraExecutionRegistry.AlreadyRecorded.selector, executionId));
        vm.prank(secondCaller);
        registry.recordExecution(WORKFLOW_ID, executionId);
    }
}
