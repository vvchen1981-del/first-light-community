# Community 1.0.0 validation

Date: 2026-10-20. This is a local, static-web release candidate, not evidence of a live GitHub Pages deployment or an iOS release.

## Passed

- Node-based content/resource tests: two 66-book, 1,189-chapter editions; 31,021 Chinese verse entries and 31,103 English entries; all 141 copied-resource hashes; five bilingual lessons and valid references; four distinct attributed image files; public entry points; exact two-edition verse-range index.
- Static build using an explicit public-file allowlist. No npm runtime dependencies or application service credentials.
- Thirteen functional groups on installed Chrome through Playwright, using an isolated context: home and reader, search and no results, bookmark persistence/removal, chapter progress, combined-verse focus, book/chapter navigation, English notes-only verse display, edition-specific verse-number bookmark regression, all five lessons, all four artwork records and passage links, export/import roundtrip, malformed import rejection, and repository subpath loading.
- No uncaught page errors or HTTP error responses in that functional run.
- 320px and 390px layouts checked for horizontal overflow. Desktop and mobile screenshots inspected.
- Skip-to-content retains the route and moves keyboard focus into the main content.
- Four **mocked speech-control** groups: pending/start/pause/resume; advance without duplicate late callbacks; navigation cancellation; no-start recovery. The simulated start timer was accelerated for this control-only test.

## Actual speech result and limits

The browser reported installed Chinese and English OS voices. Real speech requests in the headless Chrome environment returned `synthesis-failed` for both languages. The application displayed its failure message and recovered controls. Actual audible sequential playback and naturalness are **not accepted** by this run. Mocked controls do not prove sound output or audio quality.

Before recommending read-aloud publicly, check Chinese and English on ordinary user-facing Chrome, Edge and Safari, including iPhone/Android where available: start, pause/resume, stop, sequential verses, navigation interruption, and the absence of overlapping sound. This app uses device voices, not the original app's cloud TTS.

## Publication boundaries

- GitHub Actions is prepared but has not run on a remote repository.
- No repository, live demo URL, native app or TestFlight build was published in this task.
- Rights records were rechecked against linked eBible and NGA pages on the review date. This does not constitute jurisdiction-wide legal clearance for every later use.
- No claim of service-worker offline installation, accounts, cloud sync or data migration from the full app.
