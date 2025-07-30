# Golden Files Test Infrastructure

This directory contains golden files (snapshots) that capture the expected behavior of the editor before the HTML transition. These files serve as a baseline to ensure no regressions occur during the transition.

## Structure

- `dom-snapshots/` - DOM structure snapshots for various editor states
- `event-sequences/` - Recorded event sequences for common operations
- `state-changes/` - Editor state changes for different operations

## Usage

Golden files are automatically generated when running tests with the `--update-golden` flag:

```bash
yarn test:golden --update-golden
```

To run tests against existing golden files:

```bash
yarn test:golden
```

## File Format

Each golden file includes:

- Timestamp of creation
- Browser/environment info
- The actual snapshot data
- Metadata about the test scenario
