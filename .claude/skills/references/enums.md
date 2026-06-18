# Connect API enums — single source of truth

These enum values are verified against the Connect OpenAPI schema (`connect-ConnectorStaged`,
`connect-Deployment`). When CT adds or renames a value, update it **here** — the lifecycle skills
link to this file rather than re-tabulating the enums.

## `ConnectorStatus` (ConnectorStaged `.status`)

String enum. Drives the publish/certification flow.

| Value | Meaning |
|---|---|
| `Draft` | The ConnectorStaged is currently a draft |
| `Processing` | A publish request is being processed |
| `ReadyForCertification` | Submitted for certification, awaiting CT review |
| `InCertification` | CT team is actively reviewing |
| `Published` | Published — for public connectors, listed on the marketplace |
| `Failed` | Publish/certification did not succeed |

> Private publish path: `Draft → Processing → Published` (or `Failed`).
> Public/certification path adds `ReadyForCertification` and `InCertification` before `Published`.

## `IsPreviewable` (ConnectorStaged `.isPreviewable`)

**String enum — not a boolean.** Match on the string `"true"`/`"false"`, never boolean `true`/`false`.

| Value | Meaning | Action |
|---|---|---|
| `none` | No previewable request made yet | Submit `updatePreviewable` |
| `pending` | Validation in progress | Keep polling |
| `true` | Approved — can be used in a Deployment | Proceed to deploy |
| `false` | Rejected | Read `previewableReport`, fix, push new tag, retry |

> Rejections are typically critical security issues found in the repo. Details are in the
> `previewableReport` field (a `ConnectorReport`).

## `DeploymentStatus` (Deployment `.status`)

| Value | Meaning |
|---|---|
| `Draft` | Created but not yet queued |
| `Queued` | Submitted, waiting to start (initial status of a new deployment) |
| `Deploying` | Build/deploy in progress |
| `Deployed` | Success — live; post-deploy scripts have run |
| `Failed` | Deployment failed — check `details.build.report.entries[]` |
| `Undeploying` | Being torn down |
| `UndeployFailed` | Teardown failed |

> Stop polling at `Deployed` or `Failed`. `Deploying` is the normal in-progress state.

## `DeploymentType` (Deployment `.type`)

| Value | Meaning |
|---|---|
| `preview` | The deployed target is a previewable ConnectorStaged. **Inferred when `connector.staged: true`.** |
| `sandbox` | Non-production deployment of a **published** Connector. Default if no type is specified. Cannot host a ConnectorStaged. |
| `production` | Production deployment of a published Connector. Project must not be a trial. |

> A staged/preview deploy is selected by `connector.staged: true` — the server creates a
> `preview`-type Deployment. You do not set `type` explicitly for a staged deploy.

## `ConnectorReportEntryType` / `DeploymentReportEntryType`

Both `publishingReport`/`previewableReport` (`ConnectorReport`) and deployment
`details.build.report` (`DeploymentReport`) use entries with this `type`:

| Value | Meaning |
|---|---|
| `Information` | Informational message from the publish/preview/deploy task |
| `Warning` | A non-fatal issue arose |
| `Error` | A crash or failure to complete the task — look here first on rejection/failure |

Each entry also has `title`, `message`, and `createdAt`.
