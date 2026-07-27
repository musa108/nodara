import type { ActionHandler, ActionBuildContext } from "@nodara/monitor";
import { ActionType, type ActionConfig } from "@nodara/shared";
import { encodeFunctionData, parseUnits, type Address } from "viem";
import { NATIVE_TOKEN_SENTINEL } from "@nodara/blockchain";
import { ValidationError } from "../../utils/errors.js";
import { getTokenDecimals } from "../../monitor/token-metadata.js";

type Config = Extract<ActionConfig, { type: typeof ActionType.SWAP_TOKENS }>;

// Uniswap V3 SwapRouter02 — same address across mainnet, Base, and their
// testnets for the versions Nodara targets. Testnet router addresses
// occasionally get redeployed; verify against docs.uniswap.org before
// relying on this in a live demo.
const SWAP_ROUTER_02: Record<number, Address> = {
  1: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
  11155111: "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E",
  8453: "0x2626664c2603336E57B271c5C0b26F421741e481",
  84532: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4",
};

const DEFAULT_FEE_TIER = 3000; // 0.3%, the most liquid tier for most pairs

const exactInputSingleAbi = [
  {
    type: "function",
    name: "exactInputSingle",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
] as const;

export const swapTokensActionHandler: ActionHandler<Config> = {
  type: ActionType.SWAP_TOKENS,

  async buildTransaction(config, ctx: ActionBuildContext) {
    const router = SWAP_ROUTER_02[ctx.chainId];
    if (!router) throw new ValidationError(`SWAP_TOKENS is not supported on chainId ${ctx.chainId}`);
    if (config.fromTokenAddress === NATIVE_TOKEN_SENTINEL) {
      throw new ValidationError(
        "SWAP_TOKENS currently requires an ERC-20 fromToken (native-asset wrapping is not yet implemented)"
      );
    }

    let amountIn: bigint;
    if (config.amountMode === "FIXED") {
      if (!config.fixedAmount) throw new ValidationError("fixedAmount is required when amountMode is FIXED");
      const decimals = await getTokenDecimals(config.fromTokenAddress, ctx.chainId);
      amountIn = parseUnits(config.fixedAmount, decimals);
    } else {
      const raw = ctx.evidence.amountRaw;
      if (typeof raw !== "string") throw new ValidationError('amountMode "ALL" requires trigger evidence with amountRaw');
      amountIn = BigInt(raw);
    }

    // TODO(production): wire a real quoter (Uniswap QuoterV2 or an
    // aggregator) so amountOutMinimum reflects config.maxSlippageBps
    // against a live quote. For the hackathon MVP this relies on
    // KeeperHub's mandatory simulation step to catch unfavorable swaps
    // before anything is broadcast.
    const amountOutMinimum = 0n;

    const data = encodeFunctionData({
      abi: exactInputSingleAbi,
      functionName: "exactInputSingle",
      args: [
        {
          tokenIn: config.fromTokenAddress as Address,
          tokenOut: config.toTokenAddress as Address,
          fee: DEFAULT_FEE_TIER,
          recipient: ctx.walletAddress as Address,
          amountIn,
          amountOutMinimum,
          sqrtPriceLimitX96: 0n,
        },
      ],
    });

    return { to: router, data, value: "0" };
  },
};
