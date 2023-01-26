import { getDistance } from "geolib";

type Point = { lat: number; lon: number } | { lat: number; lng: number };

export function sortedByDistance<T extends { position: Point }>(
  input: readonly T[],
  reference: Point
): T[] {
  return input
    .map((element) => ({
      element,
      distance: getDistance(reference, element.position),
    }))
    .sort((a, b) => a.distance - b.distance)
    .map(({ element }) => element);
}
