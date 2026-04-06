# Release Process

## Overview

Publishing to npm is **fully automated**. A release is triggered by bumping the version in `package.json` and pushing to `master`. The [publish workflow](.github/workflows/publish.yml) runs lint, tests, and build — then publishes to npm only if the version has changed.

## Step-by-step

### 1. Ensure the branch is clean and tests pass

```bash
npm run lint
npm test
npm run test:smoke
```

### 2. Update the changelog and bump the version

This project follows [Conventional Commits](https://conventionalcommits.org). Use `standard-version` to automatically update `CHANGELOG.md` and bump `package.json`:

```bash
# patch release (bug fixes)
npx standard-version --release-as patch

# minor release (new features, backwards-compatible)
npx standard-version --release-as minor

# major release (breaking changes)
npx standard-version --release-as major
```

This will:

- Update `CHANGELOG.md` based on commit messages since the last tag
- Bump the `version` field in `package.json`
- Create a commit and a git tag (e.g. `v3.1.0`)

### 3. Push the commit and tag to master

```bash
git push --follow-tags origin master
```

### 4. CI takes over

The [publish workflow](.github/workflows/publish.yml) runs automatically on every push to `master`:

1. Lint
2. Tests
3. Build (CJS + ESM)
4. Smoke tests
5. Publish to npm (skipped if `version` in `package.json` is unchanged)

You can monitor progress at: https://github.com/PBug90/w3gjs/actions

## Prereleases

Use prereleases to publish early versions to npm for testing before a stable release. The project has used the `0`-indexed prerelease convention (e.g. `v3.0.0-0`, `v3.0.0-1`).

### Start a prerelease

```bash
# first prerelease for an upcoming minor (produces e.g. v3.1.0-0)
npx standard-version --prerelease --release-as minor

# first prerelease for an upcoming major (produces e.g. v4.0.0-0)
npx standard-version --prerelease --release-as major
```

### Iterate on a prerelease

Subsequent calls without `--release-as` will increment the prerelease number:

```bash
# produces v3.1.0-1, v3.1.0-2, etc.
npx standard-version --prerelease
```

### Publish with a dist-tag

By default `JS-DevTools/npm-publish` publishes to the `latest` tag. To avoid prereleases being installed by consumers running `npm install w3gjs`, publish manually with the `next` tag instead:

```bash
npm publish --tag next
```

Then promote to `latest` once stable:

```bash
npm dist-tag add w3gjs@3.1.0 latest
```

### Graduate to a stable release

Once a prerelease is ready, cut the final version:

```bash
npx standard-version --release-as minor
git push --follow-tags origin master
```

This produces the stable tag (e.g. `v3.1.0`) and CI publishes it to the `latest` tag automatically.

## Hotfixes

For urgent fixes, follow the same process with `--release-as patch`. There is no separate release branch — all releases go through `master`.

## Required secrets

| Secret                | Purpose                    |
| --------------------- | -------------------------- |
| `NPM_TOKEN`           | Publish to npm             |
| `QLTY_COVERAGE_TOKEN` | Upload coverage to qlty.sh |
