# Branch Protection Setup Guide

This guide will help you configure branch protection rules for the `main` branch to enforce GitHub Flow best practices.

## Prerequisites

- Repository admin access
- GitHub Actions CI workflow enabled (already set up in `.github/workflows/ci.yml`)

## Setting Up Branch Protection

### 1. Navigate to Branch Protection Settings

1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Branches** in the left sidebar
4. Under "Branch protection rules", click **Add rule**

### 2. Configure Branch Name Pattern

- **Branch name pattern:** `main`

### 3. Recommended Protection Rules

#### ✅ Protect matching branches

Check this to enable protection.

#### ✅ Require a pull request before merging

- **Required approvals:** 1 (adjust based on team size)
- ✅ **Dismiss stale pull request approvals when new commits are pushed**
- ✅ **Require review from Code Owners** (if you have a CODEOWNERS file)
- ☐ **Restrict who can dismiss pull request reviews** (optional, for larger teams)
- ✅ **Require approval of the most recent reviewable push**

#### ✅ Require status checks to pass before merging

- ✅ **Require branches to be up to date before merging**

**Required status checks** (add these):

- `Lint, Format Check, and Test`
- `Build Web`
- `Validate Commit Messages` (for PRs)

> **Note:** These status checks will appear after the first workflow run. You may need to save the rule, trigger a workflow, then edit the rule to add the checks.

#### ✅ Require conversation resolution before merging

Ensures all PR comments are addressed before merging.

#### ✅ Require signed commits (Optional but Recommended)

Ensures commits are cryptographically signed for security.

#### ✅ Require linear history (Recommended)

Prevents merge commits, enforces either squash or rebase merging.

#### ☐ Require deployments to succeed before merging (Optional)

Enable if you have deployment workflows.

#### ✅ Lock branch

Prevents direct pushes to `main` (everyone must use PRs).

#### ☐ Do not allow bypassing the above settings

Recommended for strict enforcement. However, you may want to allow admins to bypass in emergencies.

#### ☐ Allow force pushes (NOT RECOMMENDED)

Keep this disabled to protect `main` branch history.

#### ☐ Allow deletions (NOT RECOMMENDED)

Keep this disabled to prevent accidental branch deletion.

### 4. Save Changes

Click **Create** or **Save changes** at the bottom.

## Quick Setup for Solo Developer

If you're working solo and want a simpler setup:

### Minimal Protection

- ✅ Require a pull request before merging (0 approvals required)
- ✅ Require status checks to pass before merging
  - Add: `Lint, Format Check, and Test`
  - Add: `Build Web`
- ✅ Require conversation resolution before merging
- ✅ Lock branch

This still enforces CI checks while allowing you to self-merge PRs.

## Quick Setup for Small Team (2-5 developers)

### Recommended Protection

- ✅ Require a pull request before merging (1 approval required)
  - ✅ Dismiss stale approvals when new commits are pushed
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date
  - Add: `Lint, Format Check, and Test`
  - Add: `Build Web`
  - Add: `Validate Commit Messages`
- ✅ Require conversation resolution before merging
- ✅ Require linear history
- ✅ Lock branch
- ☐ Do not allow bypassing (admins can still bypass in emergencies)

## Quick Setup for Larger Team (6+ developers)

### Strict Protection

- ✅ Require a pull request before merging (2 approvals required)
  - ✅ Dismiss stale approvals when new commits are pushed
  - ✅ Require review from Code Owners
  - ✅ Require approval of the most recent push
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date
  - Add all status checks
- ✅ Require conversation resolution before merging
- ✅ Require signed commits
- ✅ Require linear history
- ✅ Lock branch
- ✅ Do not allow bypassing the above settings

## Verifying Protection Rules

After setting up:

1. Try to push directly to `main`:

   ```bash
   git checkout main
   echo "test" >> README.md
   git commit -am "test: direct push"
   git push origin main
   ```

   **Expected result:** Push should be rejected ✅

2. Create a PR and try to merge without approvals/checks:
   - Should be blocked until requirements are met ✅

## Troubleshooting

### Status checks not appearing

**Solution:**

1. Create a test branch and PR
2. Wait for CI workflow to run
3. Go back to branch protection settings
4. The status checks should now appear in the dropdown
5. Select them and save

### Can't merge even after approval

**Possible causes:**

- CI checks haven't passed
- Branch is not up to date with `main`
- Conversations not resolved
- Commits not signed (if required)

**Solution:** Check the PR page for specific blockers.

### Need to bypass protection in emergency

If you're an admin and need to bypass:

1. Temporarily disable "Do not allow bypassing"
2. Make necessary changes
3. Re-enable the setting
4. Document why bypass was needed

Alternatively, if "Do not allow bypassing" is not checked, admins can force push with admin permissions.

## Best Practices

1. **Start lenient, get stricter** - Begin with minimal rules and add more as team grows
2. **Document exceptions** - If you bypass protections, document why
3. **Review rules quarterly** - Adjust based on team needs
4. **Communicate changes** - Let team know when rules change
5. **Use CODEOWNERS** - For larger teams, define code ownership

## Additional GitHub Settings

### General Settings to Consider

**Settings → General:**

- ✅ Allow squash merging (recommended for clean history)
- ☐ Allow merge commits (optional, but linear history is cleaner)
- ☐ Allow rebase merging (optional)
- ✅ Automatically delete head branches (clean up after merge)

### Merge Button Settings

Recommended configuration:

- ✅ **Default to squash merging**
- ✅ **Default commit message:** Pull request title and description
- ✅ **Automatically delete head branches after merge**

## Related Documentation

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Development workflow
- [AGENTS.md](../AGENTS.md) - AI agent guidelines
- [GitHub Docs: Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

---

**Setup Date:** <!-- Add date when you configure this -->  
**Last Updated:** <!-- Update when rules change -->  
**Configured By:** <!-- Add your name/team -->
