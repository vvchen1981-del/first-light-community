# Community 1.1.0 validation

Date: 2026-10-20. This update adds English-first onboarding, persistent language links, page sharing, and device-speech queue fixes. Historical 1.0.0 evidence follows unchanged below.

## Current version checks

- Seven Node content/resource tests and the allowlisted static build pass.
- Thirteen browser functional groups pass, including both editions, all lessons/artwork, saved records, backup/import, narrow screens and project subpaths.
- Six adoption/share checks pass: English first visit, retained Chinese preference, language-aware artwork/lesson/verse links, and feedback entry. Clipboard fallback was exercised in an isolated browser with native sharing unavailable; the native OS share sheet was not submitted to any recipient.
- Four simulated speech-state regression groups pass. These are control tests, separate from the real engine evidence below.
- Actual headed Windows Chrome, using Microsoft Huihui (zh-CN) and Microsoft David (en-US): start, native pause/resume, automatic advance to verse two, navigation while paused, return/restart, and explicit stop pass. Cancellation produces expected interrupted events, which do not restart the old reading.
- Windows system-output loopback (no microphone): both languages produce nonzero audio during playback, resume and the next verse; pause and language switching return to the silent baseline. The virtual output device required a warm-up to drain old audio. An initial undrained measurement was rejected, not treated as acceptance.
- Desktop and mobile rendered screenshots reviewed. English README screenshot updated from the working interface.

Audio sample: Psalm 117 in both editions. Loopback acceptance uses PCM RMS > 50 for audible phases and < 5 for silent phases (16-bit samples). This establishes sound output and controls on this environment, not a subjective claim about naturalness, voice quality, all verses, all browsers, iOS or Android. Device voice availability remains platform-dependent. The earlier headless failures below remain historical evidence of that environment.

## Public update

GitHub Actions runs content validation and builds before deployment. The deployment workflow linked below is the authoritative published status; local checks alone do not establish deployment.

---

# Community 1.0.0 validation

Date: 2026-10-20. The test evidence below was collected locally before publication. It does not establish iOS acceptance. Subsequent publishing uses the public repository and workflow linked at the end of this document.

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

## Boundaries of the original local test run

- At the time of that local test run, GitHub Actions had not run remotely and no repository or live demo had been published.
- No native app or TestFlight build was published.
- Rights records were rechecked against linked eBible and NGA pages on the review date. This does not constitute jurisdiction-wide legal clearance for every later use.
- No claim of service-worker offline installation, accounts, cloud sync or data migration from the full app.

## Subsequent public deployment

- Repository: https://github.com/vvchen1981-del/first-light-community
- Website: https://vvchen1981-del.github.io/first-light-community/
- Actual build and deployment records: https://github.com/vvchen1981-del/first-light-community/actions/workflows/pages.yml
- The workflow runs content tests and a static build before deploying. This remote check is distinct from the browser interaction tests and from actual device audio listening.
