# infra-diff agent guide

## Project Overview

infra-diff is a typescript-based github action, which will show a preview of changes that will be made to your infra based on the output of a terraform/terragrunt/opentofu plan.

## Repository Structure

## Common Commands

**note**: Before running any commands, ensure that you have selected the proper Node.js version using `nvm use`. `biome` should be used as much as possible. Run `npx biome check` to check for linting errors, and `npx biome format` to automatically fix formatting issues.

- **run test suite**: `npm test` - Runs the full test suite using vitest.
- **project validation**: `npm run lint` - Runs the linter to check for code quality issues.
- **installing/updating dependencies**: `npm install` - Installs or updates project dependencies. 
  - Always use this command to ensure `package-lock.json` is updated correctly
  - Always use explicit version numbers when adding new dependencies.
  - Always search npm for the most recent stable version of a package.
  - Always use `npm audit` to check for vulnerabilities after installing or updating dependencies.
- **lint GitHub Actions workflows**: `npm run lint:workflows` - Validates all GitHub Actions workflows using `actionlint` from the command line.

## Architecture

- Follow a modular architecture, where each module has a single responsibility.
- Use interfaces to define contracts between different components.
- The software architecture should follow CLEAN architecture principles as defined by Robert C. Martin [here](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html).
- Uses the [Actions Toolkit](https://github.com/actions/toolkit) packages to implement the GitHub Action.
- When interacting with GitHub's API, use the `@actions/github` package.
- All action inputs and outputs should be defined in the `action.yml` file.
- When possible, the input type should be specified in the `action.yml` file to enable automatic validation by GitHub.
- All action inputs will be read using the `@actions/core` package, using `core.getInput`.

## Engineering Practices

- Write unit tests for all new features and bug fixes.
- Always write a failing unit test, ensure it fails, and then write a test with just enough code to make it pass.
- Ensure that test assertions are meaningful and validate the expected behavior.
- Avoid mocking 3rd party libraries unless absolutely necessary.
- Focus on testing behavior rather than implementation details.
- All tests should be deterministic and produce the same result every time they are run.
- Each test should be structured to follow the Arrange-Act-Assert pattern.
- Do not modify tests to make them pass without understanding the root cause of the failure.
- Use Chance.js to generate random data for tests to ensure robustness when the value of the input data is not important.
- Use descriptive names for variables, functions, and modules.
- Keep functions small and focused on a single task.
- After every change to a test or production code, run the full test suite to ensure nothing is broken.
- Whenever testing asynchronous http requests, use `msw` to mock the requests instead of making requests real endpoints or mocking the http client directly.
- The entire project should have a robust validation process that is completely automated using GitHub Actions workflows, but should also be easy to run locally in the same way as the CI pipeline.
- Use `biome` for code formatting and linting to maintain a consistent code style across the project.
- Use `vitest` as the testing framework for unit and integration tests.
- Never use `jest` in this project.
- Use [@github/local-action](https://github.com/github/local-action) for local testing of the infra-diff action
- Ensure all GitHub Actions workflows are validated using `rhysd/actionlint`
- Ensure all YAML files are validated using `actionshub/yamllint`
- Ensure all 3rd party GitHub Actions used in workflows are pinned to a specific version or commit SHA.
- Use `@vercel/ncc` to compile the TypeScript code into a single JavaScript file for distribution.
- Ensure all 3rd party GitHub Actions used in workflows are using the latest version.
- Use `dependabot` to keep dependencies up to date.
