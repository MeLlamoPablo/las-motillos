import { z } from "zod";

export const StringifiedNumberZ = z
  .string()
  .transform((expiresIn) => Number(expiresIn))
  .refine((expiresIn) => !isNaN(expiresIn));
