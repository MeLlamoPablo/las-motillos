# `@las-motillos/acciona-client`

The Acciona Client is a collection of functions that can be used to interact
with [Acciona Movilidad][Acciona-movilidad]'s API. It allows to programmatically
interact with resources available through the mobile app, like querying the
location of motorbikes, reserving a motorbike, or querying the user's available
driving minutes.

It supports two modes: public and authenticated. Here are all the requests
supported on **public mode**:

* [`getFleet`](#publicclientgetfleet)
* [`getRegions`](#publicclientgetregions)

In addition to all of the above, here are the requests supported on
**authenticated mode**:

* [`getUser`](#authenticatedclientgetuser)
* [`reserveVehicle`](#authenticatedclientreservevehicle)

## Instantiating a public client

Instantiating a public client is pretty easy, simply call
[`getPublicAccionaClient`](#getpublicaccionaclient):

```typescript
import { getPublicAccionaClient } from "@las-motillos/acciona-client";

const acciona = await getPublicAccionaClient();

// Public requests are available:
await acciona.getFleet();
```

If you're going to reuse the client across various requests or processes, it
could be worthwhile to cache the public session. You can do this by calling
[`createPublicSession`](#createpublicsession) directly:

```typescript
import { createPublicSession, getPublicAccionaClient } from "@las-motillos/acciona-client";

const session = await createPublicSession(); // Cache this
const acciona = await getPublicAccionaClient(session);

// Public requests are available:
await acciona.getFleet();
```

## Instantiating an authenticated client

Instantiating an authenticated client is a two-step process:

* First, you need to [log in with your Acciona credentials](#logging-in).
* Then, you need to
[create an authenticated session](#creating-an-authenticated-session).

### Logging in

Logging in cannot be done programmatically because it requires to enter a one
time code sent via SMS. It's best to implement this process with a user
interface, like on the `@las-motillos/acciona-login` package.

Since logging in will send a code, the login endpoint is protected by
[ReCaptcha][Recaptcha] to avoid spamming it with a lot of requests. First, you
will need to get the ReCaptcha site key that Acciona uses:

```typescript
import { getRecaptchaSiteKey } from "@las-motillos/acciona-client";

const recaptchaSiteKey = await getRecaptchaSiteKey();
```

The ReCaptcha SDK can be used to generate a "ReCaptcha Token" given that
ReCaptcha site key. [Refer to its documentation][Recaptcha-docs] for how to do
it.

Then, you can enter your Acciona email and password in combination with the
`recaptchaToken` using [`startLogin`](#startlogin):

```typescript
import { startLogin } from "@las-motillos/acciona-client";

const startLoginResult = await startLogin({
  email: "example@example.com",
  password: "my super secure password",
  recaptchaToken: "<token generated by ReCaptcha>"
});
```

`startLoginResult` can be successful or unsuccessful. Refer to the documentation
of [`startLogin`](#startlogin) for its possible values. If it's successful, it
will contain a `sessionInfo`:

```typescript
if (startLoginResult.success) {
  // We can use `sessionInfo` to complete the login
  const sessionInfo = startLoginResult.sessionInfo;
  
  // We can use `phoneNumber` to inform the user of where the code has been sent
  const phoneNumber = startLoginResult.phoneNumber;
} else {
  // Handle the error case
}
```

The SMS code will be sent to the user's phone number. Finally, we can enter the
received `code` alongside the `sessionInfo` to complete the login using
[`completeLogin`](#completelogin).

```typescript
import { completeLogin } from "@las-motillos/acciona-client";

const completeLoginResult = await completeLogin({
  code: "123456", // The code received by SMS
  sessionInfo: "<the sessionInfo string returned by startLogin>",
});
```

`completeLoginResult` can also be successful or unsuccessful. Refer to the
documentation of [`completeLogin`](#completelogin) for its possible values. If
it's successful, it will contain a `refreshToken`:

```typescript
if (completeLoginResult.success) {
  // We can use the `refreshToken` to create an authenticated session
  const sessionInfo = completeLoginResult.refreshToken;
} else {
  // Handle the error case
}
```

Store the refresh token somewhere you can access it programmatically, like on a
database.

### Creating an authenticated session

Now that we have the refresh token, we can use it to create an authenticated
session:

```typescript
import { createAuthenticatedSession, getAuthenticatedAccionaClient } from "@las-motillos/acciona-client";

const session = await createAuthenticatedSession({
  refreshToken: "<refresh token generated by the login process>", // Pull this from your data source
});
const acciona = getAuthenticatedAccionaClient(session);

// Authenticated requests are available:
await acciona.getUser();

// Public requests are also available:
await acciona.getFleet();
```

## API reference

### `AuthenticatedClient#getUser`

Returns information about the logged user.

Example request:

```typescript
await acciona.getUser();
```

Example response:

```json
{
  "account": {
    "city_id": 9,
    "email": "example@example.com",
    "free_seconds": 30000,
    "preferred_city": {
      "active": true,
      "country_id": 724,
      "id": 9,
      "slug": "sevilla"
    },
    "promo_code": "XXXXXXXX",
    "region_id": 13,
    "salesforce_id": "XXXXXXXXXXXXXXXXXX",
    "token": "XXXXXXXXXXXXXXXX"
  },
  "benefits": {
    "courtesy_seconds": 0,
    "free_seconds": 30000,
    "has_active_daily_pack_with_pause": false,
    "pack_seconds": 30000
  },
  "counters": {
    "co2": 500000,
    "kilometers": 5000.0,
    "minutes": 7000,
    "trips": 450
  },
  "gamified": true,
  "inactive_reasons": [],
  "profile": {
    "address": "Calle Eslava, 3",
    "birthdate": "1980-01-01T00:00:00",
    "city": "Sevilla",
    "commercial_communications": true,
    "country": 724,
    "fiscal_code": "",
    "gender": "not_selected",
    "identification_number": "12345678z",
    "last_name": "Delgado Martínez",
    "name": "Emilio",
    "phone_number": "+34612345678",
    "postal_code": "41002",
    "province": "",
    "readonly": true,
    "third_party_communications": false
  },
  "recurring_premium_insurance": false,
  "registration": {
    "completed_steps": 5,
    "max_steps": 5
  }
}

```

#### Parameters

None.

#### Returns

A `Promise` of an [`User`][Type-user].

### `AuthenticatedClient#reserveVehicle`

Reserves the given vehicle for the user. The user will have 15 minutes to walk
to the vehicle and use their app to start the trip.

The trip can't be started with this API client. The reservation can't be yet
canceled with this API client either, but I would like to implement that in the
future.

Note that repeated reservations and subsequent cancellations may result in a
penalty as per [Acciona's ToS][Acciona-tos]:

> 5.4 [...] La Sociedad se reserva el derecho de aplicar al Usuario la penalización correspondiente prevista en la [sic] Tarifas en el caso de reiteradas reservas sin iniciar el viaje.

Please, only make a reservation if you will actually use the vehicle.

Example request:

```typescript
await acciona.reserveVehicle({
  userPosition: {
    lat: 37.384,
    lon: -5.9705
  },
  vehicleId: 1234,
});
```

#### Parameters

* `userPosition` (`{ lat: number; lon: number; }`)
  * A set of coordinates representing the user position. Will be forwarded to
    Acciona's server.
  * On the Alexa skill, we pass the geolocation of the Alexa-enabled device, if
    available, or the resolved coordinates of the Echo device's associated
    address.

    I'm not sure how precise this needs to be, nor why does Acciona need this
    information here. My guess is analytics.

    You may be fine passing the vehicle's location instead, or a randomized
    location near the vehicle's, but I haven't tested this.
* `vehicleId` (`number`)
  * The ID of the vehicle to reserve. You can obtain this from
    [`getFleet`](#publicclientgetfleet).

#### Returns

A `Promise` of a `boolean` - `true` if the reserve was successful, false
otherwise.

### `completeLogin`

Completes the Acciona login by providing the OTP sent by SMS to the user. If
successful, it will generate a refresh token that can be used to generate an
`AuthenticatedSession`.

#### Parameters

* `code - string`: the OTP sent to the user's phone via SMS.
* `sessionInfo - string`: the `sessionInfo` string returned by
  [`startLogin`](#startlogin).

#### Returns

An object containing:

* `success: boolean`

If `success` is `true`, it will also contain:

* `refreshToken - string`: a refresh token that can be used to generate
  authenticated Acciona sessions via
  [`createAuthenticatedSession`](#createauthenticatedsession).

If `success` is `false`, it will contain instead:

* `error - string`: the reason why the login failed.

  For now, it can only have the value `invalid-code`.

### `createAuthenticatedSession`

Creates an Acciona `AuthenticatedSession` given a `refreshToken` generated after
a user login. See [Instantiating an authenticated client](#instantiating-an-authenticated-client)
for how to obtain it.

Example request:

```typescript
await createAuthenticatedSession({
  refreshToken: "<refresh token generated by the login process>"
});
```

#### Parameters

* `refreshToken` (`string`)
  * The refresh token returned by [`completeLogin`](#completelogin).

#### Returns

A `Promise` of an `AuthenticatedSession` object containing:

* `expiresAt - number`: the date when the session will expire and needs to be
  recreated, in the [Unix timestamp format][Unix-time].

### `createPublicSession`

Creates an Acciona `PublicSession` using public credentials hardcoded on the
Android app. This session contains access tokens that can query public
resources.

Example request

```typescript
await createPublicSession();
```

#### Parameters

None

#### Returns

A `PublicSession` object containing:

* `expiresAt - number`: the date when the session will expire and needs to be
  recreated, in the [Unix timestamp format][Unix-time].

### `getAuthenticatedAccionaClient`

Creates an authenticated Acciona Client that can make requests to public
endpoints and private endpoints in behalf of the authenticated user.

See [Instantiating an authenticated client](#instantiating-an-authenticated-client).

Example request:

```typescript
const acciona = getAuthenticatedAccionaClient(session);
```

#### Parameters

* `session` (`AuthenticatedSession`)
  * The object returned by [`createAuthenticatedSession`](#createauthenticatedsession).

#### Returns

An `AuthenticatedClient`.

### `getPublicAccionaClient`

Creates a public Acciona Client that can only make requests to public endpoints.

See [Instantiating a public client](#instantiating-a-public-client)

Example request:

```typescript
const acciona = await getPublicAccionaClient();
```

#### Parameters

* `session` (`PublicSession?`)
  * The object returned by [`createPublicSession`](#createpublicsession). If not
    present, a new public session will be created.

#### Returns

A `Promise` of a `PublicClient`.

### `PublicClient#getFleet`

Returns all available vehicles on a region.

Example request:

```typescript
await acciona.getFleet({ regionId: 8 });
```

Example response:

```json5
{
  "vehicles": [
    {
      "id": 12345,
      "custom_id": "54321",
      "type": "L1",
      "model": "s02-2020",
      "plate": "1234ABC",
      "battery_level": 14.0,
      "position": {
        "lat": 37.000000,
        "lng": -6.000000,
        "position": null
      },
      "autonomy": 14,
      "has_helmet_sensor": false,
      "has_promo": true,
      "has_special_trunk": false
    },
    // ...
  ]
}
```

#### Parameters

* `regionId - number` - the ID of the `Region` to query, as returned by
  [`getRegions`](#publicclientgetregions). Not to be confused with the
  `city_id`.

#### Returns

A promise of an object containing

* `vehicles - Vehicle[]` - An array of all available vehicles in the region.
  Each Vehicle contains:
  * `id - number`
  * `type - string`
  * `model - string`
  * `plate - string` - the vehicle registration plate identifier.
  * `battery_level - number` - The battery percentage of the vehicle. 100 is
    full battery and 0 is empty battery.
  * `position - Point` - the coordinates of the vehicle.
  * `autonomy - boolean` - this seems to be exactly the same as `battert_level`.
    I believe this should represent an estimate of how many kilometers can the
    vehicle make before running out of battery. I'm not sure if this is a bug,
    or that Acciona estimates that its vehicles run for 1km per % of battery.
  * `has_helmet_sensor - boolean`
  * `has_promo - boolean`
  * `has_special_trunk - boolean` 

### `getRecaptchaSiteKey`

Returns the [ReCaptcha][Recaptcha] site key that should be used to prepare the
captcha challenge.

Example request:

```typescript
await getRecaptchaSiteKey();
```

#### Parameters

None.

#### Returns

A `Promise` of a `string`.

### `PublicClient#getRegions`

Returns the regions (cities) where Acciona is available.

Example request:

```typescript
await acciona.getRegions();
```

Example response:

```json5
[
  {
    "id": 1,
    "name": "Madrid",
    "slug": "madrid",
    "city_id": 1,
    "bounding_box": [
      {
        "lat": 40.27465,
        "lng": -3.858771
      },
      {
        "lat": 40.559598,
        "lng": -3.858771
      },
      {
        "lat": 40.559598,
        "lng": -3.623
      },
      {
        "lat": 40.27465,
        "lng": -3.623
      },
      {
        "lat": 40.27465,
        "lng": -3.858771
      }
    ],
    "area": {
      "accepted": [
        [
          {
            "lat": 40.470297,
            "lng": -3.688346
          },
          // ...
          {
            "lat": 40.470297,
            "lng": -3.688346
          }
        ],
        // ...
      ],
      "denied": [
        // ...
      ]
    },
    "vehicle_type": [
      "L1"
    ],
    "vehicle_models": [
      "lockable-trunk",
      "automatic-trunk",
      "s02-2020"
    ]
  },
  {
    "id": 14,
    "name": "Roma",
    "slug": "rome",
    "city_id": 14,
    "bounding_box": [
      // ...
    ],
    "area": {
      "accepted": [
        // ...
      ],
      "denied": [
        // ...
      ]
    },
    "vehicle_type": [
      "L1"
    ],
    "vehicle_models": [
      "s02-2020"
    ]
  },
  {
    "id": 12,
    "name": "Milano",
    "slug": "milan",
    "city_id": 13,
    "bounding_box": [
      // ...
    ],
    "area": {
      "accepted": [
        // ...
      ],
      "denied": [
        // ...
      ]
    },
    "vehicle_type": [
      "L1"
    ],
    "vehicle_models": [
      "lockable-trunk",
      "s02-2020"
    ]
  },
  {
    "id": 8,
    "name": "Sevilla",
    "slug": "sevilla",
    "city_id": 9,
    "bounding_box": [
      // ...
    ],
    "area": {
      "accepted": [
        // ...
      ],
      "denied": [
        // ...
      ]
    },
    "vehicle_type": [
      "L1"
    ],
    "vehicle_models": [
      "s02-2020"
    ]
  },
  {
    "id": 5,
    "name": "Valencia",
    "slug": "valencia",
    "city_id": 5,
    "bounding_box": [
      // ...
    ],
    "area": {
      "accepted": [
        // ...
      ],
      "denied": [
        // ...
      ]
    },
    "vehicle_type": [
      "L1"
    ],
    "vehicle_models": [
      "automatic-trunk",
      "lockable-trunk"
    ]
  },
  {
    "id": 6,
    "name": "Área Metropolitana de Barcelona",
    "slug": "barcelona",
    "city_id": 6,
    "bounding_box": [
      // ...
    ],
    "area": {
      "accepted": [
        // ...
      ],
      "denied": [
        // ...
      ]
    },
    "vehicle_type": [
      "L1"
    ],
    "vehicle_models": [
      "automatic-trunk",
      "lockable-trunk"
    ]
  }
]
```

#### Parameters

None

#### Returns

A `Promise` of an array containing `Regions`. Each region contains:

* `id - number`
* `name - string`
* `slug - string`
* `city_id - number`
* `bounding_box - Point[]`. An array of points describing a polygon which bounds 
  the region.

  Each point contains:

    * `lat - number`
    * `lng - number`
* `area - object`. An object describing the areas of the region in which Acciona 
is available:
  * `accepted - Point[][]`. An array of polygons, each representing the areas of
  the city where Acciona is available (meaning that you can find vehicles there,
  and you can park your vehicles there).
  * `denied - Point[][]`. An array of polygons, each representing the areas of
    the city where Acciona is not available (meaning that you can't find
    vehicles there, and you can't park your vehicles there).
* `vehicle_type: string[]`
* `vehicle_models: string[]`

### `startLogin`

Starts the login process for an Acciona user. If successful, it will send an SMS
to the user, which must be entered on [`completeLoign`](#completelogin).

#### Parameters

* `email - string`: the email of the Acciona user.
* `password - string`: the password of the Acciona user.
* `recaptchaToken - string`: the token generated by [ReCaptcha][Recaptcha]
  after successfully completing the ReCaptcha challenge.

  To generate it, you need to create an interface that uses the site key
  returned by [`getRecaptchaSiteKey`](#getrecaptchasitekey). Refer to the 
  [ReCaptcha docs][Recaptcha-docs] for how to do it.

  Note: valid tokens can only be generated on `localhost` and
  `motit-motosharing.firebaseapp.com`. On any other domains the tokens generated
  will be rejected by Acciona's Firebase. To bypass this on production the app
  would need complete control of the user agent. This is why this project uses
  an Android App to login, along with a
  [modified web view][Android-modified-web-view].

#### Returns

An object containing:

* `success: boolean`

If `success` is `true`, it will also contain:

* `phoneNumber: string`: the user's phone number. Useful to let the user know
  where can they expect the SMS.
* `sessionInfo: string`: a random string that identifies the login process. It
  needs to be passed to [`completeLogin`](#completelogin)

If `success` is `false`, it will contain instead:

* `error - string`: the reason why the login failed. One of
  * `invalid-captcha`
  * `invalid-email`
  * `invalid-password`
  * `rate-limited`

[Acciona-movilidad]: https://movilidad.acciona.com/
[Acciona-tos]: https://movilidad.acciona.com/es_ES/terminos-condiciones-uso-servicio/
[Android-modified-web-view]: https://github.com/MeLlamoPablo/las-motillos/blob/4abd21f60a178a12d3b71474e74787df3cfd71cb/link-app-android/app/src/main/java/io/github/mellamopablo/lasmotillos/util/InterceptingClient.kt#L7-L27
[Recaptcha]: https://www.google.com/recaptcha/about/
[Recaptcha-docs]: https://developers.google.com/recaptcha/docs/v3
[Type-user]: https://github.com/MeLlamoPablo/las-motillos/blob/master/acciona-client/src/types/User.ts
[Unix-time]: https://en.wikipedia.org/wiki/Unix_time