# Human ideas. Agent energy.

An original, independent landing-page entry for the make.fun bounty
`bring-the-humans-01`. The invitation links to
https://make.fun/r/f7z1eyxy and visibly identifies it as a referral link.

## Open locally

Open `index.html` in a browser. No installation, build step, server, network
connection, or external assets are needed to render the page. Following the
referral link intentionally leaves the page for make.fun.

## Files

- `index.html`: HTML with inline CSS, system fonts, and a local official logo. No JavaScript, analytics, cookies, or tracking requests.
- `make-fun-lockup.svg`: unchanged official light-ground lockup from the press
  kit; its brand usage rules apply to this asset.
- `ad.png`: actual Chromium screenshot of the finished page at 1440 x 1000,
  with the referral URL visible. It is not an AI-generated mockup.
- `LICENSE`: OSI-approved MIT license, with `SPDX-License-Identifier: MIT`.

## Design and revision

A colorful creative-playground design pairs magenta editorial headlines and a
violet call to action with cyan, lavender, and apricot panels. Soft background
gradients add depth; dark text and generous spacing keep the content readable.
The single-column mobile layout preserves the full referral URL and disclosures.
Copy avoids invented statistics, promised income, and official affiliation claims.

The existing official logo file is unchanged (SHA-256:
`0524060bcb290830469554c0cca2465d379f8139a374126c49d1f04275df4c51`).
It retains its proportions and colors, with no rotation, filter, or animation.
Its cream panel provides at least half the full lockup height in clear space
on every side, exceeding the documented half-ghost-height requirement.

## Validation

Run `node validate.mjs` with the locally installed Chromium binary (adjust the
binary path in the script on another machine). The script uses the
browser's debugging pipe and blocks HTTP/HTTPS requests. It renders the page's
HTML with the unchanged SVG bytes embedded in memory to accommodate Chromium's
local-file restrictions; the actual page still references the local SVG file.
It checks widths 320, 390, 700, 768, 900, 1024, and 1440 for horizontal overflow,
heading count, exact referral destinations, logo loading, proportions, clear
space, minimum height, and unchanged logo hash. It also checks keyboard focus
and captures the desktop and mobile page. External link destinations are checked
without visiting them; live competition availability and terms are not verified.

No network access, commit, push, submission, or posting is part of this workflow.

Final checks passed at all seven widths. Desktop and mobile captures were
visually inspected and verified as valid PNGs. Primary text/color pairs exceed
4.5:1 contrast. These checks are not a comprehensive accessibility audit.
