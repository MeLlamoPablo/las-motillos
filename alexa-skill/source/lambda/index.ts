import * as Alexa from "ask-sdk-core";

import { CancelAndStopIntentHandler } from "$/handlers/CancelAndStopIntentHandler";
import { FallbackIntentHandler } from "$/handlers/FallbackIntentHandler";
import { HelpIntentHandler } from "$/handlers/HelpIntentHandler";
import { LaunchRequestHandler } from "$/handlers/LaunchRequestHandler";
import { ReserveBikeHandler } from "$/handlers/ReserveBikeHandler";
import { SessionEndedRequestHandler } from "$/handlers/SessionEndedRequestHandler";

export const handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    ReserveBikeHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    FallbackIntentHandler
  )
  .addErrorHandlers({
    canHandle() {
      return true;
    },
    handle(handlerInput, error) {
      const speakOutput =
        "Perdona, he tenido un problema al hacer lo que me has pedido. Por favor, inténtalo más tarde.";
      console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse();
    },
  })
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
