import fetch from "node-fetch";
import { stringify } from "querystring";
import { z } from "zod";

const reverseGeocodeResponse = z.object({
  name: z.string().nullish(),
  address: z.object({
    state_district: z.string().nullish(),
    postcode: z.string().nullish(),
    road: z.string().nullish(),
  }),
});

export async function reverseGeocode(position: { lat: number; lon: number }) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse.php?${stringify({
      ...position,
      zoom: 18,
      format: "jsonv2",
    })}`
  );

  return reverseGeocodeResponse.parse(await response.json());
}
