import fetch from "node-fetch";

import type { AuthenticatedSession } from "$/types/Session";
import { User, UserZ } from "$/types/User";

export function getUser(session: AuthenticatedSession) {
  return async function (): Promise<User> {
    const response = await fetch("https://api.accionamobility.com/v1/user", {
      headers: {
        authorization: `Bearer ${session.accionaPublicUuidAccessToken}`,
        "X-Authorization": session.firebaseAccessToken,
      },
    });

    return UserZ.parse(await response.json());
  };
}
