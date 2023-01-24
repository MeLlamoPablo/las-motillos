import fetch from "node-fetch";
import { stringify } from "querystring";
import { z } from "zod";

const StringifiedNumberZ = z
  .string()
  .transform((expiresIn) => Number(expiresIn))
  .refine((expiresIn) => !isNaN(expiresIn));

const geocodeResponse = z.array(
  z.object({
    lat: StringifiedNumberZ,
    lon: StringifiedNumberZ,
  })
);

export async function geocode(address: string) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search.php?${stringify({
      q: address,
      format: "jsonv2",
    })}`
  );

  const [firstMatch] = geocodeResponse.parse(await response.json());

  if (!firstMatch) {
    return null;
  }

  return {
    lat: firstMatch.lat,
    lon: firstMatch.lon,
  };
}
