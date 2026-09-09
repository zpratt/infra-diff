---
applyTo: "**"
---

# infra-diff agent guide

infra-diff is a TypeScript-based custom GitHub Action, so several conventions below exist only because of that
context and would not apply to an ordinary Node package.

`CLAUDE.md` at the repository root is the canonical statement of these conventions and carries the architecture
map and the command reference. This file restates them for Copilot, which does not load `CLAUDE.md`. When you
change a shared rule in one file, change it in the other, otherwise the two harnesses give conflicting direction
on the same code.

## General Project Instructions

- Work in small increments, so each change can be validated on its own before the next one builds on it.
- Follow CLEAN architecture: source-code dependencies point inward, from adapters toward use cases and entities.
- Keep build output, dependencies, and local tooling state out of version control by adding them to `.gitignore`.

## General Code Conventions

- Confirm nvm is on the version in `.nvmrc` before running any npm script, because CI installs that version and a
  mismatch produces failures CI does not reproduce.
- Run lint and the test suite after every change, and before committing, so a break is attributed to the change
  that caused it rather than discovered later in CI.
- Drive builds, tests, and validation through npm scripts rather than raw commands, so the same invocation works
  locally and in CI.
- Favor the simplest functional approach and keep cyclomatic complexity low. Extract a function when production
  code grows multiple paths, so each path can be named and tested.
- Give each function and method a single responsibility. Do not let a function or class accumulate unrelated work,
  because a god object has no seam a test can use.
- Replace repeated code with a reusable function rather than copying it, so a fix lands in one place.
- Favor immutability and pure functions, which removes the temporal coupling that makes call order load-bearing.
- Use idiomatic TypeScript features where they make intent clearer.
- Remove unused imports and variables; `biome check` reports them.

## Application Dependency Conventions

- Manage Node versions with nvm, and track the latest LTS release: check the current LTS with the nvm CLI and
  update `.nvmrc` when it moves.
- The runtime in `action.yml` (`runs.using`) is chosen from the runtimes GitHub Actions supports and is separate
  from `.nvmrc`. Change it only against GitHub's supported list, not to match the local toolchain.
- Pin dependencies in `package.json` to an exact version, so a transitive release cannot change what CI builds.
- Remove dependencies nothing imports, because an unused package is attack surface and audit noise for no benefit.

## Operational Conventions

- This action logs through `@actions/core` (`info`, `warning`, `error`, `debug`), which produces the annotations
  and log grouping the Actions UI renders. Do not write to `console` directly, since that loses both.
- Where a component ever logs somewhere other than the Actions console, structure those logs as JSON objects so
  they are machine-parseable. No such component exists today.

## Code Security Conventions

- Run `npm audit` after changing dependencies and fix what it reports, so a known vulnerability is caught as it
  enters the tree.
- Reference secrets as environment variables. Do not commit a secret or read one from a file in the
  repository, because git history keeps a committed secret reachable after the file is deleted.

## Testing Conventions

- Follow test-driven development: write a failing test, confirm it fails for the reason you expect, then write
  just enough production code to pass it. A test that has never failed does not demonstrate that it can.
- Use vitest. Do not add jest, because the two runners define overlapping globals and a project carrying both
  gets nondeterministic resolution.
- Do not run tests in watch mode locally; watch mode never terminates and will hang an automated run.
- Cover unhappy paths and evil paths alongside happy ones. The error paths are where an action fails a user, and
  they are the paths nobody exercises by hand.
- Test domain entities through the use cases that consume them rather than directly, so the assertions describe
  behavior a caller depends on.
