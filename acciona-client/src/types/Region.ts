import { z } from "zod";

import { PolygonZ } from "./Polygon";

const RegionAreaZ = z.array(PolygonZ).nullable().default([])

export const RegionZ = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  city_id: z.number(),
  bounding_box: PolygonZ,
  area: z.object({
    accepted: RegionAreaZ,
    denied: RegionAreaZ,
  }),
  vehicle_type: z.array(z.string()),
  vehicle_models: z.array(z.string()),
});
