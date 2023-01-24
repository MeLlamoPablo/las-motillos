import { z } from "zod";

import { VehicleZ } from "./Vehicle";

export const ReserveZ = z.object({
  id: z.number(),
  start_deadline: z.string(),
  state: z.object({
    current: z.string(),
    time: z.string(),
  }),
  status: z.string(),
  vehicle: VehicleZ,
});
