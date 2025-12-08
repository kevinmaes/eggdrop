# Fix: Version Packages PR Not Triggering CI

## Problem

The "Version Packages" PR (created by changesets) doesn't automatically trigger CI workflows because GitHub Actions using `GITHUB_TOKEN` intentionally don't trigger workflows on PRs they create/update (prevents infinite loops).

## Solution

Use a Personal Access Token (PAT) instead of `GITHUB_TOKEN` for the changesets action.

## Setup Steps

### 1. Create a Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Click "Generate new token"
3. Configure the token:
   - **Name**: `Changesets Workflow Token`
   - **Expiration**: 90 days (or custom)
   - **Repository access**: Only select repositories → `eggdrop`
   - **Permissions**:
     - Contents: Read and write
     - Pull requests: Read and write
     - Workflows: Read and write (allows triggering workflows)
4. Generate token and copy it

### 2. Add Token to Repository Secrets

1. Go to Repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. **Name**: `CHANGESETS_TOKEN`
4. **Value**: Paste the token you created
5. Save

### 3. Workflow Already Updated

The `version.yml` workflow has been updated to use `CHANGESETS_TOKEN` with fallback to `GITHUB_TOKEN`:

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.CHANGESETS_TOKEN || secrets.GITHUB_TOKEN }}
```

## Verification

After adding the secret:

1. Merge a PR with a changeset to `dev`
2. The Version workflow will run and update the "Version Packages" PR
3. CI workflow should now automatically trigger on the PR update
4. Check that "Verify Build" status appears on the PR

## Alternative: Manual Trigger

If you prefer not to use a PAT, you can manually trigger CI:

```bash
gh workflow run ci.yml --ref changeset-release/dev
```

Or simply close and reopen the PR to trigger CI.

## Token Maintenance

- PATs expire - you'll need to regenerate and update the secret periodically
- GitHub will email you when the token is about to expire
- Consider setting a calendar reminder to regenerate the token
