import type { ActionHandler, ActionBuildContext } from "@nodara/monitor";
import { ActionType, type ActionConfig } from "@nodara/shared";
import { encodeFunctionData, parseUnits, type Address } from "viem";
import { erc20Abi, NATIVE_TOKEN_SENTINEL } from "@nodara/blockchain";
import { ValidationError } from "../../utils/errors.js";
import { getTokenDecimals } from "../../monitor/token-metadata.js";

type Config = Extract<ActionConfig, { type: typeof ActionType.TRANSFER_TOKENS }>;

export const transferTokensActionHandler: ActionHandler<Config> = {
  type: ActionType.TRANSFER_TOKENS,

  async buildTransaction(config, ctx: ActionBuildContext) {
    const destination = config.destinationAddress === "COLD_WALLET" ? ctx.coldWalletAddress : config.destinationAddress;
    if (!destination) {
      throw new ValidationError(
        "This workflow's action targets the cold wallet, but no cold wallet address is configured for this wallet."
      );
    }

    let amountRaw: bigint;
    if (config.amountMode === "FIXED") {
      if (!config.fixedAmount) throw new ValidationError("fixedAmount is required when amountMode is FIXED");
      const decimals = await getTokenDecimals(config.tokenAddress, ctx.chainId);
      amountRaw = parseUnits(config.fixedAmount, decimals);
    } else {
      // EXCESS / ALL both use the full amount captured by the trigger. A
      // finer-grained "sweep only the amount above N" mode is a natural
      // follow-up once the condition threshold is threaded through to
      // the action context.
      const raw = ctx.evidence.amountRaw;
      if (typeof raw !== "string") {
        throw new ValidationError(`amountMode "${config.amountMode}" requires trigger evidence with amountRaw`);
      }
      amountRaw = BigInt(raw);
    }

    if (config.tokenAddress === NATIVE_TOKEN_SENTINEL) {
      return { to: destination, data: "0x", value: amountRaw.toString() };
    }

    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [destination as Address, amountRaw],
    });

    return { to: config.tokenAddress, data, value: "0" };
  },
};
