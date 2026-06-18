# Backend apps (service, event, job)

Use this for the three runtime application types. They are **HTTP servers that
Connect hosts and routes traffic to**, which is why they share one set of rules:
a build step, a server on a fixed port, and CT credentials in `connect.yaml`.

| Type | Trigger | `connect.yaml` essentials |
|---|---|---|
| `service` | Real-time HTTP via API Extensions (cart validation, custom shipping) | `endpoint`, post-deploy/pre-undeploy scripts |
| `event` | Async reactions to CT events via Subscriptions (email on order placed) | `endpoint`, post-deploy/pre-undeploy scripts |
| `job` | Scheduled cron tasks (nightly sync, cleanup) | `endpoint`, `properties.schedule` (cron) |

## package.json scripts

Each backend app folder needs both:

- `"gcp-build"` — the build step (e.g. `tsc`)
- `"start"` — starts the server on **port 8080** (e.g. `node build/index.js`)

## Port 8080 is mandatory

Connect routes traffic only to **port 8080**. The HTTP server in each backend app
must bind to it — any other port means Connect can't reach the app and the
deployment silently fails to receive traffic. This is the single most common
"deployed but nothing happens" cause, so verify it explicitly.

## connect.yaml config keys

```yaml
deployAs:
  - name: service                      # must match the folder name
    applicationType: service
    endpoint: /service
    scripts:
      postDeploy: npm install && npm run build && npm run connector:post-deploy
      preUndeploy: npm install && npm run build && npm run connector:pre-undeploy
    configuration:
      standardConfiguration:
        - key: CTP_REGION
          description: commercetools Composable Commerce API region
          required: true
          default: "europe-west1.gcp"
      securedConfiguration:
        - key: CTP_PROJECT_KEY
        - key: CTP_CLIENT_ID
        - key: CTP_CLIENT_SECRET
        - key: CTP_SCOPE
```

A `job` app drops `scripts` and adds `properties.schedule` (a cron expression,
e.g. `"0 0 * * *"`). Add `postDeploy`/`preUndeploy` scripts only where you
actually create resources — API Extensions (`service`) or Subscriptions (`event`).

> **Config placement is the connector author's choice**, declared here. Put
> sensitive values (`CTP_CLIENT_SECRET`, credentials) under `securedConfiguration`;
> non-sensitive values like `CTP_REGION` can be `standardConfiguration` with a
> `default`. CT's own examples place `CTP_PROJECT_KEY` in either section — pick one
> and keep the deployment `configurations` consistent (the deploy skills derive
> their layout from this file).
>
> **Auto-generated credentials:** instead of declaring `CTP_CLIENT_ID/SECRET/SCOPE`,
> you can omit them and add `inheritAs.apiClient.scopes` to have Connect generate
> an API client per deployment. Don't declare a key both ways — that conflicts.

## Verify before proceeding (backend apps)

Run from the project root, once per backend app folder.

| Check | Command | Expected |
|---|---|---|
| connect.yaml present | `ls connect.yaml` | exists |
| Folder names match `deployAs[].name` | `cat connect.yaml; ls -d */` | every `name:` has a matching folder |
| Build + start scripts | `grep -A10 '"scripts"' <app>/package.json` | both `gcp-build` and `start` present |
| Server binds 8080 | `grep -r "8080" <app>/src/` | a match |
| Tests exist | `ls <app>/tests/ 2>/dev/null \|\| ls <app>/src/__tests__/` | at least a placeholder |

All passing → **GO**, proceed to `ct-connector-github-setup`. A missing
`gcp-build` or wrong port causes deployment failures that are painful to debug
later, so don't wave these through.
