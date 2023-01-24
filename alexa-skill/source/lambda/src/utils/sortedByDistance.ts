import { getDistance } from "geolib";

type Point = { lat: number; lon: number } | { lat: number; lng: number };

export function sortedByDistance<T extends { position: Point }>(
  input: readonly T[],
  reference: Point
): T[] {
  return input.slice().sort((a, b) => {
    const distanceToA = getDistance(reference, a.position);
    const distanceToB = getDistance(reference, b.position);
    return distanceToA - distanceToB;
  });
}
