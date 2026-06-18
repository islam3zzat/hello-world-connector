---
name: ct-connector-certify
description: >
  Monitor and manage the commercetools Connect certification process.
  When certification=true, this publishes to the public marketplace (requires CT team review).
  When certification=false, this publishes as a private connector (no review required).
  This is a long-running human-gated process only when publishing publicly. Use this skill after requesting publication.
  Trigger for phrases like "check certification status", "certification progress", "is it certified yet",
  "fix certification issues", "publish privately", or when following ct-connector-publish.
  Args: certification=true (public marketplace, human review) | certification=false (private connector, no review).
---

# Certification Process

## certification=false — Private Connector

When `certification` is `false`, the connector is published as a **private connector** — no CT team review is required. The connector can only be deployed to projects listed in the `privateProjects` field of your ConnectorStaged and will **not** appear on the public marketplace.

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

Publishing is **not instantaneous** — the system runs automated validation before the Connector is created. Poll until `status` reflects a published state and check `publishingReport` for errors or warnings. Use `/loop 2m` — this typically completes in minutes, not days:

```bash
curl -s \
  "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  | jq '{ status: .status, publishingReport: .publishingReport }'
```

---

## certification=true — Public Marketplace

## What to expect

Certification is **not automated** — the CT team performs a human review. There is no official SLA; expect days to weeks. The review covers:

- Functional completeness
- Security
- Deployment compatibility
- Documentation quality
- License file presence
- Test coverage

> **Critical:** The Git tag in `repository.tag` must remain unchanged for the entire duration of certification. Do not push a new tag or update the reference until the current review cycle completes or is rejected.

## Polling (public certification)

Use `/loop 30m` — human review takes days to weeks, so poll infrequently:

```bash
curl -s \
  "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  | jq '{ status: .status, certificationInfo: .certificationInfo, publishingReport: .publishingReport }'
```

The `ConnectorStatus` enum exposes the certification stages directly — watch the `status` field:

| `status` | Meaning |
|---|---|
| `ReadyForCertification` | Submitted, awaiting CT review |
| `InCertification` | CT team is actively reviewing |
| `Published` | Approved and certified — listed on the marketplace |
| `Failed` | Rejected — see feedback below |

Alongside `status`, watch these fields for detail:

- **Approved:** `status` is `Published`; the Connector becomes discoverable via `GET https://connect.${REGION}.commercetools.com/connectors` (the public list). Your commercetools Partnership Manager will also notify you directly.
- **Rejected / needs changes:** `status` is `Failed`; `certificationInfo.comments[]` (each with `userId`, `datetime`, `comment`) and/or `publishingReport.entries[]` carry the reviewer feedback. The CT team may also email you.
- **Still in progress:** `status` stays `ReadyForCertification` or `InCertification` — keep polling.

If after several days there is no change and no communication from CT, reach out to your Partnership Manager directly.

## Pre-certification checklist

Confirm all of these before the review begins:

- [ ] Unit and integration tests present and passing
- [ ] `README.md` with complete setup, configuration, and usage instructions
- [ ] `LICENSE` file in the repository root
- [ ] `connect.yaml` is complete and accurate
- [ ] All required env vars documented in `connect.yaml` and `README.md`
- [ ] Post-deploy / pre-undeploy scripts implemented and tested
- [ ] Contact established with commercetools Partnership Manager

## If issues are found

The CT team will report problems via `publishingReport` or direct contact. To fix and resubmit:

1. Fix the code in your repository
2. Create a new Git tag:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
3. Update the ConnectorStaged to reference the new tag (escaped double quotes so `${...}` expands):
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
         \"tag\": \"v1.0.1\"
       }]
     }" | jq '{ version: .version, repository: .repository }'
   ```
4. Re-request certification (re-fetch `VERSION` first — `setRepository` incremented it):
   ```bash
   export VERSION=$(curl -s \
     "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
     -H "Authorization: Bearer ${ACCESS_TOKEN}" | jq '.version')

   curl -s -X POST \
     "https://connect.${REGION}.commercetools.com/connectors/drafts/key=${CONNECTOR_KEY}" \
     -H "Authorization: Bearer ${ACCESS_TOKEN}" \
     -H "Content-Type: application/json" \
     -d "{
       \"version\": ${VERSION},
       \"actions\": [{ \"action\": \"publish\", \"certification\": true }]
     }" | jq '{ status: .status, version: .version }'
   ```

## Verify (final)

- [ ] `status` shows certified / published state
- [ ] Connector is listed on the [Connect Marketplace](https://marketplace.commercetools.com/connectors)
- [ ] Any CT project can discover and deploy it

**GO** → connector is publicly live on the marketplace. This is the final step in the connector lifecycle.
