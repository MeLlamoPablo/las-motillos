import { createRequestHandler } from "$/utils/createRequestHandler";

export const SessionEndedRequestHandler = createRequestHandler({
  requestType: "LaunchRequest",
  handle({ responseBuilder }) {
    return responseBuilder.getResponse();
  },
});
