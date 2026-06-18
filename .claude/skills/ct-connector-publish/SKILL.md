---
name: ct-connector-publish
description: >
  Publish a ConnectorStaged — either privately (for use in your own projects only) or publicly
  (which triggers the certification process for marketplace listing). Use this skill after test
  deployment is verified. Trigger for phrases like "publish connector", "publish privately",
  "submit for certification", "list on marketplace", or when following ct-connector-deploy-test.
---

# Publish ConnectorStaged

## Prerequisites
- Test deployment verified and working (GO from `ct-connector-deploy-test`)
- ConnectorStaged `key` and current `version`
- CT access token with `manage_connectors` scope

## Step 1: Choose publish path

**The user MUST explicitly state their preference — do not assume.**

Ask directly:

> "Do you want to publish **privately** (available only to your own CT projects, no certification needed) or **publicly** (listed on the Connect Marketplace, requires certification)?"

| Path | Who can deploy it | Certification required | Time |
|---|---|---|---|
| **Private** | Only your `privateProjects` | No | Minutes |
| **Public** | Any CT project via marketplace | Yes — human review | Days to weeks |

---

## Step 2a: Private publish

> Use **escaped double quotes** so `${VERSION}` expands. A single-quoted body sends the literal `${VERSION}` and the request fails with invalid JSON.

```bash
curl -s -X POST \
  "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"version\": ${VERSION},
    \"actions\": [{ \"action\": \"publish\", \"certification\": false }]
  }" | jq '{ status: .status, version: .version }'
```

### Poll for completion (every 60s)

```bash
curl -s \
  "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  | jq '{ status: .status, publishingReport: .publishingReport }'
```

Use `/loop 1m` until `status` reaches a terminal state. The private publish path is `Draft` → `Processing` → `Published` (or `Failed`) — watch for `Published`. Full `ConnectorStatus` enum in [`references/enums.md`](../references/enums.md#connectorstatus-connectorstaged-status).

### Verify (private)
- [ ] `status` is `Published` (not `Processing` or `Failed`)
- [ ] `publishingReport.entries[]` contains no `type: "Error"` entries
- [ ] Connector appears in `GET https://connect.${REGION}.commercetools.com/connectors`
- [ ] Can be deployed to projects in `privateProjects`

**GO** → connector is live for private use. Done.

---

## Step 2b: Public publish (triggers certification)

Before submitting, confirm:
- [ ] Tests are present and passing
- [ ] `LICENSE` file exists in the repo root
- [ ] `README.md` is complete with setup instructions
- [ ] You have contacted your commercetools Partnership Manager
- [ ] The Git tag in `repository.tag` is final — **do not change it during certification**

```bash
curl -s -X POST \
  "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"version\": ${VERSION},
    \"actions\": [{ \"action\": \"publish\", \"certification\": true }]
  }" | jq '{ status: .status, version: .version }'
```

After this, `status` moves toward `ReadyForCertification` / `InCertification`.

**GO** → proceed to `ct-connector-certify` for polling the certification process.
