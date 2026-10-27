# AdSense operations

The publisher is `ca-pub-2835838153738108`. Slot IDs live in
`src/constants/adsense.js`; `public/ads.txt` authorizes the same publisher.
The account meta tag in `_document.js` supports site verification without
running ad code before React hydrates.

The Market Reliability Index uses display slot `5980166475` in three places:
above the league rankings, after the team lookup, and below the team tables.
These placements render only when the league dataset is available and stay
outside the shareable table captures.

The stats hubs (`/fixtureshigh/`, `/highest-scoring-leagues/`, and
`/bttsfixtures/`) each render Multiplex slot `2211241657` below their content,
before the site footer, through `StatsFooterAd`. It uses `autorelaxed` format.

## Before deploying the Journey migration

- In AdSense → Sites, confirm `soccerstatshub.com` is ready to serve ads and its
  ads.txt status is authorized. Check the Policy center too.
- In Privacy & messaging, publish a **European regulations** message for the
  site, using `https://www.soccerstatshub.com/privacy/` as the privacy URL (use
  the site's canonical hostname). The AdSense script loads the published Google
  CMP; the old Journey consent setup does not migrate automatically. Test with
  `?fc=alwaysshow&fctype=gdpr` and verify the consent revocation link appears.
  Configure US state messages where applicable.
- Slot types were confirmed from the account screenshot on 26 October 2026 and
  recorded in `ADSENSE_SLOT_VARIANTS`. Display uses `auto`; In-article uses
  `fluid` plus `in-article`; Multiplex uses `autorelaxed`. Update that mapping
  whenever replacing a unit in the account. Home mid content, Fixtures index
  bottom, and Fixture page top are all In-article units.
- End Journey ad serving and any associated account-side setup as required by
  that service. Its tags, Grow script, and reseller ads.txt entries are removed
  from this application.

Google's setup instructions: [European regulations messages](https://support.google.com/adsense/answer/10960768),
[certified CMP requirements](https://support.google.com/adsense/answer/13554116),
and [testing messages](https://support.google.com/adsense/answer/10924669).

## Rendering and verification

Real ad requests are enabled only in production (`npm run build` followed by
`npm start`). Unit and browser checks should stub Google's script rather than
requesting live ads. Development renders empty markers.

With the production server running on port 3100, run the mocked browser checks:

```sh
PW_TEST_NO_WEBSERVER=1 PW_ADSENSE_PRODUCTION=1 PORT=3100 npm run test:e2e -- e2e/adsense-production.spec.ts --workers=1
```

Units reserve at least 280px, load within 400px of the viewport, and wait for a
measurable container. Hidden mobile sidebars do not create ad elements. Each
element receives one push, including when several placements mount before
Google's script loads. Only a change of page pathname remounts a placement;
query strings, anchor jumps, filters and ordinary re-renders do not refresh it.
The legacy `JourneyContentBreak` name remains for existing article templates.

## Revenue experiments

Compare at least two full weeks with a consistent traffic mix before drawing
conclusions. Track page RPM, total earnings, Active View viewability, coverage,
and CLS separately for mobile/desktop and for each major page type. More ad
requests alone do not establish an earnings improvement.

- Keep responsive sizing enabled. For In-article units, consider enabling
  selected display ads and Google-optimized styles in the account to expand
  eligible demand. [Google's In-article guidance](https://support.google.com/adsense/answer/9189562).
- Use AdSense experiments to evaluate Auto ads (particularly anchors) against
  the manual-placement baseline. Check mobile navigation and spacing before
  keeping additional formats; don't enable all in-page Auto ads on top of the
  existing manual units without measuring the resulting density.
- Use placement reports to decide whether lazy loading's viewability benefit
  outweighs reduced requests for lower-page inventory. Adjust the preload margin
  if fast scrolling or slower connections leave visible placements unfilled.
- No timer-based ad refresh is implemented.
