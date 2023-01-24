import { startLogin as startAccionaLogin } from "@las-motillos/acciona-client";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";
import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

const phoneUtil = PhoneNumberUtil.getInstance();

function maskPhoneNumber(input: string): string {
  const phone = phoneUtil.parse(input);
  const countryCode = phone.getCountryCode();
  const number = phoneUtil.format(phone, PhoneNumberFormat.NATIONAL);

  const last = getLastDigits(number, 3);
  const mask = number
    .substring(0, number.length - last.length)
    .replace(/\d/g, "*");

  return `+${countryCode} ${mask}${last}`;
}

/**
 * Gets a substring of a given string containing the last digits, and preserving
 * any other characters.
 *
 *  @example
 *  ```
 *  getLastDigits("+34 612 34 56 78", 5) // => "4 56 78"
 *  ```
 */
function getLastDigits(input: string, digits: number): string {
  let result = "";
  let digitsAdded = 0;

  for (let i = input.length - 1; i >= 0 && digitsAdded < digits; i--) {
    const char = input[i];
    result += char;

    if (char?.match(/\d/)) {
      digitsAdded += 1;
    }
  }

  return result.split("").reverse().join("");
}

const PayloadZ = z
  .object({
    email: z.string(),
    password: z.string(),
    recaptchaToken: z.string(),
  })
  .strict();

export default async function startLogin(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(StatusCodes.METHOD_NOT_ALLOWED).json({});
  }

  const payload = PayloadZ.safeParse(req.body);

  if (!payload.success) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ errors: payload.error.issues });
  }

  const result = await startAccionaLogin({
    email: payload.data.email,
    password: payload.data.password,
    recaptchaToken: payload.data.recaptchaToken,
  });

  if (result.success) {
    return res.status(StatusCodes.OK).json({
      maskedPhoneNumber: maskPhoneNumber(result.phoneNumber),
      sessionInfo: result.sessionInfo,
    });
  }

  if (result.error === "rate-limited") {
    return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      error: result.error,
    });
  }

  return res.status(StatusCodes.UNAUTHORIZED).json({
    error: result.error,
  });
}
