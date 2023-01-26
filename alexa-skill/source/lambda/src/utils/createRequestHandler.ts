import {
  AuthenticatedAccionaClient,
  getAuthenticatedAccionaClient,
} from "@las-motillos/acciona-client";
import { getIntentName, getRequestType } from "ask-sdk-core";
import type { CustomSkillRequestHandler } from "ask-sdk-core/dist/dispatcher/request/handler/CustomSkillRequestHandler";
import type { HandlerInput } from "ask-sdk-core/dist/dispatcher/request/handler/HandlerInput";
import type { Response } from "ask-sdk-model";
import { z } from "zod";

type BaseOptions = {
  handle: (
    input: HandlerInput & { acciona: AuthenticatedAccionaClient }
  ) => Promise<Response> | Response;
};

type LaunchRequestOptions = BaseOptions & {
  requestType: "LaunchRequest";
};

type SessionEndedRequestOptions = BaseOptions & {
  requestType: "SessionEndedRequest";
};

type IntentRequestOptions = BaseOptions & {
  intentName: string | string[];
  requestType: "IntentRequest";
};

export function createRequestHandler(
  params:
    | LaunchRequestOptions
    | SessionEndedRequestOptions
    | IntentRequestOptions
): CustomSkillRequestHandler {
  return {
    canHandle({ requestEnvelope }) {
      const requestType = getRequestType(requestEnvelope);

      if (
        params.requestType === "LaunchRequest" ||
        params.requestType === "SessionEndedRequest"
      ) {
        return requestType === params.requestType;
      }

      if (params.requestType === "IntentRequest") {
        const intentName = getIntentName(requestEnvelope);

        if (typeof params.intentName === "string") {
          return (
            requestType === "IntentRequest" && intentName === params.intentName
          );
        }

        return (
          requestType === "IntentRequest" &&
          params.intentName.includes(intentName)
        );
      }

      return false;
    },
    handle: async (input) => {
      const accionaSessionString =
        input.requestEnvelope.context.System.user.accessToken;

      if (!accionaSessionString) {
        return input.responseBuilder
          .speak(
            "Perdona, necesito que vincules tu cuenta de Acciona en la sección Skills de la aplicación de Alexa."
          )
          .withShouldEndSession(true)
          .getResponse();
      }

      const accionaSession = z
        .object({
          accionaPublicJwtAccessToken: z.string(),
          accionaPublicUuidAccessToken: z.string(),
          expiresAt: z.number(),
          firebaseAccessToken: z.string(),
        })
        .parse(JSON.parse(accionaSessionString));

      console.time("Perf: " + params.requestType)
      const r = await params.handle({
        ...input,
        acciona: getAuthenticatedAccionaClient(accionaSession),
      });
      console.timeEnd("Perf: " + params.requestType)
      return r
    },
  };
}
