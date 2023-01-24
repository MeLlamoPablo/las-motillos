# Las Motillos Architecture

This project is composed of five modules:

* [acciona-client](#acciona-client)
* [acciona-login](#acciona-login)
* [alexa-skill](#alexa-skill)
* [infra](#infra)
* [link-app-android](#link-app-android)

```mermaid
graph TD
    AccionaAPI{Acciona API}
    User{{User}}
    Alexa{Alexa}
    alexa-skill -->|depends on| acciona-client
    acciona-login -->|depends on| acciona-client
    acciona-client -->|calls| AccionaAPI
    infra -->|sets up infra for| acciona-login
    link-app-android -->|calls| acciona-login
    User --> Alexa
    User --> link-app-android
    Alexa --> |authenticates with| acciona-login
    Alexa --> |sends requests to| alexa-skill
```

### `acciona-client`

`acciona-client` is a Node API client that can make requests to the Acciona API.
It acts as a wrapper around the Acciona API and provides a simplified interface
for making requests.

[Go to README](acciona-client/README.md)

### `acciona-login`

`acciona-login` is a Next.js API that acts as an authentication bridge between
Alexa and Acciona. It is responsible for facilitating the login process and for
bridging OAuth requests from Alexa to the Acciona API.

The production version is hosted on Vercel.

### `alexa-skill`

`alexa-skill` is the actual Alexa Skill code that uses `acciona-client` to
interact with the Acciona API. It is responsible for handling user input from
Alexa, processing it and returning a response to the user.

The production version is hosted on the free Alexa servers.

### `infra`

`infra` is a set of Terraform configurations that can be used to deploy the AWS
infrastructure necessary for the project. It is also responsible for setting up
the necessary secrets on the `acciona-login` Vercel project.

### `link-app-android`

`link-app-android` is an Android app that authenticates against the
`acciona-login` API. Alexa redirects to it when the user installs the skill on
their account.

It is not possible to authenticate on the browser because the login flow is
secured by ReCaptcha and I don't own a valid domain. Hence, an Android app is
needed to manipulate the browser.

## User login flow

Here's a breakdown of how the modules interact with each other when the user
logs in.

```mermaid
sequenceDiagram
    actor User
    participant Alexa
    participant Android as link-app-android
    participant AccionaLogin as acciona-login
    participant AccionaClient as acciona-client
    participant Acciona Servers
    User-->>Alexa: Install the Las Motillos skill
    Alexa->>Android: Send an account linking request.<br />Redirect the user to the Link App.
    User-->>Android: Enter Acciona username and password
    Android->>AccionaLogin: Submit the credentials to the API
    AccionaLogin->>AccionaClient: Authenticate
    AccionaClient->>Acciona Servers: Submit the HTTP request
    Acciona Servers-->>User: Send a code via SMS
    Acciona Servers->>AccionaClient: 
    AccionaClient->>AccionaLogin: 
    AccionaLogin->>Android: 
    User-->>Android: Enter the SMS code
    Android->>AccionaLogin: 
    AccionaLogin->>AccionaClient: 
    AccionaClient->>Acciona Servers: 
    Acciona Servers->>AccionaClient: Return a refresh token
    AccionaClient->>AccionaLogin: Forward the refresh token
    AccionaLogin->>Android: Return an auth code
    Android->>Alexa: Return the user to the app.<br/>Forward the auth code.
    Alexa->>AccionaLogin: Exchange the auth code.<br />Authenticates using the client secret.
    AccionaLogin->>Alexa: Return a refresh token and an access token
    Alexa->>User: Account successfully linked
```

## User request flow

Here's a breakdown of how the modules interact with each other when the user
asks Alexa to open the skill.

```mermaid
sequenceDiagram
    actor User
    participant Alexa
    participant AccionaLogin as acciona-login
    participant AlexaSkill as alexa-skill
    participant AccionaClient as acciona-client
    participant Acciona Servers
    User-->>Alexa: Open "Las Motillos"
    opt expired token
        Note right of Alexa: The Alexa servers store and manage the access and refresh<br/>tokens returned by the login flow. If the access token<br/>expires, Alexa authenticates against our API. 
        Alexa->>AccionaLogin: Refresh the access token.<br/>Sends the refresh token.<br/>Authenticates using the client secret.
        AccionaLogin->>AccionaClient: 
        AccionaClient->>Acciona Servers: 
        Acciona Servers->>AccionaClient: Return an access token
        AccionaClient->>AccionaLogin: Forward the access token
        AccionaLogin->>Alexa: Forward the access token
    end
    Alexa->>AlexaSkill: Send the user request.<br/>Send the Acciona access token.
    AlexaSkill->>AccionaClient: Process the user request.<br/>Interact with Acciona.
    AccionaClient->>Acciona Servers: 
    Acciona Servers->>AccionaClient: 
    AccionaClient->>AlexaSkill: Process the data returned by Acciona.<br/>Generate a response for the user.
    AlexaSkill->>Alexa: Return the Alexa response
    Alexa-->>User: I've found those motorbikes: (...)<br/>Which one would you like to reserve?
    User-->>Alexa: The one on (...)
    Alexa->>AlexaSkill: 
    AlexaSkill->>AccionaClient: 
    AccionaClient->>Acciona Servers: 
    Acciona Servers->>AccionaClient: 
    AccionaClient->>AlexaSkill: 
    AlexaSkill->>Alexa: 
    Alexa-->>User: I've reserved the motorbike on (...)
    
```
