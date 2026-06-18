---
name: ct-connector-previewable
description: >
  Request previewable status for a ConnectorStaged and poll until it is approved or rejected.
  Previewable status is required before deploying to a test project. Use this skill after a
  ConnectorStaged has been created. Trigger for phrases like "request previewable", "make connector
  previewable", "submit for preview", or when following ct-connector-staged-create.
---

# Request Previewable Status

Previewable status lets you deploy your ConnectorStaged to a test project for validation. CT runs
automated security and configuration checks — this is **asynchronous** and can take minutes to hours.

## Prerequisites

- [ ] `CONNECTOR_KEY` and current `VERSION` from the ConnectorStaged creation step
- [ ] `ACCESS_TOKEN` (refresh if expired — tokens last 2 hours)
- [ ] `REGION` set

## Step 1: Submit the previewable request

```bash
curl -s -X POST \
  "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"version\": ${VERSION},
    \"actions\": [{ \"action\": \"updatePreviewable\" }]
  }" | jq '{ version: .version, isPreviewable: .isPreviewable, status: .status }'
```

The response will show `isPreviewable: "pending"` — CT has queued the validation.

## Step 2: Poll for result (background)

Use `/loop 5m` to poll every 5 minutes. Run this poll command each iteration:

```bash
curl -s \
  "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  | jq '{ isPreviewable: .isPreviewable, status: .status, previewableReport: .previewableReport }'
```

**`isPreviewable` is a string enum, not a boolean** — match on `"true"`/`"false"`, never boolean `true`/`false`. Full table in [`references/enums.md`](../references/enums.md#ispreviewable-connectorstaged-ispreviewable):

- `"none"` → not requested yet (submit Step 1) · `"pending"` → keep polling · `"true"` → proceed to deploy · `"false"` → read `previewableReport`, fix, retry

Stop polling once `isPreviewable` is `"true"` or `"false"`.

> `previewableReport` is a `ConnectorReport` (`.entries[]`, each with `type`/`title`/`message`/`createdAt`). On rejection, look for `type: "Error"` entries — see the report-entry table in [`references/enums.md`](../references/enums.md#connectorreportentrytype--deploymentreportentrytype).

## If rejected — remediation flow

1. Read `previewableReport` in the response for failure details
2. Common causes: security scan failures, malformed `connect.yaml`, missing required scripts
3. Fix the issues in your code, then follow **`ct-connector-update`** from Step 2 (new tag → setRepository → re-submit previewable)

## Verify

```bash
curl -s \
  "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  | jq '{ isPreviewable: .isPreviewable, status: .status }'
```

**GO criteria:**
- [ ] `isPreviewable` is `"true"`

**NO-GO:** `isPreviewable` is `"false"` — work through the remediation flow above before proceeding.

---

**Next skill:** `ct-connector-deploy-test`
