# Technical Design

## Components and Data

- `src/content/capabilityChecks.ts`: three pilot task definitions.
- `src/domain/capabilityCheck.ts`: result assessment, attempt creation, latest-attempt selection, and due selection.
- `src/components/CapabilityCheckPanel.tsx`: Listen -> Respond -> Check interaction and saved result state.
- `src/components/TodayPage.tsx`: pilot lookup and Mastery continuation gate.
- `src/components/ReviewPage.tsx`: due capability practice.
- `src/components/MePage.tsx`: independent outcomes and latest results.

## Persistence

IndexedDB version 9 adds `capabilityCheckAttempts` with indexes by capability, day, and due date. Attempts are append-only evidence. The latest `createdAt` per capability controls Me and Review.

Each attempt stores the listening result, written text, opened support, self-reported meaning completeness and clarity, the derived result, and the next due timestamp. No audio or personal profile data is stored by this iteration.

## Scheduling

| Result | Next check |
| --- | --- |
| Independent | 7 days |
| With help | 3 days |
| Practice again | 1 day |

Completing a due check creates a new attempt. Because Review selects only the latest attempt, the old due record no longer appears.

## Compatibility

Capability repository methods are optional in `ProgressRepository`. App production enables the feature, while direct component consumers and legacy repositories continue without a new gate. The database migration only creates a store and indexes.
