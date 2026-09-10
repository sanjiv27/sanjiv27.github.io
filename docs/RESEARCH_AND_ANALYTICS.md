# Research and private analytics

The website integration is implemented. GA4 account/property creation, dashboard configuration, and publication are still separate setup steps. Analytics stays off when its measurement ID is absent. This project continues to use GitHub Pages.

## Add research

Edit `src/data/research.ts`. Entries appear on the dedicated `/research/` page in array order. The page and Research dock shortcut are always available. An empty list shows “Research updates coming soon.” Add verified content only:

```ts
export const RESEARCH: readonly ResearchEntry[] = [
  {
    id: "your-stable-project-id",
    title: "Your research title",
    summary: "Explain the research question, your contribution, and the outcome or current direction in 2–3 sentences.",
    driveUrl: "https://drive.google.com/file/d/YOUR_FILE_ID/view", // Optional when no paper is available.
    codeUrl: "https://github.com/YOUR_NAME/YOUR_PROJECT", // Optional repository link.
  },
];
```

Supply at least one of `driveUrl` or `codeUrl`; projects without a paper can use only `codeUrl`. Links appear only when supplied. Replace every placeholder before publishing. Keep IDs unique and unchanged when renaming projects. Check each Drive link in a signed-out browser and ensure it grants the intended viewing access. Titles, descriptions, and links remain public site content. No documents are embedded or copied from Drive.

The existing project and institution IDs in `src/data/resume.tsx` also stay stable for analytics.

## Create the Google Analytics property

1. Sign in at https://analytics.google.com/ with the Google account that should own the reports.
2. Create an Analytics account if needed, then a standard GA4 property named **Sanjiv Portfolio**. Use **America/New_York** as the reporting timezone.
3. Add a **Web** data stream for `https://sanjiv27.github.io`. Name the stream **Portfolio website**.
4. Turn **Enhanced measurement off** for this stream. This implementation sends its own page views and clicks; automatic history and outbound tracking would overlap. Do not install an additional Google tag or Google Tag Manager container.
5. Copy the **Measurement ID** beginning `G-` from stream details.
6. In the repository on GitHub, open **Settings → Secrets and variables → Actions → Variables**. Create a repository variable named `NEXT_PUBLIC_GA_MEASUREMENT_ID` with that ID. The deployment workflow already reads it.
7. For a local production build, add the same `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-…` line to `.env.local`, preserving any existing variables. `.env.example` documents the key. Rebuild after changing it.

The measurement ID is public configuration, not a password. The dashboard remains private under Google account access controls. No dashboard login or API secret belongs in the website.

Development mode does not collect analytics. In a production build, Google code loads only after **Allow analytics**. Declining, missing configuration, and owner exclusion prevent collection. Visitors can reopen **Analytics settings** at the bottom of the page. Withdrawing previously granted consent reloads the page to stop the loaded tag.

Official references: [Create a property and stream](https://support.google.com/analytics/answer/14183469?hl=en), [Manual page views and automatic-history caveat](https://developers.google.com/analytics/devguides/collection/ga4/views), [Custom events](https://developers.google.com/analytics/devguides/collection/ga4/events).

## Build the private reports

In **Admin → Custom definitions**, create these **event-scoped** custom dimensions, using the exact parameter names: `section`, `element_id`, `action`, `item_id`.

In **Explore**, create **Portfolio engagement**. Keep it private (do not share it), and create these tabs:

| Tab | Configuration |
| --- | --- |
| Traffic | Use standard Traffic acquisition reports for users, sessions, source/medium, and device category. Use Pages and screens for page views. |
| Homepage interactions | Free-form table: rows `section`, `element_id`, `action`; values Event count and Total users; filter Event name exactly `homepage_click`. |
| Research interest | Free-form table: rows `item_id`; values Event count and Total users; filter Event name exactly `research_click`. Inspect `research_view` separately for exposure. |
| Contact | Free-form table: rows `section`, `element_id`, `item_id`; values Event count and Total users; filter Event name exactly `contact_click`. Dock links have no `item_id`; Contact distinguishes `text` and `icon`. |
| Research journey | Closed funnel, indirectly followed steps: `page_view` with homepage path `/`, then `research_view`, then `research_click`, then `contact_click`. Use a one-hour limit between steps to focus on short visits. |

Use the last **30 days** by default. In standard reports compare the preceding 30 days; for explorations duplicate the tab with the preceding date range if comparison is unavailable. Optionally set event-data retention to **14 months** in Admin for longer exploration history. Saved reports must be configured inside your account; they are not created by deploying this code.

`homepage_click` covers annotated links and controls: location, Home/Research dock navigation, About, experience expansion, education links, technology expansion, project previews/resources, GitHub placements, photo open/close, theme, and forest. `contact_click` covers email/LinkedIn; `research_click` covers Drive. Each activation emits one event, including nested-icon and keyboard activation. Decorative content is not tracked. Contact and research clicks are not also sent as `homepage_click`.

`research_view` requires the heading and at least half of the first entry to be visible for one continuous second in an active tab. It records once per research-page visit; an empty page does not emit `research_view`. Theme/forest actions should be evaluated separately from research/contact interest.

Dock interactions on the Research page emit `navigation_click`, keeping the `homepage_click` report specific to the homepage. Research and contact events work on both supported pages.

Custom click payloads use controlled IDs, never destination URLs, email addresses, or document contents. Page locations discard arbitrary query strings and fragments; only alphanumeric, underscore, and hyphen campaign values up to 100 characters are retained. Example: `?utm_source=linkedin&utm_medium=social&utm_campaign=research_2026`. Never put names or emails in campaign values.

## Exclude your own visits and debug

On the portfolio domain, run this in the browser developer console once, then reload:

```js
localStorage.setItem("portfolio.analytics.owner-opt-out", "true");
location.reload();
```

To re-enable this browser (your visitor consent still applies):

```js
localStorage.removeItem("portfolio.analytics.owner-opt-out");
location.reload();
```

For a short production verification session, turn off owner exclusion, then enable DebugView events:

```js
localStorage.setItem("portfolio.analytics.debug", "true");
location.reload();
```

Accept analytics, open GA4 **Admin → DebugView**, and exercise links and toggles. Confirm one page view on load, one page view when navigating to Research and another when returning Home, one event per click, distinct placements/actions, and research visibility timing. Turn Enhanced measurement off before checking counts. Normal reports can take time to populate, and custom dimensions are not retroactive.

When finished, remove `portfolio.analytics.debug`, restore owner opt-out, and reload. Consent and owner settings are browser/domain-specific; repeat them on another browser or domain as needed.

## Notes and verification

Notes route source is preserved in `archive/notes`, outside `src/app` and excluded from TypeScript checking. Content and data files remain intact. A clean deployment exports no Notes pages, so old Notes URLs return 404. Restoring Notes later requires moving those routes back and fixing their pre-existing `/blog/` links/metadata before publishing them.

Run:

```sh
node --test tests/analytics.test.cjs
npm run lint
npm run build
```

The automated tests cover consent gating, owner exclusion, disabled/missing configuration, duplicate prevention, parameter sanitation, and visibility timing. Before publication, verify mobile/desktop layout, long titles, keyboard focus, dark mode, reduced motion, signed-out Drive access, declined consent, blocked analytics, and that `/notes/` returns 404. The empty-list fallback is shown only when no research entries are configured.

Counts only include consenting visitors whose browsers allow analytics. There is no historical backfill. A Drive click does not confirm a document read; an email or LinkedIn click does not confirm a message was sent.

## Research presentation

Entries use a numbered reading list with an optional one-line `subtitle`. All abstracts start collapsed and expand by clicking the title and its small downward chevron. Available Paper and Code links stay visible independently. Optional `highlights` contain exact summary phrases to emphasize with medium-weight text. Expand/collapse actions emit `research_toggle` with the project `item_id` and `action`, separately from Paper clicks.
