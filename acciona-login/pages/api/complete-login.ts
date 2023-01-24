import { completeLogin as completeAccionaLogin } from "@las-motillos/acciona-client";
import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { saveRefreshToken } from "$utils/db";

const PayloadZ = z
  .object({
    code: z.string(),
    sessionInfo: z.string(),
  })
  .strict();

export default async function completeLogin(
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

  const result = await completeAccionaLogin({
    code: payload.data.code,
    sessionInfo: payload.data.sessionInfo,
  });

  if (result.success) {
    const code = await saveRefreshToken(result.refreshToken);
    return res.status(StatusCodes.OK).json({ code });
  }

  res.status(StatusCodes.UNAUTHORIZED).json({
    error: result.error,
  });
}
