import { z } from "zod";

export const PointZ = z.object({
  lat: z.number(),
  lng: z.number(),
});

export type Point = z.infer<typeof PointZ>;
