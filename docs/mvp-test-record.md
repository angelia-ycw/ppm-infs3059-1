# MVP test record

## Test run — 22 September 2026

| Item | Record |
| --- | --- |
| Tester | Developer verification |
| Build | Local role-flow MVP before GitHub Pages publication |
| Browser | Codex in-app browser, local HTTP server |
| Viewport | 1280 × 720 |

## Task 3: end-to-end integration checks

| ID | Journey | Actual result | Result |
| --- | --- | --- | --- |
| T3-01 | Save organisation setup | Name, four objectives, $5M budget, and 20 FTE saved successfully. | Pass |
| T3-02 | Submit a complete proposal | A proposal with description, benefits, cost, staff, timeline, risks, and objective appeared in the Reviewer queue as Submitted. | Pass |
| T3-03 | Complete a review | Five ratings and five rationales were required; saving changed the proposal to an evaluated profile. | Pass |
| T3-04 | View a project profile | The completed proposal showed a radar chart, five separate ratings, and the selected rationale. | Pass |
| T3-05 | Shortlist and compare | Two evaluated proposals produced a comparison radar chart and a side-by-side criterion table. | Pass |
| T3-06 | Build a scenario | Two selected projects totalled $2.3M and 10 FTE, within the $5M and 20 FTE limits; Scenario A saved successfully. | Pass |
| T3-07 | Record human decision | An Approved decision appeared as a status and remained separate from the five ratings. | Pass |
| T3-08 | Reload browser | The submitted proposal, its evaluation, the recorded decision, and Scenario A remained after reload. | Pass |
| T3-09 | Search and status filtering | Searching `security` returned one matching proposal. Combining it with the Approved status correctly returned no projects; clearing both restored the full list. | Pass |

## Task 5: design re-test

The original portfolio score matrix was difficult to scan because one project was spread across many narrow cells. It was replaced with a project card: project context first, then a compact five-criterion profile. Numeric detail is still available in the project insight and comparison dialog.

| ID | Re-test | Actual result | Result |
| --- | --- | --- | --- |
| T5-01 | Review the revised desktop portfolio layout | Project cards, shortlist controls, status, context, and five compact criterion bars fit alongside the scenario panel at 1280 × 720. | Pass |
| T5-02 | Re-run the comparison and scenario flow after the redesign | Shortlist, comparison radar, Scenario A, resource checks, and human decision all still worked after the card redesign. | Pass |
| T5-03 | Check browser errors | No console errors were recorded during the functional run. | Pass |

## Still to run with the team

This developer check is not a replacement for participant usability testing. In the next team session, ask two or three people who did not make the screen to complete these tasks without help:

1. Submit a new IT proposal using the Proposer tab.
2. Find two projects for a service-reliability comparison.
3. Explain one lower criterion rating using the reviewer rationale.
4. Build a portfolio within a stated budget and staff limit, then record a human decision.

Record where they pause, change the wording or layout if needed, and add the re-test result below.

| Participant session | Date | Main finding | Change made | Re-test result |
| --- | --- | --- | --- | --- |
| Pending team session |  |  |  |  |
