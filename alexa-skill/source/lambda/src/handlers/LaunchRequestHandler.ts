import type {
  AuthenticatedAccionaClient,
  Vehicle,
} from "@las-motillos/acciona-client";
import type { RequestEnvelope, services } from "ask-sdk-model";
import { isPointInPolygon } from "geolib";
import { last, uniqBy } from "lodash";

import type { BikeWithLocation } from "$/types/BikeWithLocation";
import { createRequestHandler } from "$/utils/createRequestHandler";
import { geocode } from "$/utils/geocode";
import { reverseGeocode } from "$/utils/reverseGeocode";
import { sortedByDistance } from "$/utils/sortedByDistance";

export const LaunchRequestHandler = createRequestHandler({
  requestType: "LaunchRequest",
  async handle({
    acciona,
    attributesManager,
    requestEnvelope,
    responseBuilder,
    serviceClientFactory,
  }) {
    try {
      const userLocation = await getUserPosition({
        requestEnvelope,
        serviceClientFactory,
      });

      if (!userLocation) {
        return responseBuilder
          .speak(
            "Perdona, no tengo acceso a tu ubicación. Necesito que me des acceso en la sección Skills de la aplicación de Alexa."
          )
          .withShouldEndSession(true)
          .getResponse();
      }

      const { allRegions, region } = await getUserRegion({
        acciona,
        userLocation,
      });

      if (!region) {
        const regionNames = allRegions.map((region) => region.name);
        const firstRegions = regionNames.slice(0, -1);
        const lastRegion = last(regionNames);

        if (firstRegions.length === 0 || !lastRegion) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Unexpected response from Acciona");
        }

        return responseBuilder
          .speak(
            `Perdona, Acciona sólo está disponible en ${firstRegions.join(
              ", "
            )} y ${lastRegion}, y no he detectado que estés en ninguna de esas ciudades. Por favor, comprueba la ubicación de tu dispositivo.`
          )
          .withShouldEndSession(true)
          .getResponse();
      }

      const bikes = await getBestBikes({
        acciona,
        userLocation,
        userRegionId: region.id,
      });

      if (bikes.length === 0) {
        return responseBuilder
          .speak("Perdona, no he encontrado ninguna moto cerca tuya.")
          .withShouldEndSession(true)
          .getResponse();
      }

      let speakOutput = `He encontrado ${
        bikes.length === 1 ? "esta" : `estas`
      } motos cerca tuya: `;

      bikes.forEach(({ bike, road }, index) => {
        if (index === 0) {
          speakOutput += "una en ";
        } else {
          speakOutput += "otra en ";
        }

        speakOutput += `${road} con un ${bike.battery_level} por ciento de batería`;

        if (index === bikes.length - 1) {
          // Is last
          speakOutput += ".";
        } else if (index === bikes.length - 2) {
          // Is second to last
          speakOutput += ", y ";
        } else {
          speakOutput += ", ";
        }
      });

      speakOutput += " ¿Cuál reservo?";

      attributesManager.setSessionAttributes({
        bikes,
        userLocation,
      });

      return responseBuilder
        .speak(speakOutput)
        .reprompt(
          "¿Cuál reservo? Dime: Alexa, y la dirección de la moto que quieres que reserve."
        )
        .addElicitSlotDirective("location", {
          name: "ReserveBike",
          confirmationStatus: "NONE",
        })
        .getResponse();
    } catch (e) {
      console.error(e);

      return responseBuilder
        .speak(
          "Perdona, estoy teniendo problemas para encontrar motos ahora mismo."
        )
        .withShouldEndSession(true)
        .getResponse();
    }
  },
});

async function getUserPosition({
  requestEnvelope,
  serviceClientFactory,
}: {
  requestEnvelope: RequestEnvelope;
  serviceClientFactory: services.ServiceClientFactory | undefined;
}) {
  const geoLocation = requestEnvelope.context?.Geolocation?.coordinate;

  if (geoLocation) {
    return {
      lat: geoLocation.latitudeInDegrees,
      lon: geoLocation.longitudeInDegrees,
    };
  }

  try {
    const client = serviceClientFactory?.getDeviceAddressServiceClient();
    const address = await client?.getFullAddress(
      requestEnvelope.context.System.device?.deviceId ?? ""
    );

    if (!address) {
      return null;
    }

    let addressString = address.addressLine1 ?? "";

    if (address.addressLine2) {
      addressString += `, ${address.addressLine2}`;
    }

    if (address.addressLine3) {
      addressString += `, ${address.addressLine3}`;
    }

    if (address.postalCode) {
      addressString += `, ${address.postalCode}`;
    }

    if (address.city) {
      addressString += `, ${address.city}`;
    }

    return await geocode(addressString);
  } catch (e) {
    return null;
  }
}

async function getUserRegion({
  acciona,
  userLocation,
}: {
  acciona: AuthenticatedAccionaClient;
  userLocation: { lat: number; lon: number };
}) {
  const regions = await acciona.getRegions();
  const region = regions.find((region) =>
    isPointInPolygon(userLocation, region.bounding_box)
  );

  return { allRegions: regions, region };
}

async function getBestBikes({
  acciona,
  userLocation,
  userRegionId,
}: {
  acciona: AuthenticatedAccionaClient;
  userLocation: { lat: number; lon: number };
  userRegionId: number;
}): Promise<BikeWithLocation[]> {
  const fleet = await acciona.getFleet({
    regionId: userRegionId,
  });

  const sorted = sortedByDistance(fleet, userLocation);
  const filtered = sorted.filter((bike) => bike.battery_level > 40);

  const bikesWithLocationInfo = await Promise.all(
    filtered.slice(0, 6).map(getLocationInfoForBike)
  );

  // Filter out duplicate bikes in the same street
  // We want to give the user a useful variety of options. Two bikes close to
  // each other is not useful. Better filter out the second and leave room for
  // a third in another street.
  return uniqBy(
    bikesWithLocationInfo.filter((it): it is NonNullable<typeof it> => !!it),
    ({ road }) => road
  ).slice(0, 3);
}

async function getLocationInfoForBike(bike: Vehicle) {
  const { road } = await reverseGeocode({
    lat: bike.position.lat,
    lon: bike.position.lng,
  });

  if (!road) {
    return undefined;
  }

  return {
    bike,
    road,
  };
}
