---
applyTo: "test/**/*.{test,spec}.ts"
---

# Testing Conventions

## Test Data

- when the actual value of inputs are not important, use Chance.js to generate random test data to fuzz inputs
- ensure when test data is generated with Chance.js, it will lead to readable assertion failures
- do not use unnecessarily realistic or complex values for test data (e.g. use simple strings or numbers instead of
  specially crafted Chance.js configuration objects)

## Dependencies

- if any conventions require the addition of new dependencies, ensure they are installed

## Test Design

- whenever possible, avoid mocking 3rd party dependencies.
- ensure tests follow the arrange-act-assert pattern.
- avoid hardcoding fixture values in tests and assertions, so always extract a variable with the value to
  reference.
- use msw to provide test doubles of APIs for testing.
- ensure tests run the same way locally as they would in CI.
- ensure that tests are isolated and do not depend on external state.
- use test doubles for any external dependencies in tests.
- ensure conditional paths in production code are meaningfully asserted to explain their purpose.
- always avoid partial mocks in my tests.
- always use spec-style tests.
- ensure test descriptions to read like user stories and not like implementation details.
- tests should focus on behavior and not implementation details.
- ensure that tests have valuable assertions for each behavior in the module under test.
- ensure assertions explain the intent of the test.
- ensure tests guard against the production code being updated in such a way that the test would pass inappropriately.
