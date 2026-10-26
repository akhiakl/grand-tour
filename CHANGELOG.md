# Changelog

## [0.3.0](https://github.com/akhiakl/grand-tour/compare/v0.2.0...v0.3.0) (2026-10-26)


### Features

* **ai:** turn cities beyond the guest limit into ghost stops ([#87](https://github.com/akhiakl/grand-tour/issues/87)) ([3b420f0](https://github.com/akhiakl/grand-tour/commit/3b420f0effcd7db51cc77e4ede0c60f80b4498bb))

## [0.2.0](https://github.com/akhiakl/grand-tour/compare/v0.1.0...v0.2.0) (2026-10-26)


### Features

* add /about story page and settle map motion ([#53](https://github.com/akhiakl/grand-tour/issues/53)) ([fd1bff7](https://github.com/akhiakl/grand-tour/commit/fd1bff78b8bda5782b85588fda54bc6fb186b6d8))
* add destination search and returning-visitor start to the landing ([#54](https://github.com/akhiakl/grand-tour/issues/54)) ([20c33e1](https://github.com/akhiakl/grand-tour/commit/20c33e189bfad0e5df1cab0bf205b3a3a846900f))
* add draft-trip transforms and AI handoff for the editor ([6c8b89e](https://github.com/akhiakl/grand-tour/commit/6c8b89e3b1aa283d25c468620057e156df6a78be))
* add field-atlas design system, fonts, theming and shadcn base ([2abf013](https://github.com/akhiakl/grand-tour/commit/2abf0131851de26cf3fe9a512bf0c63b0782f485))
* add groq trip generation with validation retry ([87597ea](https://github.com/akhiakl/grand-tour/commit/87597eac943eb29f9a695fb982a338452fbdb87c))
* add guest-limit UpsellModal ([b6ece8f](https://github.com/akhiakl/grand-tour/commit/b6ece8f293c1f5dcdc5acff7f0c5aad6768da750))
* add i18n, offline support, print styles, and trip enhancements ([#51](https://github.com/akhiakl/grand-tour/issues/51)) ([cab6897](https://github.com/akhiakl/grand-tour/commit/cab68974809922ceaaa14458eb4fffd2faa3c2b4))
* add interactive map with animated brass route ([2d2f8c4](https://github.com/akhiakl/grand-tour/commit/2d2f8c46f2d0f7d539cb32b16a2a269678973d49))
* add legal pages, map reporting, AI notice and analytics ([#52](https://github.com/akhiakl/grand-tour/issues/52)) ([47d5b13](https://github.com/akhiakl/grand-tour/commit/47d5b136ad24f9312bf77ff85de59b66ea51827d))
* add local trip store and Nominatim geo-search domain ([b981add](https://github.com/akhiakl/grand-tour/commit/b981addd65d8bf5322d369c3277863a72f37592c))
* add manual trip editor with local persistence and sharing ([8b2af2d](https://github.com/akhiakl/grand-tour/commit/8b2af2d78d80c3dba3ca63c316d3feec98863303))
* add Map View page, redesign My Maps cards, and name all routes ([4cfa5c3](https://github.com/akhiakl/grand-tour/commit/4cfa5c333e28bc5db396ee459558a48b0ed5a5af))
* add per-ip rate limiting for public api routes ([6fb7f28](https://github.com/akhiakl/grand-tour/commit/6fb7f2895191f7cd406873e84573f0f2f74f4826))
* add redis trip service layer with sliding ttl ([f835355](https://github.com/akhiakl/grand-tour/commit/f8353558413efad8d77df7d9e5fd1af6097be719))
* add sentry monitoring gated on dsn ([71e558c](https://github.com/akhiakl/grand-tour/commit/71e558c11ffbc0d656ddfa589cf0ba72a90a28c6))
* add the AI chat flow with ghost-stop upsell (step 6) ([#43](https://github.com/akhiakl/grand-tour/issues/43)) ([68d080c](https://github.com/akhiakl/grand-tour/commit/68d080cb15483c2029732c950262029ce83fd282))
* add the landing CTAs and polish pass (step 7) ([#45](https://github.com/akhiakl/grand-tour/issues/45)) ([ad15116](https://github.com/akhiakl/grand-tour/commit/ad15116d0eb700aa9a437c8cb3ecf60f3b89a84e))
* add timeline rail, city drawer and trip experience ([5bb1801](https://github.com/akhiakl/grand-tour/commit/5bb1801a1b3e4801f3deb781e28d9972643ded29))
* add trip geometry helpers and sample grand tour data ([b0c03eb](https://github.com/akhiakl/grand-tour/commit/b0c03ebb951a12444196058c042961c51015a1f3))
* add trip schema with guest limits and validation tests ([c089c38](https://github.com/akhiakl/grand-tour/commit/c089c3856046f5bddfc39dc772c8117cc21ac691))
* add trip stats and curved route geometry ([ee8a9b5](https://github.com/akhiakl/grand-tour/commit/ee8a9b5805d6966803c2515e14da51d3a69500a1))
* Add trip stats, curved route geometry, and design references ([a2a4a2f](https://github.com/akhiakl/grand-tour/commit/a2a4a2f21d2d1a8a6a587eb20971f8a85cda02bb))
* add trips api enforcing guest city limit and payload cap ([e38996a](https://github.com/akhiakl/grand-tour/commit/e38996ab196056bb5a96ad6420577e58dab05e3a))
* **ai:** log every failure path, optional reasoning effort and token cap ([#78](https://github.com/akhiakl/grand-tour/issues/78)) ([6016a8d](https://github.com/akhiakl/grand-tour/commit/6016a8d45cf9cb1e4fdbd4173e982a49e9a82832))
* allow a self-hosted map style via NEXT_PUBLIC_MAP_STYLE_URL ([#39](https://github.com/akhiakl/grand-tour/issues/39)) ([ea1ed11](https://github.com/akhiakl/grand-tour/commit/ea1ed11a838a8868e61e57de409587b0aa4703ea))
* consolidate the trip view into a floating atlas card ([#46](https://github.com/akhiakl/grand-tour/issues/46)) ([e9a17da](https://github.com/akhiakl/grand-tour/commit/e9a17da8094528567d1f95b0048bb301b0bcf436))
* cross-link home, editor, and My Maps ([395027d](https://github.com/akhiakl/grand-tour/commit/395027d7ad8b23084714e6e475076c3fee58e25b))
* draw themed basemap tiles under the route poster ([#20](https://github.com/akhiakl/grand-tour/issues/20)) ([a1867ee](https://github.com/akhiakl/grand-tour/commit/a1867eeddd659073a564be57a9b1a8ed682f7724))
* **editor:** announce moves, undo deletes, grip-only drag and active stop ([#55](https://github.com/akhiakl/grand-tour/issues/55)) ([b4d09ea](https://github.com/akhiakl/grand-tour/commit/b4d09ead70f5209d012c4dd387d74d8a78d06ad3))
* harden the trip view's map focus, hover sync and card layout ([#50](https://github.com/akhiakl/grand-tour/issues/50)) ([d851498](https://github.com/akhiakl/grand-tour/commit/d851498f4d5db1a29e2e1b4ebfdaaf10e5d80581))
* let viewers pick distance units and display currency ([#47](https://github.com/akhiakl/grand-tour/issues/47)) ([9458a19](https://github.com/akhiakl/grand-tour/commit/9458a19d011aad77b07d6fcd438c31c77b188727))
* manual editor, share flow, and My Maps (step 4) ([1e5623b](https://github.com/akhiakl/grand-tour/commit/1e5623b820a9a073f36e24a7ca36c1256ca46aa3))
* phase 1 foundation — immersive map experience, apis and tooling ([#19](https://github.com/akhiakl/grand-tour/issues/19)) ([abd7cd2](https://github.com/akhiakl/grand-tour/commit/abd7cd28fc2805767f8ace7caa063f6f671e24cf))
* port field-atlas reference design to immersive experience ([25bc8bf](https://github.com/akhiakl/grand-tour/commit/25bc8bff51276e7994f773ec3465979230b5a93f))
* replace raster tiles with MapLibre vector basemap ([#36](https://github.com/akhiakl/grand-tour/issues/36)) ([cb4834f](https://github.com/akhiakl/grand-tour/commit/cb4834fe4a69313c1a0c37367ff4e5ce2554f11c))
* shared trip view, OG image, and remix (step 5) ([7684f46](https://github.com/akhiakl/grand-tour/commit/7684f463c5f80ad6f03ca5537894613e486bc8ee))
* show an in-voice retry toast when the basemap can't load ([#40](https://github.com/akhiakl/grand-tour/issues/40)) ([b649815](https://github.com/akhiakl/grand-tour/commit/b649815346d138739e74d2d8ffe80616587f727e))
* trace AI and Redis calls in Sentry and add an uptime probe ([#73](https://github.com/akhiakl/grand-tour/issues/73)) ([60fef7a](https://github.com/akhiakl/grand-tour/commit/60fef7a2b113e84585a1e735fa5e158b08d688a6))
* **trip:** add interactive map and city experience. ([84efc57](https://github.com/akhiakl/grand-tour/commit/84efc573a7807cd60bf902c00dd560dffc6d2731))
* updating sentry configs ([f5720bc](https://github.com/akhiakl/grand-tour/commit/f5720bcc93f62d31c034da68335bf231930a9977))
* vendor editor-related shadcn primitives ([83163a6](https://github.com/akhiakl/grand-tour/commit/83163a66d4371d02e8b53b1397795d75f6047ead))
* vendor sheet, tabs, checkbox, badge and separator primitives ([5df5604](https://github.com/akhiakl/grand-tour/commit/5df5604d18fd8bf6a2d345f6d8453e1d69040268))


### Bug Fixes

* **ai:** log the model endpoint's HTTP status on upstream failures ([#77](https://github.com/akhiakl/grand-tour/issues/77)) ([b88d309](https://github.com/akhiakl/grand-tour/commit/b88d309b7a969f9fc4fec39d57bc7c38e93eb29b))
* **ai:** retry once when the provider rejects malformed JSON ([#80](https://github.com/akhiakl/grand-tour/issues/80)) ([c9260e9](https://github.com/akhiakl/grand-tour/commit/c9260e9076c76b856c1e1265635d6e014b99e5d2))
* cut startup JavaScript on mobile ([#57](https://github.com/akhiakl/grand-tour/issues/57)) ([85bf7a0](https://github.com/akhiakl/grand-tour/commit/85bf7a05e74ecf77bde396c4563cf1a47f7c2748))
* **editor:** resolve drafts after mount and show inline validation ([#49](https://github.com/akhiakl/grand-tour/issues/49)) ([aebc1ef](https://github.com/akhiakl/grand-tour/commit/aebc1ef10551d92132a14f0efad6d43f88e27488))
* gate Sentry init on DSN, escape divIcon HTML, associate checklist labels ([72a84f6](https://github.com/akhiakl/grand-tour/commit/72a84f6bf7a15957529e5dfb71531beb2fedf3e9))
* handle poster render failures instead of a floating promise ([#41](https://github.com/akhiakl/grand-tour/issues/41)) ([7add46c](https://github.com/akhiakl/grand-tour/commit/7add46c872e925cedb3b526be4dd1a06364003a2))
* keyboard focus, in-voice states and stable stop keys ([#58](https://github.com/akhiakl/grand-tour/issues/58)) ([5102e5f](https://github.com/akhiakl/grand-tour/commit/5102e5fc7a437feced05ac42065d4769f272f253))
* load the trip panel's hidden parts after first paint ([#59](https://github.com/akhiakl/grand-tour/issues/59)) ([3d89e46](https://github.com/akhiakl/grand-tour/commit/3d89e4694114be86f1de547d7444bff924fa0baa))
* log handled failures, warnings and key events to Better Stack ([#76](https://github.com/akhiakl/grand-tour/issues/76)) ([46f4dbd](https://github.com/akhiakl/grand-tour/commit/46f4dbd0e6fd695200b9744ef766a076571d7172))
* use Photon for city search instead of public Nominatim ([#38](https://github.com/akhiakl/grand-tour/issues/38)) ([4ee5566](https://github.com/akhiakl/grand-tour/commit/4ee5566018476ac7434b6e656b9ee7ca4bd2d349))
