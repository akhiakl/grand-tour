# Changelog

## [0.2.0](https://github.com/akhiakl/grand-tour/compare/v0.1.0...v0.2.0) (2026-08-02)


### Features

* add draft-trip transforms and AI handoff for the editor ([6c8b89e](https://github.com/akhiakl/grand-tour/commit/6c8b89e3b1aa283d25c468620057e156df6a78be))
* add field-atlas design system, fonts, theming and shadcn base ([2abf013](https://github.com/akhiakl/grand-tour/commit/2abf0131851de26cf3fe9a512bf0c63b0782f485))
* add groq trip generation with validation retry ([87597ea](https://github.com/akhiakl/grand-tour/commit/87597eac943eb29f9a695fb982a338452fbdb87c))
* add guest-limit UpsellModal ([b6ece8f](https://github.com/akhiakl/grand-tour/commit/b6ece8f293c1f5dcdc5acff7f0c5aad6768da750))
* add interactive map with animated brass route ([2d2f8c4](https://github.com/akhiakl/grand-tour/commit/2d2f8c46f2d0f7d539cb32b16a2a269678973d49))
* add local trip store and Nominatim geo-search domain ([b981add](https://github.com/akhiakl/grand-tour/commit/b981addd65d8bf5322d369c3277863a72f37592c))
* add manual trip editor with local persistence and sharing ([8b2af2d](https://github.com/akhiakl/grand-tour/commit/8b2af2d78d80c3dba3ca63c316d3feec98863303))
* add Map View page, redesign My Maps cards, and name all routes ([4cfa5c3](https://github.com/akhiakl/grand-tour/commit/4cfa5c333e28bc5db396ee459558a48b0ed5a5af))
* add per-ip rate limiting for public api routes ([6fb7f28](https://github.com/akhiakl/grand-tour/commit/6fb7f2895191f7cd406873e84573f0f2f74f4826))
* add redis trip service layer with sliding ttl ([f835355](https://github.com/akhiakl/grand-tour/commit/f8353558413efad8d77df7d9e5fd1af6097be719))
* add sentry monitoring gated on dsn ([71e558c](https://github.com/akhiakl/grand-tour/commit/71e558c11ffbc0d656ddfa589cf0ba72a90a28c6))
* add timeline rail, city drawer and trip experience ([5bb1801](https://github.com/akhiakl/grand-tour/commit/5bb1801a1b3e4801f3deb781e28d9972643ded29))
* add trip geometry helpers and sample grand tour data ([b0c03eb](https://github.com/akhiakl/grand-tour/commit/b0c03ebb951a12444196058c042961c51015a1f3))
* add trip schema with guest limits and validation tests ([c089c38](https://github.com/akhiakl/grand-tour/commit/c089c3856046f5bddfc39dc772c8117cc21ac691))
* add trip stats and curved route geometry ([ee8a9b5](https://github.com/akhiakl/grand-tour/commit/ee8a9b5805d6966803c2515e14da51d3a69500a1))
* Add trip stats, curved route geometry, and design references ([a2a4a2f](https://github.com/akhiakl/grand-tour/commit/a2a4a2f21d2d1a8a6a587eb20971f8a85cda02bb))
* add trips api enforcing guest city limit and payload cap ([e38996a](https://github.com/akhiakl/grand-tour/commit/e38996ab196056bb5a96ad6420577e58dab05e3a))
* cross-link home, editor, and My Maps ([395027d](https://github.com/akhiakl/grand-tour/commit/395027d7ad8b23084714e6e475076c3fee58e25b))
* draw themed basemap tiles under the route poster ([#20](https://github.com/akhiakl/grand-tour/issues/20)) ([a1867ee](https://github.com/akhiakl/grand-tour/commit/a1867eeddd659073a564be57a9b1a8ed682f7724))
* manual editor, share flow, and My Maps (step 4) ([1e5623b](https://github.com/akhiakl/grand-tour/commit/1e5623b820a9a073f36e24a7ca36c1256ca46aa3))
* phase 1 foundation — immersive map experience, apis and tooling ([#19](https://github.com/akhiakl/grand-tour/issues/19)) ([abd7cd2](https://github.com/akhiakl/grand-tour/commit/abd7cd28fc2805767f8ace7caa063f6f671e24cf))
* port field-atlas reference design to immersive experience ([25bc8bf](https://github.com/akhiakl/grand-tour/commit/25bc8bff51276e7994f773ec3465979230b5a93f))
* shared trip view, OG image, and remix (step 5) ([7684f46](https://github.com/akhiakl/grand-tour/commit/7684f463c5f80ad6f03ca5537894613e486bc8ee))
* **trip:** add interactive map and city experience. ([84efc57](https://github.com/akhiakl/grand-tour/commit/84efc573a7807cd60bf902c00dd560dffc6d2731))
* updating sentry configs ([f5720bc](https://github.com/akhiakl/grand-tour/commit/f5720bcc93f62d31c034da68335bf231930a9977))
* vendor editor-related shadcn primitives ([83163a6](https://github.com/akhiakl/grand-tour/commit/83163a66d4371d02e8b53b1397795d75f6047ead))
* vendor sheet, tabs, checkbox, badge and separator primitives ([5df5604](https://github.com/akhiakl/grand-tour/commit/5df5604d18fd8bf6a2d345f6d8453e1d69040268))


### Bug Fixes

* gate Sentry init on DSN, escape divIcon HTML, associate checklist labels ([72a84f6](https://github.com/akhiakl/grand-tour/commit/72a84f6bf7a15957529e5dfb71531beb2fedf3e9))
