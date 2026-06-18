---
name: ct-connector-deploy-test
description: >
  Deploy a previewable ConnectorStaged to a test or staging commercetools project and poll until
  the deployment is ready. Use this skill after previewable status is confirmed. Trigger for phrases
  like "deploy to test", "deploy the connector", "test deployment", or when following
  ct-connector-previewable.
---

# Deploy ConnectorStaged to Test Project

## Prerequisites
- `isPreviewable` is `true` on the ConnectorStaged
- A target CT project key (must be listed in `privateProjects` on the ConnectorStaged)
- CT API credentials for the target project
- Configuration values for each application defined in `connect.yaml`

## Argument hints

Gather these before proceeding:

| Variable | Description | Example |
|---|---|---|
| `DEPLOYMENT_KEY` | Unique key for this deployment | `my-connector-test` |
| `PROJECT_KEY` | Target CT project key | `my-project` |
| `REGION` | CT region | `europe-west1.gcp` |
| `CONNECTOR_KEY` | Key of the ConnectorStaged | `my-payment-connector` |
| `CONNECTOR_VERSION` | Current version number from GET response | `1` |
| `RUNTIME_SCOPE` | Minimal CT scope the **connector's own code** needs at runtime (the `CTP_SCOPE` config value) — driven by the use case, not the orchestration | `manage_orders:${PROJECT_KEY}` |
| Per-app config values | Standard + secured vars per `connect.yaml` | See below |

> **`RUNTIME_SCOPE` is use-case driven.** It is the scope the deployed connector uses against the Composable Commerce API, passed as the `CTP_SCOPE` config value — *not* a Connect API scope. Set it to the minimum your connector logic needs (e.g. `view_products manage_products` for ingestion, `manage_orders` for fulfillment). Do not default it to `manage_project`. See [`references/auth.md`](../references/auth.md#runtime-scope-ctp_scope-is-different).

## Step 1: Get an access token

The Deployment endpoint requires **`manage_connectors_deployments`** — a distinct scope from `manage_connectors`. Using the wrong one returns a 403.

```bash
export ACCESS_TOKEN=$(curl -s -X POST \
  "https://auth.${REGION}.commercetools.com/oauth/token" \
  -u "${CTP_CLIENT_ID}:${CTP_CLIENT_SECRET}" \
  -d "grant_type=client_credentials&scope=manage_connectors_deployments:${PROJECT_KEY}" \
  | jq -r '.access_token')
```

> If your `connect.yaml` uses **automatically generated API client credentials**, add `manage_api_clients:${PROJECT_KEY}` to the scope above as well.

## Step 2: Create the deployment

> **Quoting matters.** The body uses **double quotes with escaped `\"`** so the shell expands `${...}` variables. A single-quoted body (`-d '{...}'`) would send the literal text `${CONNECTOR_VERSION}`, producing invalid JSON and a failed request.

> **Build `configurations` from `connect.yaml` — do not assume a fixed layout.** Each key's
> placement in `standardConfiguration` vs `securedConfiguration` is defined by the connector's
> `connect.yaml`, and it varies per connector (CT's own examples disagree). For **each** app under
> `deployAs`, emit one `configurations` entry whose `applicationName` matches the app's `name`, and
> put each key in the **same** array (`standardConfiguration`/`securedConfiguration`) where the
> `connect.yaml` declares it. Putting a key in the wrong array can fail config validation.
>
> Read the layout first:
> ```bash
> # Lists each app and the keys per configuration section
> cat connect.yaml
> ```

The example below matches **this project's** `connect.yaml` (one `service` app: `CTP_REGION` is
standard; `CTP_PROJECT_KEY`, `CTP_CLIENT_ID`, `CTP_CLIENT_SECRET`, `CTP_SCOPE` are secured). Adjust
to mirror your own `connect.yaml`.

```bash
curl -s -X POST \
  "https://connect.${REGION}.commercetools.com/${PROJECT_KEY}/deployments" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"key\": \"${DEPLOYMENT_KEY}\",
    \"connector\": {
      \"key\": \"${CONNECTOR_KEY}\",
      \"version\": ${CONNECTOR_VERSION},
      \"staged\": true
    },
    \"region\": \"${REGION}\",
    \"configurations\": [
      {
        \"applicationName\": \"service\",
        \"standardConfiguration\": [
          {\"key\": \"CTP_REGION\", \"value\": \"${REGION}\"}
        ],
        \"securedConfiguration\": [
          {\"key\": \"CTP_PROJECT_KEY\", \"value\": \"${PROJECT_KEY}\"},
          {\"key\": \"CTP_CLIENT_ID\", \"value\": \"${CTP_CLIENT_ID}\"},
          {\"key\": \"CTP_CLIENT_SECRET\", \"value\": \"${CTP_CLIENT_SECRET}\"},
          {\"key\": \"CTP_SCOPE\", \"value\": \"${RUNTIME_SCOPE}\"}
        ]
      }
    ]
  }" | jq '{ key: .key, status: .status, type: .type, id: .id, error: .message }'
```

> `"staged": true` deploys the ConnectorStaged (previewable draft) — the server infers a
> `preview`-type Deployment (you do not set `type`). Use `staged: false` only for a published
> Connector, which deploys as `sandbox` (default) or `production`. See
> [`references/enums.md`](../references/enums.md) for the `DeploymentType` table.

Add a `configurations` entry for each application in your `connect.yaml` — one per `applicationName`.

Save the deployment `id` and `key` from the response.

## Step 3: Background polling

Deployment takes **up to 15 minutes**. Use `/loop 2m` to poll until terminal state:

```bash
curl -s \
  "https://connect.${REGION}.commercetools.com/${PROJECT_KEY}/deployments/key=${DEPLOYMENT_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  | jq '{ status: .status, details: .details }'
```

**`DeploymentStatus`** — see [`references/enums.md`](../references/enums.md#deploymentstatus-deployment-status) for the full enum.

Stop polling when status is `Deployed` or `Failed`. (`Deploying` is the normal in-progress state — keep polling.) On `Failed`, read `details.build.report.entries[]` and look for `type: "Error"` entries.

## Verify

- [ ] `status` is `Deployed`
- [ ] Post-deploy scripts ran — check `details.build.report`
- [ ] Smoke test: hit the deployed endpoint URL returned in the response
- [ ] Connector behaves as expected in the test project

**GO** → proceed to `ct-connector-publish`
**NO-GO** → check `details`, fix the issue, redeploy
