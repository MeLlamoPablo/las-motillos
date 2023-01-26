import fetch from "node-fetch";
import { z } from "zod";

import { ReserveZ } from "../types/Reserve";

import { AvailabilityZ } from "$/types/Availability";
import type { Point } from "$/types/Point";
import type { AuthenticatedSession } from "$/types/Session";

const getAvailabilitySchema = z.object({
  availability: AvailabilityZ,
  inactive_reasons: z.array(z.unknown()),
});

const reserveSchema = z.object({
  reserve: ReserveZ,
});

export function reserveVehicle(session: AuthenticatedSession) {
  return async function ({
    userPosition,
    vehicleId,
  }: {
    userPosition: Point;
    vehicleId: number;
  }) {
    const availabilityResponse = await fetch(
      `https://api.accionamobility.com/v1/availability/vehicle`,
      {
        method: "PUT",
        headers: {
          authorization: `Bearer ${session.accionaPublicUuidAccessToken}`,
          "x-authorization": `Bearer ${session.firebaseAccessToken}`,
          "Content-Type": "application/json",
          "User-Agent": "https://github.com/MeLlamoPablo/las-motillos",
        },
        body: JSON.stringify({ position: userPosition, vehicle_id: vehicleId }),
      }
    );

    const { availability } = getAvailabilitySchema.parse(
      await availabilityResponse.json()
    );

    const reserveResponse = await fetch(
      `https://api.accionamobility.com/v1/reserve`,
      {
        method: "PUT",
        headers: {
          authorization: `Bearer ${session.accionaPublicUuidAccessToken}`,
          "x-authorization": `Bearer ${session.firebaseAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ availability_id: availability.id }),
      }
    );

    return (
      reserveSchema.parse(await reserveResponse.json()).reserve.status ===
      "CREATED"
    );
  };
}
