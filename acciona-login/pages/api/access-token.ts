import {createAuthenticatedSession} from "@las-motillos/acciona-client"
import type {NextApiRequest, NextApiResponse} from "next"
import {StatusCodes} from "http-status-codes"
import {z} from "zod"

import {readRefreshToken} from "$utils/db"
import {verify} from "argon2"

const PayloadZ = z.discriminatedUnion("grant_type", [
  z.object({
    grant_type: z.literal("authorization_code"),
    code: z.string(),
    client_id: z.literal("las-motillos"),
    redirect_uri: z.string(),
  }),
  z.object({
    grant_type: z.literal("refresh_token"),
    refresh_token: z.string(),
  }),
]);

/**
 * This endpoint is called by Alexa when:
 *
 * - The user has completed the login flow (OAuth 2.0 Authorization Code Grant)
 *   and the Alexa back-end has received the authCode. In this case, Alexa sends
 *   the code, and we return the refresh token generated after the user
 *   authenticated (along with the Acciona session).
 * - Whenever the "access token" (actually the entire Acciona session, which is
 *   a combination of three access tokens) that the Alexa back-end holds
 *   expires. In this case, Alexa sends the Acciona refresh token that they
 *   hold, and we return a new refresh token along with a new Acciona session.
 *
 * Only the Alexa back-end can call this endpoint. No one else is authorized.
 */
export default async function getAccessToken(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.time("Perf: getAccessToken")

  if (req.method !== "POST") {
    return res.status(StatusCodes.METHOD_NOT_ALLOWED).json({});
  }

  console.time("Perf: getAccessToken > isClientAuthenticated")

  if (!(await isClientAuthenticated(req.headers.authorization))) {
    console.timeEnd("Perf: getAccessToken > isClientAuthenticated")
    return res.status(StatusCodes.UNAUTHORIZED).json({});
  }
  console.timeEnd("Perf: getAccessToken > isClientAuthenticated")

  const payload = PayloadZ.safeParse(req.body);

  if (!payload.success) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ errors: payload.error.issues });
  }

  let refreshToken: string;

  switch (payload.data.grant_type) {
    case "authorization_code": {
      console.time("Perf: getAccessToken > readRefreshToken")
      const result = await readRefreshToken(payload.data.code);
      console.timeEnd("Perf: getAccessToken > readRefreshToken")

      if (!result) {
        return res.status(StatusCodes.UNAUTHORIZED).json({});
      }

      refreshToken = result;
      break;
    }
    case "refresh_token": {
      refreshToken = payload.data.refresh_token;
      break;
    }
  }

  console.time("Perf: getAccessToken > createAuthenticatedSession")
  const { firebaseRefreshToken, ...session } = await createAuthenticatedSession(
    {
      refreshToken,
    }
  );
  console.timeEnd("Perf: getAccessToken > createAuthenticatedSession")

  console.timeEnd("Perf: getAccessToken")

  return res
    .status(StatusCodes.OK)
    .setHeader("Cache-Control", "no-store")
    .setHeader("Pragma", "no-cache")
    .json({
      access_token: JSON.stringify(session),
      token_type: "bearer",
      expires_in: session.expiresAt - Math.ceil(Date.now() / 1000),
      refresh_token: firebaseRefreshToken,
      scope: "all",
    });
}

async function isClientAuthenticated(
  authorizationHeader: string | undefined
): Promise<boolean> {
  const matches = /Basic (.+)/.exec(authorizationHeader ?? "");

  if (!matches?.[1]) {
    return false;
  }

  const clientUserPass = Buffer.from(matches[1], "base64").toString("utf-8").split(":");

  if (clientUserPass.length !== 2) {
    return false;
  }

  const [clientUser, clientPass] = clientUserPass as [string, string];

  if (clientUser !== "las-motillos") {
    return false;
  }

  return await verify(process.env["ALEXA_CLIENT_SECRET"] ?? "", clientPass);
}
