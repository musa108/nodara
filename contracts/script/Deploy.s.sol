// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {NodaraExecutionRegistry} from "../src/NodaraExecutionRegistry.sol";

/// @notice Deploys NodaraExecutionRegistry to BOT Chain Mainnet.
/// @dev Run with:
///
///   forge script script/Deploy.s.sol:Deploy \
///     --rpc-url botchain_mainnet \
///     --broadcast \
///     --verify \
///     -vvvv
///
/// The deployer's private key is read from the DEPLOYER_PRIVATE_KEY
/// environment variable by `vm.envUint` below — it is never written to
/// this file, never logged, and never committed. Set it in your shell
/// session only (e.g. via a local, gitignored .env sourced right before
/// running this command), not in any file that gets committed.
contract Deploy is Script {
    function run() external returns (NodaraExecutionRegistry registry) {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying NodaraExecutionRegistry");
        console.log("Deployer address:", deployer);
        console.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerPrivateKey);
        registry = new NodaraExecutionRegistry();
        vm.stopBroadcast();

        console.log("Deployed NodaraExecutionRegistry at:", address(registry));
    }
}
