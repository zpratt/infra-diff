## Phase 1 Features (MVP)

- Show a preview of changes to infrastructure based on binary plan files from terraform/terragrunt/opentofu.
- The end-user should not have to install any dependencies; the action should run in a self-contained manner.
- Support for reading plan files in both JSON and binary formats.
- If the binary plan file is provided, the action should convert it to JSON using the appropriate CLI tool.
  - For terraform: `terraform show -json <plan-file>`
- User-friendly interface for reviewing proposed changes.
- Detailed logging and error handling for troubleshooting.
- Colored diff output for easy identification of changes.
- Collapsible sections in the diff for better readability.

## Implementation Plan

This plan is designed for incremental validation, where each iteration produces a working, testable artifact.

### Iteration 1: Project Setup & Basic File Reading ✅
**Goal**: Establish project foundation and validate ability to read plan files

**Tasks**:
- ✅ Initialize TypeScript project with GitHub Actions toolkit dependencies (`@actions/core`, `@actions/github`)
- ✅ Set up Vitest as testing framework with proper configuration
- ✅ Configure Biome for linting and formatting (no ESLint/Prettier)
- ✅ Set up `@vercel/ncc` for compiling TypeScript to single distributable file
- ✅ Install `@github/local-action` as dev dependency for local testing
- ✅ Create basic action.yml with minimal inputs (plan-file-path with type validation)
- ✅ Follow CLEAN architecture: create domain entities and use case interfaces
- ✅ Implement file reader use case (domain layer) with interface contract
- ✅ Implement filesystem adapter (infrastructure layer) using Node.js fs
- ✅ Add input validation for file existence and permissions using `@actions/core`
- ✅ Create GitHub Actions workflow for CI with actionlint and yamllint validation
- ✅ Ensure the GitHub Actions workflow runs all tests, lints code, and ensures the project is buildable using `@vercel/ncc`
- ✅ Create a workflow for validating pull requests
- ✅ Pin all third-party actions to specific SHAs

**TDD Approach**: ✅
1. ✅ Write failing test for file reading use case
2. ✅ Implement minimum code to make test pass
3. ✅ Write failing test for input validation
4. ✅ Implement validation logic
5. ✅ Run full test suite after each change

**E2E Test**: ✅
- ✅ Script: `npm run test:e2e:file-reading`
- ✅ Uses Vitest to test sample plan files (JSON and binary) from fixtures directory
- ✅ Validates file content is retrieved successfully
- ✅ Uses Chance.js for generating random test file paths where appropriate

**Validation**: ✅
- ✅ Action can be invoked locally using `@github/local-action`
- ✅ Action successfully reads a test JSON plan file and logs its size
- ✅ `npx biome check` passes with no errors
- ✅ `npm test` passes all unit and e2e tests
- ✅ CI workflow runs successfully with all validation checks

---

### Iteration 2: JSON Plan Parsing & Basic Output ⚠️
**Goal**: Parse JSON plan files and display basic information

**Tasks**:
- ✅ Define domain entities for Terraform plan structure (Plan, ResourceChange, etc.)
- ✅ Create parser interface in domain layer
- ✅ Implement JSON plan parser use case following CLEAN architecture
- ❌ Create text formatter interface and implementation
- ❌ Use `@actions/core.summary` to output results as action step summary
- ⚠️ Add error handling for malformed JSON with descriptive error messages (partial - throws on JSON.parse but lacks descriptive messages)

**TDD Approach**: ⚠️
1. ✅ Write failing test for parsing valid JSON plan
2. ✅ Implement parser to make test pass
3. ✅ Write failing test for malformed JSON handling
4. ⚠️ Implement error handling (partial)
5. ❌ Write failing test for text formatting
6. ❌ Implement formatter
7. ✅ Run `npm test` after each change

**E2E Test**: ❌
- ❌ Script: `npm run test:e2e:json-parsing` (not found in package.json)
- ❌ Uses Vitest with fixtures for various scenarios (additions, deletions, updates, no changes)
- ❌ Validates correct parsing and change detection
- ❌ Tests error handling with malformed JSON fixtures
- ❌ Uses Chance.js for generating random test data where values don't matter

**Validation**: ❌
- ❌ Action outputs a text summary of changes for a sample JSON plan
- ❌ Summary includes count of resources being added/changed/deleted
- ❌ Can be verified in GitHub Actions workflow summary using `@github/local-action`
- ✅ `npx biome check` passes
- ✅ All tests pass with `npm test`

---

### Iteration 3: Binary Plan Conversion ❌
**Goal**: Support binary plan files by converting to JSON

**Tasks**:
- ❌ Create file format detector interface (domain layer)
- ❌ Implement file format detection (check for JSON vs binary)
- ❌ Create CLI executor interface for running external commands
- ❌ Implement Terraform CLI adapter (infrastructure layer) using `@actions/exec`
- ❌ Add version verification for Terraform CLI
- ❌ Execute `terraform show -json` for binary files through use case
- ❌ Handle CLI execution errors with descriptive messages
- ❌ Add error handling for missing Terraform installation

**TDD Approach**: ❌
1. ❌ Write failing test for file format detection (JSON)
2. ❌ Implement JSON detection
3. ❌ Write failing test for binary detection
4. ❌ Implement binary detection
5. ❌ Write failing test for Terraform CLI execution
6. ❌ Implement CLI adapter (may use msw for mocking if testing HTTP calls)
7. ❌ Write failing test for missing CLI error
8. ❌ Implement error handling
9. ❌ Run `npm test` after each change

**E2E Test**: ❌
- ❌ Script: `npm run test:e2e:binary-conversion`
- ❌ Uses Vitest with binary plan fixtures from Terraform 1.x
- ❌ Validates successful conversion to JSON
- ❌ Tests error handling when Terraform is unavailable (no mocking of @actions/exec)
- ❌ Uses Chance.js for generating random CLI parameters where appropriate

**Validation**: ❌
- ❌ Action can process both JSON and binary plan files
- ❌ Binary files are automatically converted to JSON
- ❌ Clear, actionable error messages when Terraform CLI is not found
- ❌ Test with `@github/local-action` using both file formats
- ✅ `npx biome check` passes
- ✅ All tests pass with `npm test`

---

### Iteration 4: Colored Diff Output ❌
**Goal**: Enhance readability with colored, formatted output

**Tasks**:
- ❌ Create color formatter interface (domain layer)
- ❌ Implement ANSI color formatter adapter for terminal output
- ❌ Implement GitHub-flavored markdown formatter with diff syntax
- ❌ Differentiate additions (green/+), deletions (red/-), changes (yellow/~)
- ❌ Format resource attributes with proper indentation
- ❌ Use `@actions/core.summary` for markdown output

**TDD Approach**: ❌
1. ❌ Write failing test for ANSI color formatting (additions)
2. ❌ Implement green color for additions
3. ❌ Write failing test for deletions
4. ❌ Implement red color for deletions
5. ❌ Write failing test for changes
6. ❌ Implement yellow color for changes
7. ❌ Write failing test for markdown formatter
8. ❌ Implement markdown formatter
9. ❌ Run `npm test` after each change

**E2E Test**: ❌
- ❌ Script: `npm run test:e2e:colored-output`
- ❌ Uses Vitest with fixtures containing all change types
- ❌ Validates ANSI codes and markdown formatting
- ❌ Verifies expected output format (behavior-focused, not implementation)
- ❌ Uses Chance.js for generating random resource names where appropriate

**Validation**: ❌
- ❌ Action outputs colored diff in GitHub Actions logs
- ❌ Markdown summary shows properly formatted changes
- ❌ Colors are appropriate and consistent
- ❌ Test with `@github/local-action` and verify output visually
- ✅ `npx biome check` passes
- ✅ All tests pass with `npm test`

---

### Iteration 5: Collapsible Sections & Advanced Formatting ❌
**Goal**: Improve UX with collapsible sections for large diffs

**Tasks**:
- ❌ Create grouping strategy interface (domain layer)
- ❌ Implement resource grouping by type use case
- ❌ Implement HTML formatter adapter with `<details>` tags for GitHub markdown
- ❌ Add expand/collapse controls for individual resources
- ❌ Include metadata (resource count, provider info)
- ❌ Use `@actions/core.summary` for rendering HTML

**TDD Approach**: ❌
1. ❌ Write failing test for grouping resources by type
2. ❌ Implement grouping logic
3. ❌ Write failing test for HTML `<details>` tag generation
4. ❌ Implement details tag formatter
5. ❌ Write failing test for metadata inclusion
6. ❌ Implement metadata extraction
7. ❌ Write failing test for default collapsed state
8. ❌ Implement state management
9. ❌ Run `npm test` after each change

**E2E Test**: ❌
- ❌ Script: `npm run test:e2e:collapsible-sections`
- ❌ Uses Vitest with large plan file fixtures (50+ resource changes)
- ❌ Validates HTML structure and markdown rendering (behavior-focused)
- ❌ Tests default expanded/collapsed states
- ❌ Uses Chance.js for generating random resource data

**Validation**: ❌
- ❌ Large diffs are organized into collapsible sections
- ❌ Each resource type has its own section
- ❌ Summary remains readable regardless of change count
- ❌ Test with `@github/local-action` using large fixture files
- ✅ `npx biome check` passes
- ✅ All tests pass with `npm test`

---

### Iteration 6: Enhanced Error Handling & Logging ❌
**Goal**: Provide detailed diagnostics for troubleshooting

**Tasks**:
- ❌ Create logger interface (domain layer)
- ❌ Implement logger adapter using `@actions/core` (info, warning, error, debug)
- ❌ Add debug mode input to action.yml with boolean type validation
- ❌ Create error handler with actionable error messages
- ❌ Implement version detector for Terraform/OpenTofu/Terragrunt
- ❌ Log tool versions and environment details at startup
- ❌ Use `@actions/core.setFailed()` for error reporting

**TDD Approach**: ❌
1. ❌ Write failing test for logging at different levels
2. ❌ Implement logger adapter
3. ❌ Write failing test for debug mode toggling
4. ❌ Implement debug mode handling
5. ❌ Write failing test for version detection
6. ❌ Implement version detector
7. ❌ Write failing test for error message formatting
8. ❌ Implement error formatter with actionable suggestions
9. ❌ Run `npm test` after each change

**E2E Test**: ❌
- ❌ Script: `npm run test:e2e:error-handling`
- ❌ Uses Vitest for testing error scenarios (missing files, invalid JSON, CLI failures)
- ❌ Validates error messages and exit codes (behavior-focused)
- ❌ Tests debug logging output
- ❌ Uses Chance.js for generating random error scenarios

**Validation**: ❌
- ❌ Action fails gracefully with clear, actionable error messages
- ❌ Debug mode provides detailed execution logs
- ❌ Users can troubleshoot issues without reading source code
- ❌ Test with `@github/local-action` in both normal and debug modes
- ✅ `npx biome check` passes
- ✅ All tests pass with `npm test`

---

### Iteration 7: Full Integration & Documentation ❌
**Goal**: Complete end-to-end workflow and user documentation

**Tasks**:
- ❌ Build distributable with `@vercel/ncc` and commit to dist/
- ❌ Create comprehensive README with usage examples
- ❌ Add sample workflows for common scenarios (Terraform, OpenTofu, Terragrunt)
- ❌ Document all action inputs and outputs from action.yml
- ❌ Create troubleshooting guide with common error scenarios
- ❌ Ensure all third-party actions in examples are pinned to SHAs
- ❌ Add contributing guide with TDD workflow

**TDD Approach**: ❌
1. ❌ Write failing integration test for complete workflow
2. ❌ Ensure all components work together
3. ❌ Write test for each documented example
4. ❌ Verify examples work as documented
5. ❌ Run `npm test` to ensure full test suite passes

**E2E Test**: ❌
- ❌ Script: `npm run test:e2e:integration`
- ❌ Uses Vitest to run full workflow simulating real GitHub Action environment
- ❌ Tests all input combinations and edge cases
- ❌ Validates complete user journey from plan file input to formatted output
- ❌ Uses Chance.js for comprehensive test data generation

**Validation**: ❌
- ❌ Action works in actual GitHub repository
- ❌ Documentation is clear and complete
- ❌ All examples run successfully with `@github/local-action`
- ❌ dist/ folder contains compiled output from `@vercel/ncc`
- ✅ `npx biome check` passes
- ✅ All tests pass with `npm test`
- ✅ CI workflow passes all checks (tests, actionlint, yamllint)

---

### GitHub Actions Workflow Integration

Each iteration should have a corresponding GitHub Actions workflow that:
1. Runs unit tests using Vitest
2. Executes iteration-specific E2E tests
3. Validates code quality with Biome
4. Validates workflows with actionlint
5. Validates YAML files with yamllint
6. Tests the action itself using `actions/checkout` and local action path
7. Validates on multiple OS (ubuntu-latest, macos-latest, windows-latest)
8. All third-party actions MUST be pinned to commit SHAs

**Example workflow structure**:
```yaml
name: E2E Tests - Iteration X

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
      - uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8 # v4.0.2
        with:
          node-version-file: '.nvmrc'
      - run: npm ci
      - run: npx biome check
      - uses: rhysd/action-setup-actionlint@62d8b260e92e94b68654a811b6f7ad29fd6ad53c # v1.4.0
      - run: actionlint
      - uses: actionshub/yamllint@00e5f84e38b14b2f38c7fcb5abc3b4c4e14ba22a # v1.1.0

  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
      - uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8 # v4.0.2
        with:
          node-version-file: '.nvmrc'
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e:file-reading

  validate-action:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
      - uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8 # v4.0.2
        with:
          node-version-file: '.nvmrc'
      - run: npm ci
      - run: npm run build
      - uses: ./  # Test the action itself
        with:
          plan-file-path: ./fixtures/sample-plan.json
```

### NPM Scripts Structure

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "npm run test:e2e:file-reading && npm run test:e2e:json-parsing && npm run test:e2e:binary-conversion && npm run test:e2e:colored-output && npm run test:e2e:collapsible-sections && npm run test:e2e:error-handling && npm run test:e2e:integration",
    "test:e2e:file-reading": "vitest run e2e/file-reading.test.ts",
    "test:e2e:json-parsing": "vitest run e2e/json-parsing.test.ts",
    "test:e2e:binary-conversion": "vitest run e2e/binary-conversion.test.ts",
    "test:e2e:colored-output": "vitest run e2e/colored-output.test.ts",
    "test:e2e:collapsible-sections": "vitest run e2e/collapsible-sections.test.ts",
    "test:e2e:error-handling": "vitest run e2e/error-handling.test.ts",
    "test:e2e:integration": "vitest run e2e/integration.test.ts",
    "build": "ncc build src/index.ts -o dist",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write ."
  }
}
```

### Key Principles Applied

1. **CLEAN Architecture**: Each iteration emphasizes separation between domain (use cases, entities, interfaces) and infrastructure (adapters, frameworks)
2. **TDD Workflow**: All iterations include explicit TDD steps - write failing test, make it pass, run full suite
3. **Vitest + Biome**: Uses project-standard tools (no Jest, ESLint, or Prettier)
4. **GitHub Actions Toolkit**: Leverages `@actions/core`, `@actions/github`, `@actions/exec`
5. **Local Testing**: Uses `@github/local-action` for validating action behavior locally
6. **Chance.js**: Generates random test data when values don't matter
7. **MSW**: Used for mocking HTTP requests (not for mocking @actions packages directly)
8. **Workflow Validation**: All workflows validated with actionlint and yamllint
9. **Pinned Actions**: All third-party actions in examples use commit SHAs
10. **Behavior-Focused Tests**: Tests validate expected behavior, not implementation details
