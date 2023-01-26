import fetch from "node-fetch";
import { stringify } from "querystring";
import { z } from "zod";

export async function reverseGeocode(position: {
  lat: number;
  lon: number;
}): Promise<{ road: string | undefined }> {
  return process.env["MAPBOX_TOKEN"]
    ? mapboxReverseGeocode({
        mapboxToken: process.env["MAPBOX_TOKEN"],
        position,
      })
    : nominatimReverseGeocode(position);
}

const nominatimReverseGeocodeResponse = z.object({
  name: z.string().nullish(),
  address: z.object({
    state_district: z.string().nullish(),
    postcode: z.string().nullish(),
    road: z.string().nullish(),
  }),
});

async function nominatimReverseGeocode(position: {
  lat: number;
  lon: number;
}): Promise<{ road: string | undefined }> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse.php?${stringify({
      ...position,
      zoom: 18,
      format: "jsonv2",
    })}`
  );

  const {
    address: { road },
  } = nominatimReverseGeocodeResponse.parse(await response.json());

  return { road: road ?? undefined };
}

const mapboxReverseGeocodeResponse = z.object({
  features: z.tuple([
    z.object({
      text: z.string(),
    }),
  ]),
  type: z.literal("FeatureCollection"),
});

async function mapboxReverseGeocode({
  mapboxToken,
  position: { lat, lon },
}: {
  mapboxToken: string;
  position: { lat: number; lon: number };
}): Promise<{ road: string }> {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?${stringify(
      {
        access_token: mapboxToken,
        language: "es-ES",
        limit: 1 /**/,
        types: "address",
      }
    )}`
  );

  const {
    features: [{ text }],
  } = mapboxReverseGeocodeResponse.parse(await response.json());

  return { road: text };
}
