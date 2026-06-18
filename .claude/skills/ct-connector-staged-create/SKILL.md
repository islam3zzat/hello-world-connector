---
name: ct-connector-staged-create
description: >
  Create a ConnectorStaged in commercetools Connect — the working draft of a Connector that references
  a GitHub repository. Use this skill after the GitHub repo is set up and tagged. Trigger for phrases
  like "create connector staged", "register the connector", "create the draft connector", or when
  following the ct-connector-github-setup skill.
---

# Create a ConnectorStaged

> For auth token setup and region reference, see [`references/auth.md`](../references/auth.md).

A ConnectorStaged is the working draft of your Connector in commercetools Connect. It references your
GitHub repository at a specific tag and is parsed to extract your `connect.yaml` configuration.

## Prerequisites check

Confirm all of the following before proceeding:

- [ ] GitHub repo is created and code is pushed
- [ ] A Git tag exists (e.g. `v1.0.0`) and is pushed to remote
- [ ] For private repos: `connect-mu` has been granted read access
- [ ] CT API credentials ready: `CTP_PROJECT_KEY`, `CTP_CLIENT_ID`, `CTP_CLIENT_SECRET`, `CTP_REGION`

## Argument hints — gather these before running

| Variable | Example | Description |
|---|---|---|
| `CONNECTOR_KEY` | `my-payment-connector` | Unique key for this connector |
| `CONNECTOR_NAME` | `My Payment Connector` | Human-readable name |
| `CONNECTOR_DESCRIPTION` | `Integrates Acme PSP` | Short description |
| `GITHUB_REPO_URL` | `https://github.com/org/repo.git` | Full `.git` URL |
| `GITHUB_TAG` | `v1.0.0` | Git tag to deploy |
| `REGION` | `europe-west1.gcp` | CT Connect region |
| `SUPPORTED_REGIONS` | `["europe-west1.gcp"]` | Regions this connector supports |
| `PRIVATE_PROJECTS` | `["europe-west1.gcp:my-project"]` | Projects allowed to deploy (private use) |
| Creator `name`, `email`, `company` | — | Your details as connector creator |

## Step 1: Get an access token

```bash
export ACCESS_TOKEN=$(curl -s -X POST \
  "https://auth.${REGION}.commercetools.com/oauth/token" \
  -u "${CTP_CLIENT_ID}:${CTP_CLIENT_SECRET}" \
  -d "grant_type=client_credentials&scope=manage_connectors:${CTP_PROJECT_KEY}" \
  | jq -r '.access_token')
```

`manage_connectors` is the only scope needed to create a ConnectorStaged — see [`references/auth.md`](../references/auth.md).

## Step 2: Create the ConnectorStaged

```bash
curl -s -X POST \
  "https://connect.${REGION}.commercetools.com/connectors/drafts" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"key\": \"${CONNECTOR_KEY}\",
    \"name\": \"${CONNECTOR_NAME}\",
    \"description\": \"${CONNECTOR_DESCRIPTION}\",
    \"creator\": {
      \"name\": \"Your Name\",
      \"email\": \"you@example.com\",
      \"company\": \"Your Company\"
    },
    \"repository\": {
      \"url\": \"${GITHUB_REPO_URL}\",
      \"tag\": \"${GITHUB_TAG}\"
    },
    \"supportedRegions\": [\"${REGION}\"],
    \"privateProjects\": [\"${REGION}:${CTP_PROJECT_KEY}\"]
  }" | jq .
```

> Even if you plan to publish publicly, you still need at least one entry in `privateProjects` to deploy the ConnectorStaged to a test project during the previewable step. Add your development project here. Projects not listed will receive a 403 when attempting deployment.

## Save the response

From the response, note and save:
- `id` — the ConnectorStaged ID
- `version` — current version number (starts at `1`)
- `key` — your connector key

These are required for every subsequent API call.

## Verify

```bash
curl -s \
  "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  | jq '{ status: .status, key: .key, configurations: .configurations, repository: .repository }'
```

**GO criteria:**
- [ ] `status` is `"Draft"` (the `ConnectorStatus` enum is capitalized: `Draft`, `Processing`, `ReadyForCertification`, `InCertification`, `Published`, `Failed`)
- [ ] `configurations` array is populated (auto-parsed from your `connect.yaml`)
- [ ] `repository.url` and `repository.tag` match what you submitted

**NO-GO:** If `configurations` is empty, CT could not parse your `connect.yaml` — verify the file exists at the repo root and the tag references the correct commit.

---

**Next skill:** `ct-connector-previewable`
