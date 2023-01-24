import { createRequestHandler } from "../utils/createRequestHandler";

export const CancelAndStopIntentHandler = createRequestHandler({
  requestType: "IntentRequest",
  intentName: "AMAZON.HelpIntent",
  handle: ({ responseBuilder }) => {
    const speakOutput = "¡Adiós!";

    return responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
});
