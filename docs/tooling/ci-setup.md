# CI/CD Setup - GitHub Actions Pipeline

## Overview

The AI Marketing Agency dashboard uses **GitHub Actions** for continuous integration. The pipeline runs on every push and pull request to `main` and `feature/*` branches.

> **Note:** This is a basic CI pipeline (P0). Future improvements include deployment automation and multi-environment support (see ADR-005).

---

## Workflow File

Location: `.github/workflows/ci.yml`

---

## Pipeline Stages

### 1. Lint (`npm run lint`)

- Runs ESLint on the codebase
- Ensures code style consistency
- Fails pipeline on lint errors

### 2. Test (`npm test`)

- Runs Jest test suite
- Uses `--passWithNoTests` flag (allows empty test suite initially)
- Future: Add more integration and unit tests

### 3. Build (`npm run build`)

- Builds the frontend with Vite
- Verifies production bundle compiles successfully
- Output: `dist/` directory

---

## Trigger Conditions

The pipeline triggers on:

- Push to `main` branch
- Push to `feature/*` branches
- Pull requests targeting `main`

**Example:**
```bash
# This will trigger CI
git push origin feature/production-readiness

# This will also trigger CI
git push origin main
```

---

## Configuration

### Node.js Version

- **Node.js 18** is used in CI (matches Docker container)
- Configured in `.github/workflows/ci.yml`:
  ```yaml
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '18'
      cache: 'npm'
  ```

### Environment Variables

No sensitive environment variables are needed for CI (lint + test + build only).

For tests that require API keys:
- Use GitHub Secrets for sensitive data
- Mock external services in test environment

---

## Reading Pipeline Results

### GitHub UI

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select the workflow run
4. View logs for each step (lint, test, build)

### Status Badge

Add to your `README.md`:

```markdown
![CI](https://github.com/<user>/<repo>/actions/workflows/ci.yml/badge.svg)
```

---

## Common Issues

### Lint Failures

```bash
# Run lint locally to fix before pushing
npm run lint
```

Common fixes:
- Missing semicolons (if configured)
- Unused variables
- ESLint rule violations

### Test Failures

```bash
# Run tests locally
npm test

# Run specific test file
npx jest __tests__/auth.test.js
```

Common issues:
- Missing test dependencies (jest, supertest)
- Environment variables not mocked
- Async test timeouts

### Build Failures

```bash
# Run build locally
npm run build
```

Common issues:
- Syntax errors in React components
- Missing dependencies
- Vite configuration errors

---

## Skipping CI (Not Recommended)

To skip CI for a commit (use sparingly):

```bash
git commit -m "WIP: work in progress [skip ci]"
```

Or:

```bash
git commit -m "WIP: work in progress [ci skip]"
```

> **⚠️ Warning:** Skipping CI can lead to broken code on `main`. Only use for documentation-only changes.

---

## Local Pre-commit Hook (Recommended)

Set up a pre-commit hook to catch errors before pushing:

```bash
# Create .git/hooks/pre-commit
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
npm run lint
npm test
npm run build
EOF

chmod +x .git/hooks/pre-commit
```

Now, every commit will run the CI checks locally first.

---

## Future Improvements (Post-P0)

### Deployment Automation

- Add deployment stage to CI pipeline
- Deploy to production on merge to `main`
- Use SSH or cloud provider actions (AWS, GCP, Azure)

### Multi-Environment

- `staging` environment for testing
- `production` environment for live
- Environment-specific secrets and configs

### Code Coverage

- Add Jest coverage reporting
- Fail pipeline if coverage drops below threshold
- Upload coverage to Codecov or similar

### Security Scanning

- Add `npm audit` for dependency vulnerabilities
- Add Docker image scanning (Trivy, Snyk)
- Add SAST scanning (GitHub CodeQL)

### Performance Testing

- Add Lighthouse CI for frontend performance
- Add load testing for API endpoints
- Bundle size monitoring

---

## Files Created

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | GitHub Actions pipeline (lint + test + build) |
| `package.json` | Updated with `test` script |

---

## Related ADR

- [ADR-005: CI/CD Pipeline](../../governance/adr/26-05-04_cicd-pipeline.md)
