## Tests

All tests will be run with Jest. In addition:

- One assertion per test, _no_ exceptions
- Tests should arrange the test data in `before` blocks
- Tests should have descriptive names: `this is a test name`.
- No mocks - run the tests against the configured firestore db.
- The word "should" will be avoided in test names. A test either passes or fail, it `is`, `is not`, `does`, or `does not`. There is no try.
- Tests will be nested, with the outer `describe` block indicating the main test feature, and the first inner `describe` block being the "happy path" - which is what happens when everything works as expected. The rest of the nested blocks will be devoted to "sad path" tests, with bad data, null values, and any other unexpected settings we can think of.
