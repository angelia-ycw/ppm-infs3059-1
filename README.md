# PPM — Project Portfolio Management

INFS3059 prototype for a focused IT project portfolio review process.

## Open it

- Live site: https://kjshoom.github.io/ppm-infs3059/
- Source: https://github.com/kjshoom/ppm-infs3059

Open `index.html`, or run `python3 -m http.server 4173` and visit `http://127.0.0.1:4173/`.

## What the prototype does

1. **Organisation** sets strategic objectives, budget, and available staff.
2. **Proposer** enters a standard IT project proposal: description, benefits, cost, staff, timeline, and risks.
3. **Reviewer** records five separate 1–5 ratings and a reason for each one.
4. **Portfolio manager** filters, compares two to four projects, checks a Scenario A or B against budget and staff, then records a human decision.

Objectives entered in Organisation setup are available in the proposal form. Data is saved only in the current browser with local storage.

The role tabs demonstrate the workflow; they are not login or permission controls. The prototype does not create an overall score, automatic ranking, recommended portfolio, or automatic final decision.

## Testing

- `docs/mvp-test-record.md` — browser functional checks and the Task 5 re-test record.
- `docs/backend-and-integration-test-plan.md` — future API and end-to-end checks if a Java backend is added. The current site is static and has no backend or database.

## Main files

- `index.html` — page structure and role views
- `app/globals.css` — responsive visual design and motion
- `app.js` — sample data, forms, review flow, comparison, scenarios, and local storage
- `docs/process-flow.md` — review process
- `docs/requirements-traceability.md` — draft requirements mapped to the MVP
