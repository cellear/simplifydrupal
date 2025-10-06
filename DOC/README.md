## React Frontend for Simplify Drupal (Experiment)

This document summarizes the approach we took to stand up a small React Single-Page App (SPA) that reads content from the existing Drupal site and renders a “Daily Tips” experience. The goal was to keep it minimal, transparent, and easy to reason about, while matching the Drupal home page behavior: show a list of tip teasers, and reveal full content (with image) in-place when a tip is clicked.

### High-level Goals
- **Experiment with React** against the existing Drupal site, without heavy changes to Drupal.
- **One-page UI**: list of tips on one page; full content appears in-place on click.
- **Use JSON:API** as the data source; avoid custom backends.
- **Serve React from Drupal** to avoid CORS complexity.

## Architecture Overview

- **Frontend**: Create React App (CRA)
  - Components: `App`, `TipList`, `TipDetail`
  - State: `tips[]`, `selectedTip`, `loading`
  - Fetch: `fetch('/jsonapi/node/article?include=field_image')`, using JSON:API from Drupal
  - Image style: build image URLs for the `tips_view_250px` style

- **Backend**: Existing Drupal site
  - Modules: JSON:API enabled (granting read access for this experiment)
  - Image styles: `tips_view_250px` used to produce thumbnails
  - Hosting React build at `web/react-app/` and visiting via `/react-app`

- **Why serve the React build from Drupal?**
  - Avoids browser CORS issues entirely by sharing the same origin
  - Simplifies local development with DDEV and reduces configuration steps

## Data Flow

1. On load, `App` requests: `/jsonapi/node/article?include=field_image`.
2. We map JSON:API `data[]` to an internal tip model:
   - `id`: `attributes.drupal_internal__nid`
   - `title`: `attributes.title`
   - `content`: `attributes.body.processed` (used only when a tip is opened)
   - `image`: derived from `included[]` `file--file` that matches `relationships.field_image`
3. For images, we convert the file URL to the `tips_view_250px` image style path so thumbnails load efficiently.
4. `TipList` renders a grid of cards (title + “Click to read more”).
5. On click, `TipDetail` renders an overlay with full content and image.

## Key Files

- `react-app/src/App.js`
  - Fetches JSON:API, transforms data, manages `selectedTip` and `loading`.
  - Builds image URLs using the `tips_view_250px` style.

- `react-app/src/TipList.js`
  - Displays a grid of 31 (or 33) tips. Each card is clickable.

- `react-app/src/TipDetail.js`
  - Overlay modal shown when a tip is selected; renders `title`, `content`, and image.

- `react-app/src/App.css`
  - Grid layout for cards, hover/click affordances, modal overlay styling.

- `web/react-app/`
  - The production build artifacts deployed under Drupal’s web root.

## Drupal Configuration (Minimal)

- Enabled JSON:API (core) with permissive access for this experiment.
- Confirmed article nodes and images are available through JSON:API.
- Leveraged existing image style: `tips_view_250px`.

## Build and Deploy Flow

We deploy the React app under Drupal’s `web/` directory so the app and API share the same origin.

1. Develop locally with CRA dev server if desired:
   - `cd react-app`
   - `npm start`

2. Build production assets:
   - `cd react-app && npm run build`

3. Copy the build into Drupal’s web root subdirectory:
   - `cp -r react-app/build/* web/react-app/`

4. Access the app at `/react-app` on the Drupal site domain.

Notes:
- `homepage` in `react-app/package.json` is set to `/react-app` so asset paths are correct when hosted in a subdirectory.
- Serving from the same origin removes the need for CORS settings in Drupal.

## Why JSON:API (instead of REST UI/endpoints)?

- JSON:API is core, consistent, and returns rich relationship data (`included[]`) that simplifies joining related entities (e.g., images).
- It avoids custom endpoint work and allows quick iteration on the frontend.

## Troubleshooting Notes

- Blank page when opening built HTML with `wget` or `curl` is expected; React renders content client-side in the browser.
- If assets 404 or load as `text/html`, ensure `homepage` is `/react-app` and rebuild/deploy.
- If CORS errors appear when using `localhost:3000`, either proxy through Drupal or serve the app from `web/react-app/` as above.
- If clicks don’t register, check for CSS overlaying elements or missing `cursor: pointer` styles on cards.

## Current Status (Alpha)

- Working grid of tips (titles) with click-to-open overlay and image.
- Image URLs constructed to use `tips_view_250px` style.
- JSON:API data fetch confirmed and logged; 31+ images present in `included[]`.

## Next Improvements

- Show thumbnails on the home grid (also `tips_view_250px`).
- Improve typography and spacing for the overlay content.
- Accessibility/keyboard controls for the modal (focus trap, ESC to close).
- Loading and error states (skeletons, retry UI).
- Optional client-side routing (so opening a tip can be deep-linked).

## Deploying to Live (Checklist)

The goal is to reproduce the local setup with minimal, safe changes and use Drupal’s built‑in auth (no custom modules).

1) Enable and verify JSON:API
- Ensure core JSON:API is enabled on the live site.
- Confirm articles and images are exposed (visit `/jsonapi` to sanity check).
- Do NOT leave JSON:API wide open; we’ll require authentication from the frontend.

2) Create a dedicated app user
- Create a user (e.g. “reactapp”) with ONLY the minimal permissions needed to read published content via JSON:API.
- Keep the password long and unique. Store securely (e.g. a secret manager, not in the repo).

3) Require authentication for JSON:API
- Ensure anonymous users cannot GET content from JSON:API (block anon as needed, or set JSON:API to require auth per your policy).
- Our frontend uses Basic Auth for requests.

4) Build and deploy the React app
- In the React project:
  - Ensure `package.json` has `"homepage": "/react-app"`.
  - Build: `npm run build`.
  - Deploy the `build/` contents under the Drupal web root at `web/react-app/` so it is served at `/react-app`.

5) Configure the frontend to authenticate
- In `App.js`, requests include Basic Auth headers. For live, replace the local credentials with environment‑driven values:
  - Option A (simple): build with environment variables (e.g. `REACT_APP_BASICAUTH=base64(user:pass)`), and set:
    - `Authorization: 'Basic ' + process.env.REACT_APP_BASICAUTH`
  - Option B (slightly better): serve through a small server‑side proxy that injects credentials; keeps secrets off the client. Optional for this experiment.

6) Image styles
- Confirm the `tips_view_250px` image style exists and is generating on live.
- Thumbnails on the grid rely on `styles/tips_view_250px` paths.

7) Sanity checks
- Visit `/react-app` on live and confirm:
  - Grid loads (no 404s on static assets).
  - Only published content appears.
  - Clicking a card opens the modal with rendered HTML and the image.

Notes
- We intentionally avoided custom modules; everything uses core + JSON:API and a dedicated app user.
- If you need to tighten further later: add rate limiting, a WAF, stricter CSP headers, or move credentials to a proxy.

## Appendix: Commands Used (reference)

Development and build:

```bash
cd react-app
npm start
npm run build
```

Deploy build into Drupal:

```bash
cp -r react-app/build/* web/react-app/
```

Git (sample):

```bash
git add -A
git commit -m "first pretty version with click-through"
# If you forgot files and want to include them in the last commit:
git add -A
git commit --amend --no-edit
```

That’s it—small, focused, and easy to iterate on.


