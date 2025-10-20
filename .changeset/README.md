# Changesets

This directory contains changeset files that describe what changes each pull request introduces. This helps maintain a changelog and prepare release notes.

## How to create a changeset

When you create a PR that should trigger a release, you need to include a changeset file:

1. **Run the changeset CLI**:

   ```bash
   pnpm changeset
   ```

2. **Follow the prompts**:
   - Select the type of change (patch, minor, or major)
   - Write a brief description of what changed

3. **Commit the changeset file** with your PR

## Changeset Types

- **`patch`**: Bug fixes and minor changes (e.g., typo fixes, small improvements)
- **`minor`**: New features that are backward compatible (e.g., new gameplay features)
- **`major`**: Breaking changes (e.g., major refactors, API changes)

## Manual Creation

You can also manually create a changeset file in this directory:

```markdown
---
'vite-project': patch
---

Brief description of what changed
```

## Automated Workflow

The GitHub Actions workflow will:

1. **On PR to dev**: Check that a changeset file exists (or skip for "Version Packages" PRs)
2. **On merge to dev**: Create or update a "Version Packages" PR targeting `main`
3. **On merge to main**: Update version and changelog, trigger Vercel deployment

## Version Packages PR

The automated "Version Packages" PR will:

- Batch all changesets since the last release
- Update version in `package.json`
- Update `CHANGELOG.md` with all changes
- Be ready to merge when you want to deploy to production

Simply merge the "Version Packages" PR to `main` when you're ready to release!

## Complete Setup Guide

For complete setup instructions and to use this workflow in other projects:

👉 **[Changesets Workflow Setup Guide](https://gist.github.com/kevinmaes/333b6e0c9e873872e543f742b2e54a7f)**
