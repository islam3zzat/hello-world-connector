# Merchant Center customizations (Custom View & Custom App)

Use this when the connector includes a `merchant-center-custom-view` or
`merchant-center-custom-application`. These are **React SPAs**, not backend
services — they are built with `mc-scripts`, ship as static assets, and have
**no HTTP server and no port 8080**. The backend checklist does not apply to them;
use the one at the end of this file instead.

The two MC customization types differ in placement, not tooling:

- **Custom View** — a panel/widget injected into an *existing* MC page (e.g. a
  button on the Products detail page). Config lives in `custom-view-config.mjs`.
- **Custom Application** — a *new* page added to the MC nav. Config lives in
  `custom-application-config.mjs`.

Both are scaffolded with the same `create-mc-app` tool and wired into
`connect.yaml` the same way (different keys; see below).

## Why the connector template's MC folder is only a stub

`create-connect-app` ships `merchant-center-custom-view/` and
`merchant-center-custom-application/` as **stubs** — just a `LICENSE` and a
`README.md`. The real app is a separate Merchant Center project that you scaffold
*into* that folder. Don't hand-write it; use the official starter template, which
gives you a working app (components, GraphQL hooks, i18n, a passing test).

## Scaffold the app with create-mc-app

```bash
npx @commercetools-frontend/create-mc-app@latest <dir> \
  --application-type custom-view \          # omit for a custom application (it's the default)
  --template starter-typescript \           # or "starter" for JavaScript
  --initial-project-key <PROJECT_KEY> \
  --cloud-identifier gcp-eu \               # gcp-eu | gcp-us | aws-eu | aws-us
  --skip-install \                          # install separately so you control the package manager
  --yes                                     # non-interactive; needed in an agent/CI context
```

Without `--yes` + the value flags, the CLI **prompts interactively** for the
project key and cloud identifier — which hangs in a non-interactive shell. Always
pass them explicitly here.

`--application-type` accepts `custom-application` (default) or `custom-view`.
Run `npx @commercetools-frontend/create-mc-app@latest --help` to see all flags.

### Scaffolding into an existing (non-empty) folder

`create-mc-app` requires a *new* directory argument — it won't populate an
existing one. Scaffold into a temp subdir and flatten:

```bash
cd merchant-center-custom-view
npx @commercetools-frontend/create-mc-app@latest _tmp --application-type custom-view \
  --template starter-typescript --initial-project-key <KEY> --cloud-identifier gcp-eu --skip-install --yes
# preserve the connector stub's README, then flatten the starter on top
mv README.md CONNECTOR_NOTES.md
mv _tmp/* _tmp/.[!.]* . 2>/dev/null   # zsh with dotglob moves hidden files too
rmdir _tmp
```

The starter brings its own `.env`, `.gitignore`, `README.md`, etc. — letting them
land at the folder root is correct.

## Fix the generated names

The CLI derives `name` from the temp dir, so a `_tmp` scaffold yields invalid
names. Fix both before continuing:

- `package.json` → `"name"` (a leading `_`/`-` is an invalid npm name)
- `custom-view-config.mjs` (or `custom-application-config.mjs`) → `name`

The config is a real `.mjs` module, so you can read env at config time, e.g.
`initialProjectKey: process.env.CUSTOM_VIEW_PROJECT_KEY || 'my-project-key'`.

## Key config-file fields (custom-view-config.mjs)

| Field | What it controls |
|---|---|
| `name` | Display name of the Custom View |
| `cloudIdentifier` | Region the MC API talks to (`gcp-eu`, etc.) |
| `oAuthScopes` | `{ view: [...], manage: [...] }` — HTTP API scopes; keep least-privilege |
| `type` | Panel type — currently only `CustomPanel` |
| `typeSettings.size` | `SMALL` / `LARGE` — panel footprint |
| `locators` | Where the view appears, as `<application>.<view>.<subview>` (e.g. `products.product_details.general`) |
| `env.production.customViewId` | Filled in *after* you register the view in the MC and get its ID |

## Wire it into connect.yaml

A Custom View / Custom App has **no `endpoint`** and **no `CTP_*` credentials** in
`connect.yaml` — the MC host injects auth at runtime. The required keys differ from
backend apps:

```yaml
deployAs:
  - name: merchant-center-custom-view          # must match the folder name
    applicationType: merchant-center-custom-view
    configuration:
      standardConfiguration:
        - key: CUSTOM_VIEW_ID
          description: The Custom View ID provided when you register the view in the Merchant Center
          required: true
        - key: ENTRY_POINT_URI_PATH
          description: The entry point URI path identified during registration
          required: true
        - key: CLOUD_IDENTIFIER
          description: Cloud region the customization uses to reach Composable Commerce
          required: false
          default: 'gcp-eu'
```

For a Custom **Application**, swap to `applicationType: merchant-center-custom-application`
and use `CUSTOM_APPLICATION_ID` instead of `CUSTOM_VIEW_ID` (`ENTRY_POINT_URI_PATH`
and `CLOUD_IDENTIFIER` stay the same).

If the connector is MC-only, drop the `inheritAs` block that forces global
`CTP_*` config — it's optional and meaningless for a UI-only deployment.

## package.json scripts (these come from the starter, don't add gcp-build)

The MC starter already defines the right scripts. The relevant ones:

- `build` → `mc-scripts build` — the production build; this is the deployment gate, **not** `gcp-build`
- `start` → `mc-scripts start` — local dev server (defaults to `localhost:3001`), **not** a port-8080 server
- `test` → `jest ...` — the starter ships a passing test

## Verify before proceeding (MC customization)

Run from inside the customization folder. These replace the backend checks.

| Check | Command | Expected |
|---|---|---|
| Config name fixed | `grep '"name"' package.json` & `grep "name:" *-config.mjs` | no `_tmp`/leading-dash names |
| Deps install | `npm install` (or `yarn`) | completes |
| Production build | `npm run build` | "Compiled successfully" |
| Tests pass | `npm test` | all green |
| Registered in connect.yaml | inspect root `connect.yaml` | `applicationType: merchant-center-custom-view` (or `-application`), folder name matches `name:` |

> The starter is **yarn-first**. Installing with **npm** works and the build/tests
> pass, but `npm run typecheck` may print errors from inside
> `node_modules/@commercetools-frontend/*` (a hoisting quirk, not your code). The
> build and tests are the real gates; if the typecheck noise matters, reinstall
> with `yarn`.

All green → **GO**, proceed to `ct-connector-github-setup`.
