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
        "User-Agent": "https://github.com/MeLlamoPablo/las-motillos",
        accept: "application/json",
      },
    });

    return getRegionsZ.parse(await response.json()).regions;
  };
}
