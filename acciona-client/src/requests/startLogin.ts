import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { FIREBASE_API_KEY, FIREBASE_HEADERS } from "$/config";
import { StringifiedNumberZ } from "$/types/StringifiedNumber";

const getFirebaseAccountInfoZ = z.object({
  kind: z.literal("identitytoolkit#GetAccountInfoResponse"),
  users: z.tuple([
    z.object({
      phoneNumber: z.string(),
    }),
  ]),
});

async function getFirebaseAccountInfo({ idToken }: { idToken: string }) {
  const response = await fetch(
    `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: FIREBASE_HEADERS,
      body: JSON.stringify({
        idToken,
      }),
    }
  );

  return getFirebaseAccountInfoZ.parse(await response.json());
}

const sendVerificationCodeZ = z.object({
  sessionInfo: z.string(),
});

const sendVerificationCodeErrorZ = z.object({
  error: z.object({
    code: z.number(),
    message: z.union([
      z.literal("TOO_MANY_ATTEMPTS_TRY_LATER"),
      z.literal("CAPTCHA_CHECK_FAILED : Hostname match not found"),
      z.literal("CAPTCHA_CHECK_FAILED : Recaptcha verification failed - DUPE"),
    ]),
  }),
});

async function sendVerificationCode({
  phoneNumber,
  recaptchaToken,
}: {
  phoneNumber: string;
  recaptchaToken: string;
}): Promise<
  | { success: true; sessionInfo: string }
  | { success: false; error: "invalid-captcha" | "rate-limited" }
> {
  const response = await fetch(
    `https://www.googleapis.com/identitytoolkit/v3/relyingparty/sendVerificationCode?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: FIREBASE_HEADERS,
      body: JSON.stringify({
        phoneNumber,
        recaptchaToken,
      }),
    }
  );

  const rawBody: unknown = await response.json();

  if (response.status === StatusCodes.BAD_REQUEST) {
    const parsed = sendVerificationCodeErrorZ.safeParse(rawBody);

    if (parsed.success) {
      if (parsed.data.error.message === "TOO_MANY_ATTEMPTS_TRY_LATER") {
        return { success: false, error: "rate-limited" };
      } else {
        return { success: false, error: "invalid-captcha" };
      }
    }
  }

  if (response.status === StatusCodes.OK) {
    const parsed = sendVerificationCodeZ.safeParse(rawBody);

    if (parsed.success) {
      return { success: true, sessionInfo: parsed.data.sessionInfo };
    }
  }

  throw new Error(
    "Unexpected Firebase response: " + JSON.stringify(rawBody, null, "  ")
  );
}

const verifyPasswordZ = z.object({
  expiresIn: StringifiedNumberZ,
  displayName: z.string(),
  email: z.string(),
  idToken: z.string(),
  kind: z.literal("identitytoolkit#VerifyPasswordResponse"),
  localId: z.string(),
  refreshToken: z.string(),
  registered: z.boolean(),
});

const verifyPasswordErrorZ = z.object({
  error: z.object({
    code: z.number(),
    message: z.union([
      z.literal("EMAIL_NOT_FOUND"),
      z.literal("INVALID_EMAIL"),
      z.literal("INVALID_PASSWORD"),
    ]),
  }),
});

export async function startLogin({
  email,
  password,
  recaptchaToken,
}: {
  email: string;
  password: string;
  recaptchaToken: string;
}): Promise<
  | {
      success: false;
      error:
        | "invalid-captcha"
        | "invalid-email"
        | "invalid-password"
        | "rate-limited";
    }
  | { success: true; phoneNumber: string; sessionInfo: string }
> {
  const response = await fetch(
    `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: FIREBASE_HEADERS,
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    }
  );

  const rawBody: unknown = await response.json();

  if (response.status === StatusCodes.BAD_REQUEST) {
    const parsedBody = verifyPasswordErrorZ.safeParse(rawBody);

    if (parsedBody.success) {
      if (
        parsedBody.data.error.message === "EMAIL_NOT_FOUND" ||
        parsedBody.data.error.message === "INVALID_EMAIL"
      ) {
        return {
          success: false,
          error: "invalid-email",
        };
      }

      if (parsedBody.data.error.message === "INVALID_PASSWORD") {
        return {
          success: false,
          error: "invalid-password",
        };
      }
    }
  }

  if (response.status === StatusCodes.OK) {
    const parsedBody = verifyPasswordZ.safeParse(rawBody);
    if (parsedBody.success) {
      const {
        users: [{ phoneNumber }],
      } = await getFirebaseAccountInfo({
        idToken: parsedBody.data.idToken,
      });

      const sendResult = await sendVerificationCode({
        phoneNumber,
        recaptchaToken,
      });

      if (!sendResult.success) {
        return {
          success: false,
          error: sendResult.error,
        };
      }

      return {
        success: true,
        phoneNumber,
        sessionInfo: sendResult.sessionInfo,
      };
    }
  }

  throw new Error(
    "Unexpected Firebase response: " + JSON.stringify(rawBody, null, "  ")
  );
}
