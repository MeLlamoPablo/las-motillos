import fetch from "node-fetch";
import { z } from "zod";

import { RegionZ } from "$/types/Region";
import type { PublicSession } from "$/types/Session";

const regionsZ = z.array(RegionZ);

const getRegionsZ = z.object({
  regions: regionsZ,
});

export function getRegions(session: PublicSession) {
  return async function ({ skipCache = false }: { skipCache?: boolean } = {}) {
    const url = skipCache
      ? "https://api.accionamobility.com/v2/region"
      : "https://raw.githubusercontent.com/MeLlamoPablo/las-motillos/master/acciona-client/assets/regions.json";

    const headers = skipCache
      ? {
          authorization: `Bearer ${session.accionaPublicJwtAccessToken}`,
          "User-Agent": "https://github.com/MeLlamoPablo/las-motillos",
          accept: "application/json",
        }
      : {
          accept: "application/json",
        };

    const response = await fetch(url, {
      headers,
    });

    if (skipCache) {
      return getRegionsZ.parse(await response.json()).regions;
    }

    return regionsZ.parse(await response.json());
  };
}
