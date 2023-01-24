import clamp from "lodash/clamp";
import { z } from "zod";

import { PointZ } from "./Point";

export const VehicleZ = z.object({
  id: z.number(),
  type: z.string(),
  model: z.string(),
  plate: z.string(),
  battery_level: z.number().transform((n) => clamp(n, 0, 100)),
  position: PointZ,
  autonomy: z.number(),
  has_helmet_sensor: z.boolean(),
  has_promo: z.boolean().nullish(),
  has_special_trunk: z.boolean(),
});

export type Vehicle = z.infer<typeof VehicleZ>;
