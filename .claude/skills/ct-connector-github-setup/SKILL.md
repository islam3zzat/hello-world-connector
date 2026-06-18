---
name: ct-connector-github-setup
description: >
  Set up a GitHub repository for a commercetools Connect connector. Use this skill when the user needs
  to push their connector to GitHub, configure repo visibility (public or private), add the commercetools
  connect-mu bot user for private repos, and verify the repo is ready for ConnectorStaged creation.
  Trigger for phrases like "push to github", "set up the repo", "configure github for connector",
  "add connect-mu", or when following the ct-connector-scaffold skill.
---

# ct-connector-github-setup

Push the connector to GitHub and prepare it for ConnectorStaged creation. Connect pulls code from GitHub — the repo URL and a Git tag are required inputs for the next step.

## Prerequisites check

Before starting, verify the scaffold is complete:

```bash
ls connect.yaml          # must exist
ls -d */                 # at least one app folder present
git status               # check if git is already initialized
```

If `git status` says "not a git repository", initialize it now:

```bash
git init
git add .
git commit -m "feat: initial connector scaffold"
```

---

## Step 1: Choose repo visibility

**You must explicitly tell me which you want — do not assume a default.**

| Option | Access requirement |
|---|---|
| **Public** | No special setup needed. Anyone can read the code. |
| **Private** | Must grant read access to the `connect-mu` GitHub machine user. |

If your integration contains secrets, credentials, or proprietary business logic, use **private**. If it's an open-source connector, use **public**.

---

## Step 2: Create and push to GitHub

Use the `gh` CLI (install from https://cli.github.com if needed).

```bash
# Public repo:
gh repo create <repo-name> --public --source=. --remote=origin --push

# Private repo:
gh repo create <repo-name> --private --source=. --remote=origin --push
```

Replace `<repo-name>` with your connector's name (e.g. `my-payment-connector`).

---

## Step 3: Add connect-mu (private repos only)

The `connect-mu` machine user is the GitHub account commercetools uses to read your repo during build and deployment. Without this, ConnectorStaged creation will fail for private repos.

```bash
gh api repos/<owner>/<repo>/collaborators/connect-mu -X PUT -f permission=read
```

Or via GitHub UI: **Settings → Collaborators and teams → Add people → `connect-mu`** → Role: Read.

After adding, `connect-mu` will receive an invitation. CT's systems accept it automatically — no action needed on your side.

> **Personal repo caveat:** Auto-accept of the `connect-mu` invitation works reliably for **GitHub organisation repos**. For personal account repos (`github.com/<your-username>/...`), auto-accept may take a long time or not happen at all. If you're blocked after 15+ minutes, the recommended workarounds are:
> 1. **Use a GitHub org** — transfer or create the repo under an org (free orgs are available). This is the recommended approach for real connectors.
> 2. **Temporarily make the repo public** — create the ConnectorStaged (which just needs to read `connect.yaml` and the tag), then switch back to private immediately after.
>
> ```bash
> # Temporarily public, create ConnectorStaged, then private again:
> gh repo edit <owner>/<repo> --visibility public --accept-visibility-change-consequences
> # ... run ct-connector-staged-create ...
> gh repo edit <owner>/<repo> --visibility private
> ```

---

## Step 4: Create and push a Git tag

Connect references a specific Git tag in the ConnectorStaged — not a branch. Every release needs its own tag.

```bash
git tag v1.0.0
git push origin v1.0.0
```

Tag naming convention: follow [semver](https://semver.org/) — `v<major>.<minor>.<patch>`. The tag must exist on the remote before creating the ConnectorStaged.

> The tag you push here becomes the immutable snapshot CT deploys. During an active certification process, this tag must not be changed or deleted.

---

## Verify before proceeding

```bash
# Repo exists on GitHub
gh repo view

# Tag exists locally and remotely
git tag -l
gh api repos/<owner>/<repo>/git/refs/tags

# Private only: connect-mu has access
gh api repos/<owner>/<repo>/collaborators/connect-mu
# Expect HTTP 204 (no body) = access confirmed; HTTP 404 = not a collaborator
```

Record the following — you will need them in the next skill:

| Value | Where to find it |
|---|---|
| **Repo URL** | `gh repo view --json url -q .url` — use the `.git` HTTPS URL |
| **Tag** | `git tag -l` |
| **Owner/repo** | `gh repo view --json nameWithOwner -q .nameWithOwner` |

### GO / NO-GO

| Check | Expected |
|---|---|
| Repo exists on GitHub | ✅ |
| `connect-mu` is a collaborator (private only) | ✅ |
| Git tag pushed to remote | ✅ |
| Repo URL (`.git` HTTPS form) noted | ✅ |

All passing? → **GO** — proceed to `ct-connector-staged-create`.

Any failing? → **NO-GO** — a missing tag or missing `connect-mu` access are the two most common causes of ConnectorStaged creation failures.
