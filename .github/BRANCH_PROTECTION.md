# Branch Protection Configuration

This document describes the branch protection rules for the `main` branch.

## Required Status Checks

The following CI checks must pass before merging:

- **Lint** - ESLint must pass with no errors
- **TypeScript Check** - TypeScript compilation must succeed with no errors
- **Build** - Production build must succeed and stay under 512KB
- **Playwright Tests** - All E2E tests must pass

## Setup Instructions

To enable branch protection rules, run the following command or configure via
GitHub UI:

```bash
gh api repos/joshleichtung/minihack-audio-sequencer/branches/main/protection \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -f required_status_checks[strict]=true \
  -f required_status_checks[contexts][]=lint \
  -f required_status_checks[contexts][]=typecheck \
  -f required_status_checks[contexts][]=build \
  -f required_status_checks[contexts][]=test \
  -f enforce_admins=false \
  -f required_pull_request_reviews[dismiss_stale_reviews]=true \
  -f required_pull_request_reviews[require_code_owner_reviews]=false \
  -f required_pull_request_reviews[required_approving_review_count]=0 \
  -f restrictions=null
```

## Manual Configuration via GitHub UI

1. Go to:
   https://github.com/joshleichtung/minihack-audio-sequencer/settings/branches
2. Add rule for `main` branch
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Status checks that are required:
     - `lint`
     - `typecheck`
     - `build`
     - `test`
   - ✅ Do not allow bypassing the above settings (optional)

## Branch Protection Rules

### Required

- All CI checks must pass (lint, typecheck, build, test)
- Branch must be up to date with main before merging

### Optional

- Require pull request reviews
- Dismiss stale pull request approvals when new commits are pushed
- Require review from code owners

## CI Workflow

The CI workflow (`.github/workflows/ci.yml`) runs on:

- Every push to `main`
- Every pull request targeting `main`

### Jobs

1. **Lint** - Runs `npm run lint`
2. **TypeScript Check** - Runs `tsc --noEmit`
3. **Build** - Runs `npm run build` and validates bundle size
4. **Playwright Tests** - Runs E2E tests with Chromium

### Build Size Limit

The build job enforces a maximum bundle size of **512KB** for the `dist`
directory. If the build exceeds this limit, the CI will fail.

## Local Development

Before pushing, ensure all checks pass locally:

```bash
npm run lint        # Must pass with 0 errors
npx tsc --noEmit   # Must pass with 0 errors
npm run build      # Must succeed
npm run test       # All tests must pass
```

## Troubleshooting

### CI fails on lint

Run `npm run lint` locally and fix all errors before pushing.

### CI fails on typecheck

Run `npx tsc --noEmit` locally to see TypeScript errors.

### CI fails on build

Run `npm run build` locally to debug build issues.

### CI fails on tests

Run `npm run test` locally to debug failing tests. Use `npm run test:ui` for
interactive debugging.
