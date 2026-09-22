# Backend and integration test plan

## What this plan covers

The 3059 draft asks for integration testing once the MVP is connected end to end. The current repository is a static browser prototype: `app.js` uses sample proposals and browser local storage. It does not contain a Java service, REST API, or database.

For that reason, no backend test is recorded as passed yet. This document defines the checks to run when the Java backend is connected to the existing UI.

## API contract checks

| ID | API behaviour to test | Test input | Expected result |
| --- | --- | --- | --- |
| B01 | Save organisation context | Objectives, a non-negative budget, and a non-negative staff capacity | `201 Created`; a later read returns the same values. |
| B02 | Reject an incomplete organisation context | Missing objective, negative budget, or negative staff capacity | `400 Bad Request` with the field that needs correction. |
| B03 | Create a standard project proposal | Name, description, expected benefits, cost, staff, timeline, risks, and primary strategic objective | `201 Created`; the response includes an ID and all submitted fields. |
| B04 | Reject an incomplete project proposal | One required field missing, cost below zero, or staff below one | `400 Bad Request`; no proposal is stored. |
| B05 | Save a reviewer evaluation | Five integer ratings from 1 to 5 and a short rationale for each criterion | `200 OK`; a subsequent `GET` returns the same five ratings and rationales. |
| B06 | Reject an invalid evaluation | Four or six ratings, a rating outside 1–5, or an empty rationale | `400 Bad Request`; the previous evaluation remains unchanged. |
| B07 | Return a portfolio overview | Existing proposal data, with optional objective, feasibility, risk, cost, and status filters | `200 OK`; only matching proposals are returned with cost, staff, status, and five separate ratings. |
| B08 | Check a candidate scenario | A set of proposal IDs plus a budget and staff limit | `200 OK`; response contains total cost, total staff, and separate budget/staff flags. It does not generate an overall score or choose a portfolio. |
| B09 | Reject an invalid scenario | Unknown ID, duplicate ID, or invalid limit | `400 Bad Request`; no scenario is saved. |
| B10 | Record a human decision | An existing proposal ID and `Approved`, `Deferred`, or `Rejected` | `200 OK`; decision, date, and reviewer identity are stored. |
| B11 | Reject an invalid decision | Unknown proposal ID or a decision outside the three allowed values | `400 Bad Request`; no status is changed. |
| B12 | Persist data across requests | Save organisation, proposal, evaluation, scenario, and decision; restart the service or create a new client session | All saved records can still be read and keep their relationships. |

## Integration journeys

Run these against a test database or an isolated test profile. Each journey should begin with known test data and leave a readable result for the next step.

| ID | Journey | Expected result |
| --- | --- | --- |
| I01 | Organisation context → proposal submission → reviewer evaluation → project radar data | The five saved ratings are returned to the UI unchanged and the radar chart can use them. |
| I02 | Portfolio overview → filter by objective, feasibility, risk, cost, and status → shortlist two to four proposals | The filtered list is correct and comparison uses the selected proposal IDs only. |
| I03 | Select projects → create Scenario A and Scenario B → calculate totals | Each scenario keeps its own projects and limits; totals equal the sum of the selected proposal data. |
| I04 | Create a scenario above budget or staff capacity | The response flags the relevant constraint and still leaves the final choice to the Portfolio Manager. |
| I05 | Inspect a criterion rationale → record approve, defer, or reject | The rationale remains visible and the decision is stored separately from the five ratings. |
| I06 | Send invalid data from the UI or a direct API client | The backend returns a clear validation error and the UI can show it without losing valid saved data. |

## Test data and requirements traceability

| Requirement from the team draft | Test data needed | Main checks |
| --- | --- | --- |
| Organisation setup | Two objectives, $5M budget, 20 FTE capacity | B01, B02, I01 |
| Standardised proposal | At least six IT proposals with complete fields; one incomplete proposal | B03, B04, I01 |
| Five-criterion evaluation and rationale | A rating and short reason for alignment, value, feasibility, risk manageability, and urgency | B05, B06, I01, I05 |
| Portfolio overview, filters, and shortlist | Proposals across more than one objective, status, cost band, and feasibility/risk level | B07, I02 |
| Radar comparison | Two to four evaluated proposals with visibly different profiles | I01, I02 |
| Candidate scenarios and resource constraints | One feasible mix and one mix over budget or staff capacity | B08, B09, I03, I04 |
| Human approve, defer, or reject | An evaluated proposal and a valid reviewer/manager account | B10, B11, I05 |
| End-to-end MVP | Organisation, proposal, evaluation, comparison, scenario, constraint, and decision records | B12, I01–I06 |

## How to implement the tests later

The Java implementation should keep calculation and validation in the service layer so every client receives the same result. A practical test set is:

- unit tests for proposal validation, five-criterion evaluation validation, scenario totals, and constraint flags;
- controller tests for request/response status codes and validation messages;
- repository tests for saving and retrieving linked organisation, proposal, evaluation, scenario, and decision data; and
- one end-to-end test that calls the API in the order used by I01–I05.

Use a separate test database or in-memory test configuration. The tests must not use the sample data in a production database. When the frontend changes from local storage to the API, repeat I01–I06 in a browser with the Java service running.

## Evidence to retain

For the report, keep the test date, tester, build or commit, input data, expected result, actual result, pass/fail result, and a screenshot only where it helps explain a failure or usability issue. Failed tests should be linked to a fix and re-run after the fix.
