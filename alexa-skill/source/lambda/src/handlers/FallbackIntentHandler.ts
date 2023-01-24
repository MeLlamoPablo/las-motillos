import { createRequestHandler } from "../utils/createRequestHandler";

export const FallbackIntentHandler = createRequestHandler({
  requestType: "IntentRequest",
  intentName: ["AMAZON.CancelIntent", "AMAZON.StopIntent"],
  handle: ({ responseBuilder }) => {
    // TODO
    const speakOutput = "Todavía tengo que aprender a hacer eso";

    return responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
});
