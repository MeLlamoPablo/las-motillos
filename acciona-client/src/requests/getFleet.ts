import fetch from "node-fetch";
import { z } from "zod";

import type { PublicSession } from "$/types/Session";
import { VehicleZ } from "$/types/Vehicle";

const getFleetSchema = z.object({
  vehicles: z.array(VehicleZ),
});

export function getFleet(session: PublicSession) {
  return async function ({ regionId }: { regionId: number }) {
    const response = await fetch(
      `https://api.accionamobility.com/v1/fleet/info/region/${regionId}`,
      {
        headers: {
          authorization: `Bearer ${session.accionaPublicUuidAccessToken}`,
        },
      }
    );

    return getFleetSchema.parse(await response.json()).vehicles;
  };
}
