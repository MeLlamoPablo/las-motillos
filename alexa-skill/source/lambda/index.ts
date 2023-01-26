import * as Alexa from "ask-sdk-core";
import { DynamoDbPersistenceAdapter } from "ask-sdk-dynamodb-persistence-adapter";
import { DynamoDB } from "aws-sdk";

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
  .withPersistenceAdapter(
    new DynamoDbPersistenceAdapter({
      tableName: process.env["DYNAMODB_PERSISTENCE_TABLE_NAME"] ?? "",
      createTable: false,
      dynamoDBClient: new DynamoDB({
        apiVersion: "2012-08-10",
        region: process.env["DYNAMODB_PERSISTENCE_REGION"] ?? "",
      }),
    })
  )
  .lambda();
