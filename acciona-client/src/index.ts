import { getFleet } from "./requests/getFleet";
import { getRecaptchaSiteKey } from "./requests/getRecaptchaSiteKey";
import { getRegions } from "./requests/getRegions";
import { getUser } from "./requests/getUser";
import { reserveVehicle } from "./requests/reserveVehicle";
import { createPublicSession } from "./requests/session";
import type { AuthenticatedSession, PublicSession } from "./types";

export { completeLogin } from "./requests/completeLogin";
export { startLogin } from "./requests/startLogin";
export {
  createAuthenticatedSession,
  createPublicSession,
} from "./requests/session";
export * from "./types";

export function getAuthenticatedAccionaClient(session: AuthenticatedSession) {
  return {
    getFleet: getFleet(session),
    getRegions: getRegions(session),
    getUser: getUser(session),
    reserveVehicle: reserveVehicle(session),
  };
}

export async function getPublicAccionaClient(session?: PublicSession) {
  const _session = session ?? (await createPublicSession());

  return {
    getFleet: getFleet(_session),
    getRegions: getRegions(_session),
  };
}

export { getRecaptchaSiteKey };

export type PublicAccionaClient = ReturnType<typeof getPublicAccionaClient>;
export type AuthenticatedAccionaClient = ReturnType<
  typeof getAuthenticatedAccionaClient
>;
