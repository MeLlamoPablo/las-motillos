import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { FIREBASE_API_KEY, FIREBASE_HEADERS } from "$/config";

const completeAccionaLoginZ = z.object({
  expiresIn: z.string(),
  idToken: z.string(),
  isNewUser: z.boolean(),
  localId: z.string(),
  phoneNumber: z.string(),
  refreshToken: z.string(),
});

const completeAccionaLoginErrorZ = z.object({
  error: z.object({
    code: z.number(),
    message: z.literal("INVALID_CODE"),
  }),
});

export async function completeLogin({
  code,
  sessionInfo,
}: {
  code: string;
  sessionInfo: string;
}): Promise<
  | { success: false; error: "invalid-code" }
  | { success: true; refreshToken: string }
> {
  const response = await fetch(
    `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPhoneNumber?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: FIREBASE_HEADERS,
      body: JSON.stringify({
        code,
        sessionInfo,
      }),
    }
  );

  const rawBody: unknown = await response.json();

  if (response.status === StatusCodes.BAD_REQUEST) {
    const parsedBody = completeAccionaLoginErrorZ.safeParse(rawBody);

    if (
      parsedBody.success &&
      parsedBody.data.error.message === "INVALID_CODE"
    ) {
      return {
        success: false,
        error: "invalid-code",
      };
    }
  }

  if (response.status === StatusCodes.OK) {
    const parsedBody = completeAccionaLoginZ.safeParse(rawBody);

    if (parsedBody.success) {
      return {
        success: true,
        refreshToken: parsedBody.data.refreshToken,
      };
    }
  }

  throw new Error(
    "Unexpected Firebase response: " + JSON.stringify(rawBody, null, "  ")
  );
}
