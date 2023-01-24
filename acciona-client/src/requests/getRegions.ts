import fetch from "node-fetch";
import { z } from "zod";

import { RegionZ } from "$/types/Region";
import type { PublicSession } from "$/types/Session";

const getRegionsZ = z.object({
  regions: z.array(RegionZ),
});

export function getRegions(session: PublicSession) {
  return async function () {
    const response = await fetch("https://api.accionamobility.com/v2/region", {
      headers: {
        authorization: `Bearer ${session.accionaPublicJwtAccessToken}`,
        "user-agent": "motit/1.35.0 android/23",
        accept: "application/json",
      },
    });

    return getRegionsZ.parse(await response.json()).regions;
  };
}
