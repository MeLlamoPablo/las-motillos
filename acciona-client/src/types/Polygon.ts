import { z } from "zod";

import { PointZ } from "./Point";

export const PolygonZ = z.array(PointZ);
