---
applyTo: "**"
---

# infra-diff agent guide

## General Project Instructions

- i want to always work in small increments.
- i want to always follow CLEAN architecture principles.
- i want to use .gitignore to exclude files and directories that should not be committed to version control.
- i want to remember this repository is a typescript-based custom github action and certain rules need to be adhered to
  that are specific to this context.

## General Code Conventions

- i want to check before running any npm scripts or other node commands, ensure nvm is using the correct node version.
- i want to make sure that all code passes linting and formatting checks before it is committed.
- i want to use npm scripts to make running builds, tests, and other tasks easier.
- i want to avoid code with a high cyclomatic complexity and instead favor the simplest functional approach.
- i want functions and methods to have a single responsibility and do it well.
- i want to avoid having god functions and classes.
- i want to avoid repetitive code and favor reusable functions and simple functional patterns.
- i want to use idiomatic TypeScript features to improve code clarity and maintainability.
- i want to extract functions when there are multiple paths through production code.
- i want to favor immutability and pure functions as much as possible.
- i want to avoid temporal coupling in the code.
- i want to avoid unused imports and variables.
- i want to always run lint and tests after every change.

## Application Dependency Conventions

- i want to always use nvm for managing node versions.
- i want to always use the latest LTS version of node provided by nvm.
- i want to use the nvm cli to check the latest LTS version of node and update the .nvmrc file accordingly.
- i want to always pin dependencies to a specific version in package.json.
- i want to ensure that we do not have any unused dependencies in our project.

## Operational Conventions

- ensure all application logs are structured as JSON objects, except when logging to the console in GitHub Actions.

## Code Security Conventions

- i want you to use npm audit to determine issues with any packages and fix them.
- i want secrets to be stored and referenced as environment variables.

## Testing Conventions

- i want to always follow test driven development.
- i want to always write a failing test first before writing production code.
- i want to ensure only enough production code is written to make the test pass before moving to the next test.
- i want to always use vitest for tests.
- i do not want to run my tests in watch mode locally.