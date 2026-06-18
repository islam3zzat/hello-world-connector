---
name: ct-connector-update
description: >
  Update a published or staged ConnectorStaged after code changes. Use this skill whenever code
  has been changed and needs to be deployed through the connector lifecycle again — commit, tag,
  update the ConnectorStaged repository pointer, re-run previewable, re-publish, and redeploy.
  Trigger for phrases like "update the connector", "deploy my changes", "new version of connector",
  "push changes to connector", "redeploy connector", or after any code fix or feature update.
---

# Update a ConnectorStaged After Code Changes

Use this skill whenever code has changed and needs to reach a deployment. The ConnectorStaged always
points at a specific Git tag — updating means creating a new tag, pointing the ConnectorStaged at it,
and re-running the publish pipeline.

## Argument hints

Gather these before proceeding:

| Variable | Example | Description |
|---|---|---|
| `CONNECTOR_KEY` | `hello-world-connector` | Key of the existing ConnectorStaged |
| `REGION` | `europe-west1.gcp` | CT Connect region |
| `PROJECT_KEY` | `ifarg-project` | CT project key (for token scope) |
| `GITHUB_REPO_URL` | `https://github.com/owner/repo.git` | Repo URL (unchanged from original) |
| `NEW_TAG` | `v1.0.1` | New semver tag for this release |
| `DEPLOYMENT_KEY` | `hello-world-connector-prod` | Key of the deployment to update after re-publish |
| `RUNTIME_SCOPE` | `manage_orders:ifarg-project` | Minimal CT scope the connector's own code needs at runtime (the `CTP_SCOPE` config value) — use-case driven, not `manage_project` |

---

## Step 1: Commit and push your changes

```bash
git add .
git commit -m "fix: <describe what changed>"
git push origin main
```

---

## Step 2: Create and push a new Git tag

Every connector release must reference a unique tag — you cannot reuse or move an existing tag.

```bash
git tag v1.0.1          # increment from the previous tag
git push origin v1.0.1
```

Verify the tag is on the remote:
```bash
gh api repos/<owner>/<repo>/git/refs/tags | jq '.[].ref'
```

---

## Step 3: Get an access token

```bash
export ACCESS_TOKEN=$(curl -s -X POST \
  "https://auth.${REGION}.commercetools.com/oauth/token" \
  -u "${CTP_CLIENT_ID}:${CTP_CLIENT_SECRET}" \
  -d "grant_type=client_credentials&scope=manage_connectors:${PROJECT_KEY}" \
  | jq -r '.access_token')
```

Get the current ConnectorStaged version:

```bash
export VERSION=$(curl -s \
  "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  | jq '.version')
echo "Current version: $VERSION"
```

---

## Step 4: Point the ConnectorStaged at the new tag

```bash
curl -s -X POST \
  "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"version\": ${VERSION},
    \"actions\": [{
      \"action\": \"setRepository\",
      \"url\": \"${GITHUB_REPO_URL}\",
      \"tag\": \"${NEW_TAG}\"
    }]
  }" | jq '{ version: .version, repository: .repository }'
```

Verify `repository.tag` matches `NEW_TAG` before continuing.

---

## Step 5: Re-run previewable

CT must re-validate the new tag. Submit the previewable request with the updated version:

```bash
export VERSION=$(curl -s \
  "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  | jq '.version')

curl -s -X POST \
  "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"version\": ${VERSION},
    \"actions\": [{ \"action\": \"updatePreviewable\" }]
  }" | jq '{ version: .version, isPreviewable: .isPreviewable }'
```

Poll every 5 minutes until `isPreviewable` is `true`:

```bash
curl -s \
  "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  | jq '{ isPreviewable: .isPreviewable, previewableReport: .previewableReport }'
```

Use `/loop 5m` to poll in the background. Stop when `isPreviewable` is `true` or `false`.

If `false` — read `previewableReport`, fix the issue, push a new tag, and restart from Step 2.

---

## Step 6: Re-publish

```bash
export VERSION=$(curl -s \
  "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  | jq '.version')

curl -s -X POST \
  "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"version\": ${VERSION},
    \"actions\": [{ \"action\": \"publish\", \"certification\": false }]
  }" | jq '{ status: .status, version: .version }'
```

Poll until `status` is `Published`:

```bash
curl -s \
  "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  | jq '{ status: .status, publishingReport: .publishingReport }'
```

---

## Step 7: Redeploy

Existing deployments are **not updated automatically**. You have two options:

- **`redeploy` update action** (preferred) — re-deploys the existing deployment, picking up the new connector version, without recreating it. POST a `DeploymentUpdate` with `{ "action": "redeploy" }` to the deployment by key. This preserves the deployment key and config.
- **Create a new deployment** — point a fresh deployment at the new published version (shown below).

### Option A — redeploy the existing deployment

```bash
export DEPLOY_VERSION=$(curl -s \
  "https://connect.${REGION}.commercetools.com/${PROJECT_KEY}/deployments/key=${DEPLOYMENT_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" | jq '.version')

curl -s -X POST \
  "https://connect.${REGION}.commercetools.com/${PROJECT_KEY}/deployments/key=${DEPLOYMENT_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"version\": ${DEPLOY_VERSION},
    \"actions\": [{ \"action\": \"redeploy\" }]
  }" | jq '{ key: .key, status: .status, version: .version }'
```

### Option B — create a new deployment

Get the new published connector version:

```bash
export PUBLISHED_VERSION=$(curl -s \
  "https://connect.${REGION}.commercetools.com/connectors/key=${CONNECTOR_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  | jq '.version')
```

Create a new deployment (or update the existing one):

Creating a deployment requires the **`manage_connectors_deployments`** scope (not `manage_connectors`). `CTP_SCOPE` below is the connector's **runtime** scope — set `RUNTIME_SCOPE` to the minimum your connector code needs (see [`references/auth.md`](../references/auth.md#runtime-scope-ctp_scope-is-different)), not `manage_project`.

> **Mirror `connect.yaml` for config placement.** Each key's `standardConfiguration` vs
> `securedConfiguration` placement is defined per-connector in `connect.yaml` — derive it from there,
> don't assume a fixed layout. The example below matches **this project's** `connect.yaml`
> (`CTP_REGION` standard; the rest secured).

```bash
export ACCESS_TOKEN=$(curl -s -X POST \
  "https://auth.${REGION}.commercetools.com/oauth/token" \
  -u "${CTP_CLIENT_ID}:${CTP_CLIENT_SECRET}" \
  -d "grant_type=client_credentials&scope=manage_connectors_deployments:${PROJECT_KEY}" \
  | jq -r '.access_token')

curl -s -X POST \
  "https://connect.${REGION}.commercetools.com/${PROJECT_KEY}/deployments" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"key\": \"${DEPLOYMENT_KEY}\",
    \"connector\": {
      \"key\": \"${CONNECTOR_KEY}\",
      \"version\": ${PUBLISHED_VERSION},
      \"staged\": false
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
  }" | jq '{ key: .key, status: .status, id: .id, error: .message }'
```

Poll deployment status every 2 minutes with `/loop 2m` until `status` is `Deployed` or `Failed`.

---

## Verify before proceeding

| Check | Expected |
|---|---|
| New tag pushed to remote | ✅ |
| ConnectorStaged `repository.tag` updated | ✅ |
| `isPreviewable` is `true` | ✅ |
| ConnectorStaged `status` is `Published` | ✅ |
| Deployment `status` is `Deployed` | ✅ |

**GO** → smoke test the new deployment endpoint to confirm your changes are live.

**NO-GO** → check `previewableReport` or deployment `details` for failure information.

---

**Next skill:** `ct-connector-deploy-test` (if you want to validate the new version in a test deployment before promoting to prod)
