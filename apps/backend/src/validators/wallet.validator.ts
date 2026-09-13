import { z } from "zod";

export const SetColdWalletSchema = z.object({
  coldWalletAddress: z.string(),
});
