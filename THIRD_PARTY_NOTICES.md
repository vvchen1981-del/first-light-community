# Content and resource notices / 内容与资源许可

Reviewed 2026-10-20. Resource identity hashes: `data/reused-resource-hashes.json`.
These notices distinguish software, scripture, images and fonts. No institution endorses this application.

## Scripture

The shipped JSON preserves the project's publisher-derived text without rewriting verses.
Both editions contain the 66-book protocanon. This is a defined edition scope, not a claim that every Christian tradition uses the same canon.

- **新标点和合本（简体） / Chinese Union Version (simplified), cmn-cu89s.**
  Publisher declares Public Domain: https://ebible.org/cmn-cu89s/copyright.htm
- **World English Bible, engwebp, 66-book edition.**
  Public Domain: https://ebible.org/engwebp/copyright.htm
  “World English Bible” is a trademark of eBible.org. If you alter the translation text, do not present the altered text as the World English Bible.
- Preserved source edition metadata and original archive hashes: `data/bible/provenance.json`.
  Original project acquisition date: 2026-09-07. The text has not been replaced with the latest publisher download in this release.
- Chinese verse bridges and edition-specific verse numbering are retained. Do not invent missing verse text or translate one edition to fill another.

## Museum images

Courtesy National Gallery of Art, Washington.
The four linked object pages mark their media free and in the public domain. NGA's Open Access policy releases eligible images under CC0:
https://www.nga.gov/terms-and-notices
CC0: https://creativecommons.org/publicdomain/zero/1.0/

| Work | Artist / attribution | Date | Collection and source |
|---|---|---|---|
| The Annunciation | Fra Filippo Lippi | c. 1435/1440 | Samuel H. Kress Collection, 1943.4.35 — https://www.nga.gov/artworks/12133-annunciation |
| The Adoration of the Magi | Fra Angelico / Fra Filippo Lippi | c. 1440/1460 | Samuel H. Kress Collection, 1952.2.2 — https://www.nga.gov/artworks/41581-adoration-magi |
| The Finding of Moses | Veronese | c. 1581/1582 | Andrew W. Mellon Collection, 1937.1.38 — https://www.nga.gov/artworks/45-finding-moses |
| Christ at the Sea of Galilee | Anonymous artist, probably Lambert Sustris; attribution uncertain | c. 1570s | Samuel H. Kress Collection, 1952.5.27 — https://www.nga.gov/artworks/41637-christ-sea-galilee |

Image URLs, file hashes, medium and credit lines are in `data/art.json`. These are the preserved normalized project images, not newly downloaded museum files.
Chinese and English guide text is original concise editorial writing based on the linked object records and cited Bible passages, not a reproduction of the museum's prose.
“Looking prompt / 编辑观察” is explicitly an editorial invitation, not a museum assertion or scripture.
NGA's policy does not grant endorsement or guarantee rights under every jurisdiction. Preserve attribution and recheck terms if adding other assets or changing the use.

## Fonts

- Cinzel: Copyright 2020 The Cinzel Project Authors. SIL Open Font License 1.1; full notice in `assets/fonts/cinzel-OFL.txt`.
- EB Garamond-derived subset: SIL Open Font License 1.1; full notice in `assets/fonts/EBGaramond-OFL.txt`.
- Provenance for the reused subsets: `data/font-provenance.json`. CSS uses distinct First Light family names for subsets.
- Chinese uses the user's system serif fonts; no proprietary Chinese font is redistributed.

## Code and editorial writing

New Community application source and original short learning guides are covered by the root MIT license. That license does not relicense third-party works or authorize use of protected marks. Browser and operating-system voices are not bundled or licensed by this repository.
