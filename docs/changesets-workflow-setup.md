# Changesets Workflow Setup Guide

This guide provides complete instructions for setting up a changesets-based release workflow in any project. It covers both single-branch (main-only) and dual-branch (dev/main) strategies, as well as configurations for apps (Vercel) and npm packages.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Branching Strategies](#branching-strategies)
- [Workflow Files](#workflow-files)
- [Package Scripts](#package-scripts)
- [Usage](#usage)
- [Deployment Scenarios](#deployment-scenarios)
- [Troubleshooting](#troubleshooting)

## Overview

Changesets is a tool for managing versions and changelogs with a focus on multi-package repositories, though it works great for single-package projects too. It automates:

- Version bumping based on semantic versioning
- Changelog generation
- GitHub release creation
- npm publishing (for packages)

## Prerequisites

- Git repository hosted on GitHub
- pnpm package manager
- Node.js 18+ recommended

## Installation

### 1. Install the changesets CLI

```bash
pnpm add -D @changesets/cli
```

### 2. Add scripts to package.json

```json
{
  "scripts": {
    "changeset": "changeset",
    "version": "changeset version"
  }
}
```

For npm packages, add a release script:

```json
{
  "scripts": {
    "release": "pnpm build && changeset publish"
  }
}
```

## Configuration

### Create .changeset/config.json

Create a `.changeset/config.json` file in your project root:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@2.3.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

**Key configuration options:**

- `baseBranch`: The branch that "Version Packages" PRs target (usually `main`)
- `access`: Set to `"public"` for public npm packages, `"restricted"` for private
- `commit`: Whether to commit changesets automatically (usually `false`)

### Create .changeset/README.md

Create a helpful README for your team:

```markdown
# Changesets

This directory contains changeset files that describe changes for each PR.

## Creating a changeset

Run `pnpm changeset` and follow the prompts, then commit the generated file with your PR.

## Changeset types

- **patch**: Bug fixes and minor changes
- **minor**: New features (backward compatible)
- **major**: Breaking changes
```

## Branching Strategies

### Strategy 1: Single Branch (main-only)

**Example:** badge-badger

**Workflow:**

1. Feature PR → `main` (with changeset)
2. Merge to `main` → Creates/updates "Version Packages" PR
3. Merge "Version Packages" PR → Publishes to npm

**Best for:** npm packages, simple projects

### Strategy 2: Dual Branch (dev/main)

**Example:** eggdrop

**Workflow:**

1. Feature PR → `dev` (with changeset)
2. Merge to `dev` → Creates/updates "Version Packages" PR targeting `main`
3. More features merge to `dev` → Updates existing "Version Packages" PR (batching)
4. Merge "Version Packages" PR to `main` → Deploys to production

**Best for:** Apps with staging environments, projects requiring release batching

## Workflow Files

### CI Workflow

Create or update `.github/workflows/ci.yml` to check for changesets on PRs.

#### Single Branch (main-only)

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  changeset-check:
    name: Changeset Check
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request' && !contains(github.event.pull_request.title, 'Version Packages')
    steps:
      - name: Checkout with full history
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check for changeset
        run: pnpm changeset status --since=origin/main

  # ... other jobs (tests, lint, etc.)
```

#### Dual Branch (dev/main)

```yaml
name: CI

on:
  pull_request:
    branches: [dev, main]

jobs:
  changeset-check:
    name: Changeset Check
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request' && !contains(github.event.pull_request.title, 'Version Packages')
    steps:
      - name: Checkout with full history
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22.x
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check for changeset
        run: pnpm changeset status --since=origin/dev

  # ... other jobs (tests, lint, etc.)
```

### Release Workflow

Create `.github/workflows/release.yml`.

#### For Apps (Vercel, etc.)

```yaml
name: Release

on:
  push:
    branches:
      - dev # Add 'main' for dual-branch, or just 'main' for single-branch
      - main
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22.x
          cache: 'pnpm'

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Create Release Pull Request
        uses: changesets/action@v1
        with:
          version: pnpm version
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### For npm Packages

```yaml
name: Release

on:
  push:
    branches:
      - main
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'pnpm'

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Force Publish to npm
        if: github.event_name == 'workflow_dispatch'
        run: pnpm release
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Important:** For npm publishing, add `NPM_TOKEN` to your repository secrets.

## Package Scripts

Ensure your package.json has these scripts:

```json
{
  "scripts": {
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm build && changeset publish" // npm packages only
  }
}
```

## Usage

### Creating a Changeset

When you make changes that should trigger a release:

1. Run `pnpm changeset`
2. Select the type of change (patch, minor, major)
3. Write a brief description
4. Commit the generated changeset file with your PR

### Changeset Types

- **patch** (0.0.x): Bug fixes, documentation updates, minor improvements
- **minor** (0.x.0): New features, backward-compatible changes
- **major** (x.0.0): Breaking changes, API changes

### The Release Process

#### Single Branch (main-only)

1. Create feature branch from `main`
2. Make changes and create changeset (`pnpm changeset`)
3. Create PR to `main`
4. CI validates changeset exists
5. Merge PR → Release workflow creates "Version Packages" PR
6. Review and merge "Version Packages" PR → Publishes/deploys

#### Dual Branch (dev/main)

1. Create feature branch from `dev`
2. Make changes and create changeset (`pnpm changeset`)
3. Create PR to `dev`
4. CI validates changeset exists
5. Merge PR to `dev` → Release workflow creates/updates "Version Packages" PR to `main`
6. Multiple PRs can be merged to `dev`, batching changes in the "Version Packages" PR
7. When ready to release, merge "Version Packages" PR to `main` → Deploys to production

## Deployment Scenarios

### Vercel Apps

For Vercel-deployed apps:

- No `publish` step needed in release workflow
- Vercel automatically deploys when PR merges to `main`
- The release workflow only handles version bumping and changelog generation

### npm Packages

For npm packages:

- Include `publish: pnpm release` in the changesets action
- Add `NPM_TOKEN` to repository secrets
- The release workflow handles both versioning and publishing to npm

### Other Platforms

For other deployment platforms (Netlify, AWS, etc.):

- Follow the "Vercel Apps" pattern (no publish step)
- Configure your platform to deploy on pushes to `main`

## Troubleshooting

### "No changesets present" error on PR

**Problem:** CI fails because no changeset was added to the PR.

**Solution:** Run `pnpm changeset` and commit the generated file.

### "Version Packages" PR not created

**Problem:** Release workflow runs but doesn't create a PR.

**Solutions:**

- Ensure `GITHUB_TOKEN` has proper permissions
- Check that `baseBranch` in config.json matches your target branch
- Verify workflow triggers on the correct branch

### Multiple "Version Packages" PRs

**Problem:** Multiple version PRs exist instead of one being updated.

**Solution:** Changesets should automatically update the existing PR. If not:

- Close duplicate PRs manually
- Ensure only one release workflow is configured

### npm publish fails

**Problem:** Release workflow fails when trying to publish to npm.

**Solutions:**

- Verify `NPM_TOKEN` is set in repository secrets
- Ensure package name is available on npm
- Check `access` setting in .changeset/config.json

### Changeset check fails with "since" error

**Problem:** `pnpm changeset status --since=origin/main` fails.

**Solutions:**

- Ensure full git history is fetched (`fetch-depth: 0`)
- Verify the base branch name is correct
- Check that the branch exists on origin

## Examples from Real Projects

### badge-badger (npm package, single branch)

- Repository: [badge-badger](https://github.com/kevinmaes/badge-badger)
- Strategy: Single branch (main-only)
- Deployment: npm publish
- Workflow files:
  - `.github/workflows/ci.yml` - Checks for changesets
  - `.github/workflows/release.yml` - Publishes to npm

### eggdrop (app, dual branch)

- Repository: [eggdrop](https://github.com/kevinmaes/eggdrop)
- Strategy: Dual branch (dev/main)
- Deployment: Vercel
- Workflow files:
  - `.github/workflows/ci.yml` - Checks for changesets on dev/main
  - `.github/workflows/release.yml` - Creates version PRs, no publish step

## Additional Resources

- [Changesets Documentation](https://github.com/changesets/changesets)
- [changesets/action GitHub Action](https://github.com/changesets/action)
- [Semantic Versioning](https://semver.org/)

## Summary Checklist

- [ ] Install `@changesets/cli`
- [ ] Create `.changeset/config.json`
- [ ] Create `.changeset/README.md`
- [ ] Add changeset scripts to `package.json`
- [ ] Create/update CI workflow with changeset check
- [ ] Create release workflow
- [ ] Configure GitHub secrets (for npm: `NPM_TOKEN`)
- [ ] Test workflow with a sample changeset
- [ ] Document process for team members
