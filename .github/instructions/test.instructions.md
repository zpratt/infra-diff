---
applyTo: "src/**/*.{test,spec}.ts,e2e/**/*.{test,spec}.ts"
---

# Testing Conventions

Tests live beside the code they cover in `src/` and as end-to-end suites in `e2e/`. This file applies to both.

## Test Data

- Where the specific value of an input does not matter, generate it with Chance.js, so a test cannot silently
  come to depend on one hard-coded string.
- Choose generators that fail readably. A random simple string or number names itself in the failure output; a
  specially crafted Chance configuration object does not.
- Do not hardcode a fixture value in both the arrangement and the assertion. Extract it to a variable and
  reference that variable in both, so the two cannot drift apart and the test cannot pass for the wrong reason.

## Dependencies

- Where a convention here requires a package the project does not yet have, install it as part of the same
  change rather than working around its absence.

## Test Design

- Structure every test as arrange-act-assert, so a reader can find the behavior under test without reading the
  whole body.
- Write spec-style tests whose descriptions read as user stories. A description that names an implementation
  detail stops being true the moment the implementation is refactored.
- Assert behavior a caller depends on, not internal structure, and make each assertion state the intent it is
  checking.
- Give every behavior in the module under test at least one assertion of its own, including each conditional
  path in production code, so the assertion explains why that path exists.
- Write assertions that would fail if the production code were changed to do the wrong thing. A test that
  passes against both the correct and the incorrect implementation is not testing anything.

## Test Doubles

- Avoid mocking third-party dependencies. Prefer a hand-written double behind one of the domain interfaces,
  which is the seam the CLEAN architecture already provides.
- Do not use partial mocks. A partially mocked object exercises a mixture of real and fake behavior that no
  production configuration produces.
- Substitute a test double for every external dependency, so a test result depends only on the code under test.
- Provide API test doubles with msw at the network boundary rather than stubbing the HTTP client, so the test
  still exercises the client's own behavior. msw is not yet a dependency; install it with the change that needs
  it.

## Determinism

- Keep tests isolated from external state and from each other, so a failure identifies a defect rather than an
  environment or an ordering.
- Ensure tests run the same way locally as in CI. A test that only passes in one of the two hides a defect in
  the other.
