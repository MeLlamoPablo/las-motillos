import fetch from "node-fetch";
import { stringify } from "query-string";
import { z } from "zod";

import { FIREBASE_API_KEY } from "$/config";

const getRecaptchaSiteKeyZ = z.object({
  kind: z.literal("identitytoolkit#GetRecaptchaParamResponse"),
  recaptchaSiteKey: z.string(),
});

export async function getRecaptchaSiteKey() {
  const response = await fetch(
    `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getRecaptchaParam?${stringify(
      {
        key: FIREBASE_API_KEY,
        cb: Date.now(),
      }
    )}`,
    {
      headers: {
        accept: "application/json",
      },
    }
  );

  return getRecaptchaSiteKeyZ.parse(await response.json()).recaptchaSiteKey;
}
