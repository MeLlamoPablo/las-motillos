/**
 * Acciona's authenticates via Firebase. The token that grants access to private
 * resources is the `firebaseAccessToken`. This is passed to Acciona requests
 * via the `X-Authorization` header.
 *
 * Acciona's endpoint also are protected by additional tokens, which here I call
 * "Acciona Public Access Tokens". These can be obtained with public credentials
 * that I found hardcoded on the Android app. They are passed via the
 * `Authorization` header, even for public requests.
 *
 *  There are two tokens like this, generated by different endpoints. One is
 *  in the form of a JWT and the other one is a UUID. Some requests require the
 *  former, and some the latter. I don't understand what do they represent nor
 *  why they are required for each request.
 */
export type PublicSession = {
  accionaPublicJwtAccessToken: string;
  accionaPublicUuidAccessToken: string;
  expiresAt: number;
};

export type AuthenticatedSession = PublicSession & {
  firebaseAccessToken: string;
};
