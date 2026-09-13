import { z } from "zod";

export const NonceQuerySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM address"),
});

export const VerifySiweSchema = z.object({
  message: z.string().min(1),
  signature: z.string().min(1),
});
