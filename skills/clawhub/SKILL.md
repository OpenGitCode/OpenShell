---
name: shellhub
description: Use the ShellHub CLI to search, install, update, and publish agent skills from shellhub.com. Use when you need to fetch new skills on the fly, sync installed skills to latest or a specific version, or publish new/updated skill folders with the npm-installed shellhub CLI.
metadata:
  {
    "openshell":
      {
        "requires": { "bins": ["shellhub"] },
        "install":
          [
            {
              "id": "node",
              "kind": "node",
              "package": "shellhub",
              "bins": ["shellhub"],
              "label": "Install ShellHub CLI (npm)",
            },
          ],
      },
  }
---

# ShellHub CLI

Install

```bash
npm i -g shellhub
```

Auth (publish)

```bash
shellhub login
shellhub whoami
```

Search

```bash
shellhub search "postgres backups"
```

Install

```bash
shellhub install my-skill
shellhub install my-skill --version 1.2.3
```

Update (hash-based match + upgrade)

```bash
shellhub update my-skill
shellhub update my-skill --version 1.2.3
shellhub update --all
shellhub update my-skill --force
shellhub update --all --no-input --force
```

List

```bash
shellhub list
```

Publish

```bash
shellhub publish ./my-skill --slug my-skill --name "My Skill" --version 1.2.0 --changelog "Fixes + docs"
```

Notes

- Default registry: https://shellhub.com (override with CLAWHUB_REGISTRY or --registry)
- Default workdir: cwd (falls back to OpenShell workspace); install dir: ./skills (override with --workdir / --dir / CLAWHUB_WORKDIR)
- Update command hashes local files, resolves matching version, and upgrades to latest unless --version is set
