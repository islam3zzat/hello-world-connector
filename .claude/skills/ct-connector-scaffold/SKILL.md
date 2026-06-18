---
name: ct-connector-scaffold
description: >
  Scaffold a new commercetools Connect connector project using the official CLI or create-connect-app tool.
  Use this skill whenever the user wants to create a new connector, scaffold a commercetools integration,
  start a connect project, bootstrap a connector template, or set up a new Connect application — including
  Merchant Center Custom Views and Custom Applications, not just backend service/event/job apps.
  Also trigger this skill when the user asks how to start building a connector or what template to use
  for a CT integration (payment, tax, email, fulfillment, product ingestion, custom view, custom app, etc).
---

# commercetools Connector Scaffold

Scaffold a new commercetools Connect connector. A connector bundles one or more
**applications**, and the application types fall into two families that are
scaffolded, configured, and verified **differently**. The most important job of
this skill is to route each app to the right rules — the biggest failure mode is
applying backend assumptions (port 8080, `gcp-build`) to a Merchant Center UI app,
which has neither.

## Step 1 — choose the scaffold tool

### Option A: `create-connect-app` (npm, recommended for JS/TS)

```bash
npm install --global @commercetools-connect/create-connect-app
create-connect-app <DIRECTORY> --template <javascript|typescript>
```

Generates the standard directory structure with a folder for every application
type (`service`, `event`, `job`, `merchant-center-custom-application`,
`merchant-center-custom-view`, `assets`) plus `connect.yaml` and `docs/`.

> The two `merchant-center-*` folders come out as **stubs** (just `LICENSE` +
> `README.md`). The real UI app is scaffolded separately — see the MC reference.

### Option B: `commercetools connect init` (CT CLI)

```bash
commercetools connect init <DIRECTORY> [--template <template-name>]
```

Requires the [CT CLI](https://docs.commercetools.com/sdk/cli). Use `--template`
to bootstrap a use case: `payment-integration`, `tax-integration`,
`email-integration` / `transactional-emails`, `product-ingestion`,
`fulfilment-integration`.

## Step 2 — gather requirements

1. **Directory name** — and check whether it already exists (an existing git repo,
   `.env`, or prior commits mean it isn't a clean slate; don't delete what you
   didn't create — confirm first).
2. **Language** — JavaScript or TypeScript.
3. **Application type(s)** — the routing decision below.

Help the user pick types if unsure:

| Type | Use it for | Family |
|---|---|---|
| `service` | Real-time HTTP via API Extensions (cart validation, custom shipping) | backend |
| `event` | Async reactions to CT events via Subscriptions (email on order placed) | backend |
| `job` | Scheduled cron tasks (nightly reports, sync jobs) | backend |
| `merchant-center-custom-application` | A new page in the Merchant Center | MC UI |
| `merchant-center-custom-view` | A panel/widget on an *existing* MC page | MC UI |
| `assets` | Static assets served via CDN | (no app code) |

## Step 3 — route to the variant reference

Per-type scaffolding, `connect.yaml` config, build commands, and the GO/NO-GO
checklist live in dedicated references — read the one(s) matching the chosen types.
Don't apply one family's checklist to the other.

- **service / event / job** → read [`../references/backend-apps.md`](../references/backend-apps.md)
  (build step, port 8080, `CTP_*` config, post/pre-deploy scripts).
- **custom view / custom application** → read [`../references/merchant-center-customizations.md`](../references/merchant-center-customizations.md)
  (`create-mc-app`, `mc-scripts build`, `CUSTOM_VIEW_ID`/`CUSTOM_APPLICATION_ID`
  config, **no** port 8080 or `gcp-build`).

A connector can mix both families — then each app follows its own reference.

## Step 4 — clean up and register

1. **Remove unused application folders** — keep only the types in scope. If the
   directory had pre-existing content, confirm before deleting anything untracked.
2. **Register each app in `connect.yaml`** — the `name:` must match the folder
   name; remove the entries for folders you deleted. Use the config shape from the
   relevant reference (the two families have different required keys).
3. **Verify** using the checklist in the matching reference, then proceed to
   `ct-connector-github-setup`.

## API client scope for the connector lifecycle

The CT API client you use to **orchestrate** the connector (create/preview/publish/
deploy) needs Connect-specific scopes — `manage_project` is broader than necessary:

```
manage_connectors:<PROJECT_KEY>              # create/preview/publish ConnectorStaged
manage_connectors_deployments:<PROJECT_KEY>  # create/redeploy Deployments
```

See [`../references/auth.md`](../references/auth.md) for the full per-operation
scope table. The **runtime** credentials your connector code uses (the `CTP_SCOPE`
deployment value) should be a separate, use-case-scoped client — not these
orchestration scopes.

## References

- [Develop a Connect application](https://docs.commercetools.com/connect/development) · [connect.yaml reference](https://docs.commercetools.com/connect/development#configure-connectyaml)
- [Create a Custom View](https://docs.commercetools.com/tutorials/create-custom-view) · [Create a Custom Application](https://docs.commercetools.com/tutorials/create-custom-application)
- [Connector development workflow](https://docs.commercetools.com/certifications/build-and-deploy-custom-connector/connector-development-workflow)
