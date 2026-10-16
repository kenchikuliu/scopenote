# ScopeNote — client-change prototype

Working name only. A new responsive website built for Devpost Build With AI: Basics. Project documents in `devpost/` record the real prototype scope, requirements, technical blueprint and verification; draft status does not imply participant approval.

中文快速体验：启动后打开网站，点击「试用示例」，查看原始 $2,000 与待确认 $2,300；编辑一条需求记录客户决定，再打开「确认单」下载或打印。示例明确标注为虚构。

## Run locally

Node.js >=22.12.0 and npm. No API keys or account required.

```sh
git clone https://github.com/kenchikuliu/scopenote.git
cd scopenote
npm ci
npm run dev
```

Open http://localhost:5173. Keep the same URL: browser storage is separate for different hosts/ports. `localhost` and `127.0.0.1` do not share saved projects. Download a JSON backup before changing origins, devices or clearing browser data.

Production build:

```sh
npm run build
npm run preview
```

Open http://localhost:4173. The `dist/` folder can later be hosted as a static site. No public deployment has been performed.

Public UI demo: https://youtu.be/BZBYqzdNMM0 — 97 seconds, English interface, no audio, synthetic data. Playback was verified in a fresh browser context without signing in on 2026-10-16. The video shows the prototype working; the participant's final review and Devpost submission remain pending.

## Try the core journey

1. Start empty and create an original agreement, or explicitly load the synthetic example.
2. Add the client's original request, concrete deliverable, estimated hours and rate.
3. Compare **pending additions**, **recorded approved budget**, and **estimated total**.
4. Open a change and manually record the decision received outside the app. Optional notes keep the message reference.
5. View the confirmation document. Download Markdown or use browser print to save PDF.
6. Reload; download a JSON backup and restore it. Replacement requires confirmation and supports immediate undo.
7. Switch to English for the interface and exported document. Existing user text is preserved in its original language.

Synthetic example: $2,000 fixed quote, 20 planned hours, $100/h additions of 10h, 8h and 5h. Initial pending fee is $2,300; estimated total is $4,300; recorded approved total remains $2,000. The fictional prose/names are original; numerical scenario is inspired by the public Reddit account linked in `devpost/scope.md`. No real customer messages are bundled.

## Financial behavior

- Fixed baseline quote is independent of estimated hours × rate.
- Each change stores its own rate; baseline rate edits affect new changes only.
- Hours and amounts use integer hundredths/cents. Round each change to cents before summing.
- Recorded approved = baseline + accepted. Estimated = baseline + accepted + pending. Declined is excluded.
- Changing accepted content/pricing returns it to pending and clears previous decision evidence.
- Accepted is a manually logged outside decision. The app does not send messages or provide online client signing.
- One currency per project (USD/CNY); locked when changes exist. No currency conversion.

## Data and recovery

One project is stored in the current origin's localStorage. No analytics, runtime API, remote storage, external font/image request or cloud sync. JSON restores validate version, schema, integer bounds, date validity, unique IDs, currencies and states. Supported: 100 changes, 10,000h/item, 100,000 currency units/h, 100,000,000 baseline, 5MB backup. Corrupt local data is preserved until explicit replacement; storage failure leaves current-session work usable and offers download.

Download backup regularly; local storage is not cross-device storage. File downloads are initiated locally and no client emails are sent.

## Verification

```sh
npm test
npm run build
```

Node built-in tests cover money parsing/rounding, decision totals, rate snapshots, accepted-edit reconfirmation, schema bounds, export figures/escaping and multilingual backup limits. Observed browser checks and their limitations are recorded in `devpost/verification.md` when complete. Participant hands-on review remains separate.

To reproduce the isolated browser checks, keep the dev server running in another terminal:

```sh
npx playwright install chromium
npm run test:ui
```

Alternatively set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to an installed test Chromium. `BASE_URL` can target the local production preview. The harness uses fresh isolated contexts and saves screenshots, Markdown, JSON and a real print PDF under ignored `artifacts/`; it never connects to existing browser tabs.

## Project structure

- `src/App.jsx`: workspace actions, guarded replacement and local save.
- `src/components/`: agreement, requests, budget and confirmation interfaces.
- `src/lib/domain.js`: shared validation and financial logic.
- `src/lib/export.js`: document/backup download helpers.
- `src/lib/storage.js`: guarded local persistence.
- `src/lib/i18n.js`: Chinese/English labels.
- `tests/`: consequential domain/export checks.
- `devpost/`: real planning, build progress, skill provenance and offline app map.

Open `devpost/app-map.html` directly for an offline reference route through one real action and pointers for future changes. It requires no script, build or remote service.

Standard dependencies: React/React DOM 19.2.0, Vite 8.3.4. Original application source, styles, icons and example prose were authored in this fresh directory; no competing product code was copied. The official Devpost Learn pack is installed locally but excluded from application commits; see `devpost/skill-provenance.md`.

Runtime license notices are preserved in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), alongside the application's MIT [LICENSE](LICENSE).

## Record a local UI demonstration

With the production preview running, `npm run demo:record` opens an isolated test Chromium and records a silent English UI walkthrough in `artifacts/demo/`. Use the same Playwright browser setup or executable override described above. The script exercises fictional example requests, a manually recorded outside decision, invalid-input recovery, reconfirmation after changing a quote, reload, and document/backup downloads. It also produces desktop/mobile screenshots, an actual print PDF, and a timestamped scene log.

The recording is local raw footage for review. It contains no participant narration, music or submission text, and is not automatically published. The participant supplies their own explanation and final video. Downloads and financial assertions verify that the output matches the UI; this does not replace participant hands-on review.

## Submission status

Public source: [kenchikuliu/scopenote](https://github.com/kenchikuliu/scopenote), including development history, planning documents and the [MIT license](https://github.com/kenchikuliu/scopenote/blob/main/LICENSE). The website runs locally; no hosted application or public video is available yet.

User planning review, actual user feedback, final learning review, public video, participant-written final submission material and Devpost submission remain to be completed. The official submission deadline is October 26, 2026 at 17:00 EDT (October 27, 05:00 Asia/Shanghai).
