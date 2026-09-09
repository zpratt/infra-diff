# infra-diff agent guide

## Project Overview

infra-diff is a TypeScript-based GitHub Action that previews the infrastructure changes a terraform/terragrunt/opentofu plan will make. It reads a plan file, parses it, and renders a reviewable diff.

This file is the canonical convention guide. `.github/copilot-instructions.md` and `.github/instructions/` restate the same conventions for GitHub Copilot, which does not load this file. When you change a shared rule here, change it there too, otherwise the two harnesses drift apart and give conflicting direction on the same code.

The feature roadmap lives in [`features/phase-1.md`](./features/phase-1.md) and the user-facing docs in [`docs/usage.md`](./docs/usage.md). Read those rather than restating them here.

## Repository Structure

The layout follows CLEAN architecture, so the dependency direction is the part worth stating:

- `src/domain/entities` — plan data structures (`Plan`, `PlanFile`). These import nothing outside the domain.
- `src/domain/usecases` — application logic plus the interfaces it depends on (`IFileReader`, `IPlanParser`, `IInputValidator`).
- `src/infrastructure/adapters` — implementations bound to Node.js and `@actions/*`, which depend inward on the domain interfaces.
- `src/index.ts` — the action entry point, and the only place adapters are wired into use cases.
- `e2e/` holds end-to-end tests, `fixtures/` holds sample plan files, `features/` holds the phased feature plan.

Domain code shall not import from `src/infrastructure` or from `@actions/*`, so a use case stays testable without a GitHub Actions runtime.

## Common Commands

Select the project's Node.js version with `nvm use` before running any of these, because the version in `.nvmrc` is the one CI installs and a different local version will produce failures CI does not reproduce.

- `npm test` — runs the full unit and e2e suite with vitest.
- `npm run lint` — runs `biome check .`, covering both lint rules and formatting.
- `npm run lint:fix` — applies the safe fixes `biome check` reports.
- `npm run format` — rewrites files with `biome format --write .`. Plain `npx biome format` only reports; it will not change a file without `--write`.
- `npm run lint:workflows` — validates the workflows in `.github/workflows/` with `actionlint`.
- `npm run lint:yaml` — validates YAML files with `yamllint`.

`actionlint` and `yamllint` are not npm packages and `npm ci` does not install them, so those two scripts fail until you install the tools yourself. CI reaches the same checks by other means: it downloads the `actionlint` binary and runs the `actionshub/yamllint` action.
- `npm run build` — compiles to `dist/` with `@vercel/ncc`.
- `npm install` — installs and updates dependencies. Use it rather than editing `package.json` by hand, so `package-lock.json` stays in sync.

When adding a dependency, look up its most recent stable version and record that version explicitly, and run `npm audit` afterwards so a known vulnerability is caught at the point it enters the tree rather than at release.

## Architecture

- Keep the CLEAN layering described above, following the [dependency rule](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html): source-code dependencies point inward only.
- Give each module a single responsibility, and define the contract between two modules as an interface, so an adapter can be swapped or doubled without touching the use case.
- Build the action on the [Actions Toolkit](https://github.com/actions/toolkit) packages. Read inputs through `core.getInput`, report failure through `core.setFailed`, and reach GitHub's API through `@actions/github` rather than a hand-rolled HTTP client.
- Declare every action input and output in `action.yml`. An action input supports `description`, `required`, `default`, and `deprecationMessage` only. It has no `type` key — that belongs to `workflow_call` and `workflow_dispatch` inputs — and `actionlint` fails the build on one, so validate inputs in code through `IInputValidator` rather than expecting GitHub to do it.

## Engineering Practices

### Test-driven development

- Write a failing test first, confirm that it fails for the reason you expect, then write just enough production code to pass it. A test that has never failed does not demonstrate that it can.
- Run the full suite after every change to test or production code, so a regression is attributed to the change that caused it.
- If a test fails, diagnose the cause before touching it. Do not edit a test to make it pass, because that converts a caught defect into a silent one.

### What to test

- Cover every new feature and bug fix, and every branch through production code, with assertions that state the intended behavior rather than restating the implementation.
- Test unhappy and evil paths alongside happy ones. The error paths are where an action fails a user, and they are the paths nobody exercises by hand.
- Structure each test as arrange-act-assert, and keep conditional logic out of tests, because a branch in a test means one of the two paths is not being exercised.
- Keep tests deterministic and independent of external state, so a failure means a defect rather than an environment.

### Test tooling

- Use `vitest`. Do not add `jest`: the two runners define overlapping globals and a project carrying both gets nondeterministic resolution.
- Use `chance` to generate input whose specific value does not matter, so a test does not silently depend on one hard-coded string.
- Avoid mocking third-party libraries. Prefer a test double behind one of the domain interfaces, since that is the seam the architecture already provides.
- When the action starts making HTTP requests, mock them with `msw` at the network boundary rather than stubbing the HTTP client, so the test still exercises the client's own behavior. `msw` is not yet a dependency; install it with the rest of that change.
- Use `@github/local-action` to run the action end to end locally, which is the only way to see `core.getInput` and the step summary behave as they do on a runner.

### Validation and CI

- Every check CI runs should be runnable locally by the same npm script, so a contributor can reproduce a CI failure without pushing. The workflow and YAML linters are the outstanding gap, as noted above.
- Pin every third-party action in a workflow to a commit SHA, because a tag can be moved to point at different code. Keep those pins current.
- Validate workflows with [`rhysd/actionlint`](https://github.com/rhysd/actionlint) and YAML with [`actionshub/yamllint`](https://github.com/actionshub/yamllint).
- `dependabot` keeps dependencies current; its configuration is in `.github/dependabot.yml`.

### Code style

- Use `biome` for formatting and linting. Do not add ESLint or Prettier, because a second formatter will fight biome over the same files.
- Name variables, functions, and modules for what they do, and keep each function focused on one task.
