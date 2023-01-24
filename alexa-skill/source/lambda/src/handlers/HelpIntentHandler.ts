import { createRequestHandler } from "../utils/createRequestHandler";

export const HelpIntentHandler = createRequestHandler({
  requestType: "IntentRequest",
  intentName: "AMAZON.FallbackIntent",
  handle: ({ responseBuilder }) => {
    const speakOutput = "Lo siento, no te he entendido.";

    return responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
});
