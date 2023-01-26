import { oneLine } from "common-tags";
import fetch from "node-fetch";
import { stringify } from "query-string";
import { z } from "zod";

import { FIREBASE_API_KEY, FIREBASE_HEADERS } from "$/config";
import type { AuthenticatedSession, PublicSession } from "$/types/Session";

const generateFirebaseAccessTokenZ = z.object({
  access_token: z.string(),
  expires_in: z.string(),
  id_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
});

async function generateFirebaseSession({
                                         refreshToken,
                                       }: {
  refreshToken: string;
}) {
  const response = await fetch(
    oneLine`
      https://securetoken.googleapis.com/v1/token?${stringify({
      key: FIREBASE_API_KEY,
    })}
    `,
    {
      method: "POST",
      headers: FIREBASE_HEADERS,
      body: JSON.stringify({
        grantType: "refresh_token",
        refreshToken,
      }),
    }
  );

  const { access_token, expires_in, refresh_token } =
    generateFirebaseAccessTokenZ.parse(await response.json());

  return {
    accessToken: access_token,
    expiresAt: getTokenExpiration(Number(expires_in)),
    refreshToken: refresh_token,
  };
}

const generateAccionaAccessTokenZ = z.object({
  access_token: z.string(),
  expires_in: z.number(),
});

async function generateAccionaPublicJwtAccessToken() {
  const accionaPublicUsername = "app";
  const accionaPublicPassword = "8d71c7b0-a247-41c0-9237-6a0f3e7fcce7";

  const userPassword = `${accionaPublicUsername}:${accionaPublicPassword}`;
  const authString = Buffer.from(userPassword, "utf-8").toString("base64");

  const response = await fetch(
    "https://sso.accionamobility.com/auth/realms/acciona_op/protocol/openid-connect/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: "app",
      }),
    }
  );

  const { access_token, expires_in } = generateAccionaAccessTokenZ.parse(
    await response.json()
  );

  return {
    accessToken: access_token,
    expiresAt: getTokenExpiration(Number(expires_in)),
  };
}

async function generateAccionaPublicUuidAccessToken() {
  const accionaPublicUsername = "mobile_android_202009";
  const accionaPublicPassword = "2agUcvp2EK";
  const accionaPublicAuthString = "?SFs5mM";

  const userPassword = `${accionaPublicUsername}:${accionaPublicPassword}:${accionaPublicAuthString}`;
  const authString = Buffer.from(userPassword, "utf-8").toString("base64");

  const response = await fetch("https://api.accionamobility.com/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authString}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope:
        "region:read+city:read+country:read+fleet:info+reserve:availability+reserve:create+reserve:read+reserve:action+reserve:cancel+vehicle:action+user:create+user:read+user:verify+user:write+user:session+user:payment:write+user:payment:read+user:password+trip:read+trip:image+incident:write+pack:read+pack:write+mobile:version+device:token:write+promo:redeem+invoice:read+user:onboarding:veridas+user:email:read+user:license:write+user:residence:write+user:documents:read+user:payment:attempt:read+user:fixed:price:fare:read+payment:retry:write+user:promo:time:read+user:rating:write+gift:card:read+gift:card:write+gift:card:redeem+bus:stop:read",
    }),
  });

  const { access_token, expires_in } = generateAccionaAccessTokenZ.parse(
    await response.json()
  );

  return {
    accessToken: access_token,
    expiresAt: getTokenExpiration(Number(expires_in)),
  };
}

export async function createPublicSession(): Promise<PublicSession> {
  const [
    {
      accessToken: accionaPublicJwtAccessToken,
      expiresAt: accionaPublicJwtExpiresAt,
    },
    {
      accessToken: accionaPublicUuidAccessToken,
      expiresAt: accionaPublicUuidExpiresAt,
    },
  ] = await Promise.all([
    (async () => {
      console.time("Perf: createPublicSession > generateAccionaPublicJwtAccessToken")
      const res = await generateAccionaPublicJwtAccessToken();
      console.timeEnd("Perf: createPublicSession > generateAccionaPublicJwtAccessToken")
      return res;
    })(),
    (async () => {
      console.time("Perf: createPublicSession > generateAccionaPublicUuidAccessToken")
      const res = await generateAccionaPublicUuidAccessToken();
      console.timeEnd("Perf: createPublicSession > generateAccionaPublicUuidAccessToken")
      return res;
    })(),
  ]);

  return {
    accionaPublicJwtAccessToken,
    accionaPublicUuidAccessToken,
    expiresAt: Math.min(accionaPublicJwtExpiresAt, accionaPublicUuidExpiresAt),
  };
}

export async function createAuthenticatedSession({
                                                   refreshToken,
                                                 }: {
  refreshToken: string;
}): Promise<AuthenticatedSession & { firebaseRefreshToken: string }> {
  const [
    publicSession,
    {
      accessToken: firebaseAccessToken,
      refreshToken: firebaseRefreshToken,
      expiresAt: firebaseExpiresAt,
    },
  ] = await Promise.all([
    (async () => {
      console.time("Perf: createAuthenticatedSession > createPublicSession")
      const res = await createPublicSession();
      console.timeEnd("Perf: createAuthenticatedSession > createPublicSession")
      return res;
    })(),
    (async () => {
      console.time("Perf: createAuthenticatedSession > generateFirebaseSession")
      const res = await generateFirebaseSession({
        refreshToken,
      });
      console.timeEnd("Perf: createAuthenticatedSession > generateFirebaseSession")
      return res;
    })(),
  ]);

  return {
    ...publicSession,
    expiresAt: Math.min(publicSession.expiresAt, firebaseExpiresAt),
    firebaseAccessToken,
    firebaseRefreshToken,
  };
}

function getTokenExpiration(expiresIn: number) {
  // -10 to avoid race conditions due to server latency
  return Math.floor(Date.now() / 1000) + expiresIn - 10;
}
