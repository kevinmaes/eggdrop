# Changesets

This directory contains changeset files that describe changes for each PR.



## Creating a changeset

Run `pnpm changeset` and follow the prompts, then commit the generated file with your PR.

## Changeset types

- **patch** (0.0.x): Bug fixes, documentation updates, minor improvements
- **minor** (0.x.0): New features, backward-compatible changes
- **major** (x.0.0): Breaking changes, API changes

## Workflow


### Dual Branch Workflow

1. Create feature branch from `dev`
2. Make changes and create changeset (`pnpm changeset`)
3. Create PR to `dev`
4. Merge PR to `dev` → Version workflow creates/updates "Version Packages" PR targeting `dev`
5. Multiple PRs can be merged to `dev`, batching changes
6. When ready, merge "Version Packages" PR to `dev`
7. Manually trigger "Release to Main" workflow → Pushes `dev` to `main` → Deploys to production


For more information, see the [changesets documentation](https://github.com/changesets/changesets).
