import { findBestMatch } from "string-similarity";

import type { BikeWithLocation } from "$/types/BikeWithLocation";
import { createRequestHandler } from "$/utils/createRequestHandler";

export const ReserveBikeHandler = createRequestHandler({
  requestType: "IntentRequest",
  intentName: "ReserveBike",
  async handle({
    acciona,
    attributesManager,
    requestEnvelope,
    responseBuilder,
  }) {
    if (requestEnvelope.request.type !== "IntentRequest") {
      throw new Error("This shouldn't happen");
    }

    const { location } = requestEnvelope.request.intent.slots ?? {
      location: null,
    };

    if (!location?.value) {
      return responseBuilder
        .speak("Perdona, no te he entendido. Por favor, inténtalo de nuevo.")
        .withShouldEndSession(true)
        .getResponse();
    }

    const { bikes, userLocation } = attributesManager.getSessionAttributes<{
      bikes: BikeWithLocation[];
      userLocation: {
        lat: number;
        lon: number;
      };
    }>();

    try {
      const selectedBikeWithLocation = getBikeSelectedByUser({
        bikes,
        spokenLocation: location.value,
      });

      if (!selectedBikeWithLocation) {
        return responseBuilder
          .speak(
            "Perdona, no te he entendido. ¿Cuál es la dirección de la moto?"
          )
          .addElicitSlotDirective("location")
          .getResponse();
      }

      await acciona.reserveVehicle({
        userPosition: {
          lat: userLocation.lat,
          lng: userLocation.lon,
        },
        vehicleId: selectedBikeWithLocation.bike.id,
      });

      return responseBuilder
        .speak(`Te he reservado la moto de ${selectedBikeWithLocation.road}.`)
        .withShouldEndSession(true)
        .getResponse();
    } catch (e) {
      console.error(e);

      return responseBuilder
        .speak(
          "Perdona, no he podido reservar esa moto. Por favor, inténtalo más tarde."
        )
        .withShouldEndSession(true)
        .getResponse();
    }
  },
});

function getBikeSelectedByUser({
  bikes,
  spokenLocation,
}: {
  bikes: BikeWithLocation[];
  spokenLocation: string;
}) {
  const { bestMatch, bestMatchIndex } = findBestMatch(
    spokenLocation.toLowerCase().trim(),
    bikes.map(({ road }) => road.toLowerCase().trim())
  );

  if (bestMatch.rating < 0.5) {
    return null;
  }

  return bikes[bestMatchIndex];
}
