# las-motillos

Las Motillos is an Alexa skill that allows interacting with
[Acciona Mobility][Acciona]. Users can ask Alexa where the nearest motorbikes
are and to make a reservation for them.

https://user-images.githubusercontent.com/11708035/214916543-ded97855-1d8a-4b9a-8b55-5b0077e09754.mp4

The skill is not published because Acciona doesn't support OAuth. Thus, it isn't
possible to securely delegate access to your Acciona account to the Las Motillos
skill. Instead, authentication works by calling reverse engineered endpoints
from the Android app.

If you're interested in using the skill, feel free to
[contact me on Twitter][My-twitter]!

**Disclaimer: I do not own the Acciona nor the Acciona Mobility trademarks, and
I am not affiliated with Acciona in any way.**

## Project Architecture

This projects has multiple components. In order to learn how to navigate the
code, check out [ARCHITECTURE.md](ARCHITECTURE.md).

[Acciona]: https://movilidad.acciona.com/en_ES/madrid/
[My-twitter]: https://twitter.com/pabcrab
