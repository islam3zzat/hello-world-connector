# Getting a CT Access Token

Every Connect API call requires a Bearer token. Tokens expire after **2 hours** — refresh if you get a 401.

The Connect API is a **separate API** from the Composable Commerce HTTP API, with its own hosts (`https://connect.${REGION}.commercetools.com`) but the **same authorization server** (`https://auth.${REGION}.commercetools.com`).

```bash
export ACCESS_TOKEN=$(curl -s -X POST \
  "https://auth.${REGION}.commercetools.com/oauth/token" \
  -u "${CTP_CLIENT_ID}:${CTP_CLIENT_SECRET}" \
  -d "grant_type=client_credentials&scope=${SCOPE}" \
  | jq -r '.access_token')
```

Set `SCOPE` to the **least-privilege scope for the operation you're performing** (see table below), e.g.:

```bash
export SCOPE="manage_connectors:${CTP_PROJECT_KEY}"
```

Reuse `$ACCESS_TOKEN` for the session and refresh on any 401.

## Scopes — use the least-privilege scope per operation

Each Connect endpoint accepts a **granular scope** OR the broad `manage_project`. Prefer the granular scope. Request multiple scopes by space-separating them in the `scope` parameter.

| Operation | Skill | Required scope |
|---|---|---|
| Create / update / preview / publish a ConnectorStaged | `staged-create`, `previewable`, `publish`, `certify`, `update` | `manage_connectors:<PROJECT_KEY>` |
| Read a ConnectorStaged (poll status) | all poll steps | `view_connectors:<PROJECT_KEY>` (or `manage_connectors`) |
| Create / update / delete a Deployment | `deploy-test`, `update` | `manage_connectors_deployments:<PROJECT_KEY>` |
| Read a Deployment (poll status) | `deploy-test`, `update` | `view_connectors_deployments:<PROJECT_KEY>` (or `manage_connectors_deployments`) |
| Auto-generate API client credentials at deploy time | `deploy-test` (only if used) | `manage_api_clients:<PROJECT_KEY>` (add in addition to the deployment scope) |
| Broad fallback (works for everything, over-privileged) | — | `manage_project:<PROJECT_KEY>` |

> **Note:** Deployment endpoints require `manage_connectors_deployments` — **not** `manage_connectors`. These are distinct scopes. Using `manage_connectors` for a deployment call returns a 403.

> To keep a session simple you may request a single token covering all orchestration steps:
> ```bash
> export SCOPE="manage_connectors:${CTP_PROJECT_KEY} manage_connectors_deployments:${CTP_PROJECT_KEY}"
> ```
> This is still far narrower than `manage_project`.

## Runtime scope (`CTP_SCOPE`) is different

The `CTP_SCOPE` you pass as a **deployment configuration value** is the scope the *connector's own code* uses at runtime against the Composable Commerce API — it is **not** a Connect API scope. Set it to the minimum your connector logic needs, driven by the use case:

| Connector use case | Typical runtime `CTP_SCOPE` |
|---|---|
| Product ingestion | `view_products manage_products` (only what it writes) |
| Fulfillment / OMS | `manage_orders view_orders` |
| Tax / cart validation (API Extension) | `view_orders manage_orders` (scoped to cart/order) |
| Read-only reporting job | `view_products view_orders` etc. |

Do **not** default `CTP_SCOPE` to `manage_project` in production. The deploy skills prompt for this value via an argument hint.

## API client setup

Create or update the API client used for orchestration in the Merchant Center: **Settings → Developer settings → API clients**. It must carry the Connect scopes from the table above for the operations you run. The runtime credentials the connector uses can be a **separate**, more narrowly scoped API client.

## Regions

| Region string | Location |
|---|---|
| `europe-west1.gcp` | Europe (Google Cloud, Belgium) |
| `eu-central-1.aws` | Europe (AWS, Frankfurt) |
| `us-central1.gcp` | North America (Google Cloud, Iowa) |
| `us-east-2.aws` | North America (AWS, Ohio) |
| `australia-southeast1.gcp` | Australia (Google Cloud, Sydney) |

> The earlier `eu-west-1.aws` value is not a valid Connect region — the AWS Europe region is `eu-central-1.aws`.
