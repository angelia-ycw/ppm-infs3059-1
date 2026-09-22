# MVP requirements traceability

| Draft requirement | MVP evidence | Storage / status |
| --- | --- | --- |
| Organisation setup | Organisation tab edits the portfolio name, four strategic objectives, budget, and staff capacity. | `ppm-organisation` in local storage. Implemented. |
| Standard project proposal | Proposer tab requires project name, owner, description, primary objective, expected benefits, cost, staff, timeline, and risks. | `ppm-custom-proposals` in local storage. Implemented. |
| Reviewer evaluation | Reviewer tab requires a 1–5 rating and short rationale for strategic alignment, value, feasibility, risk manageability, and urgency. | `ppm-evaluation-{id}` in local storage. Implemented. |
| No single automated score | Cards and radar profiles show the five ratings separately. | Implemented. |
| Portfolio overview and filtering | Portfolio manager can search and filter by objective, feasibility, risk, cost, and status. | Browser state. Implemented. |
| Compare projects | Two to four evaluated projects can be compared in an overlaid radar chart and detail table. | Browser state. Implemented. |
| Candidate scenarios | Scenario A and B save a selected group of evaluated projects and show total cost and staff. | `ppm-scenarios` in local storage. Implemented. |
| Resource constraints | Scenario totals are checked against Organisation budget and staff limits. | Browser calculation. Implemented. |
| Human final decision | Approve, Defer, or Reject is saved separately from the five ratings. | `ppm-decisions` in local storage. Implemented. |
| Role flow | Organisation, Proposer, Reviewer, and Portfolio manager tabs follow the agreed process. | Navigation only; not authentication. Implemented. |
| Task 3 integration test | Organisation → proposal → evaluation → comparison → scenario → decision flow is recorded in the test record. | Developer verification complete. |
| Task 5 re-test | Dense score matrix was replaced by project cards with compact criterion profiles; regression checks are recorded. | Developer re-test complete; participant session still needed. |

## Current limitations

- The data is browser-local, not shared with the team.
- The role tabs are not authentication or permission enforcement.
- There is no Java backend or database in this repository.
- External participant usability testing still needs to be run by the team.
- A final score, automatic ranking, and automatic decision are deliberately outside this MVP.
