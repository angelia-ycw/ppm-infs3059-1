(() => {
  "use strict";
  if (window.PPMGuestDemo !== true || window.PPMTestMode === true) return;

  // Visitors can inspect and compare the samples, but cannot change portfolio data.
  const mutationControls = [
    "#workspace form input", "#workspace form textarea", "#workspace form select", "#workspace form button",
    "#review-dialog input", "#review-dialog textarea", "#review-dialog select",
    "#save-note", "#add-evaluation-comment", "#release-review-claim",
    "#add-objective", "#reset-test-data",
    "[data-remove-objective]", "[data-add-formal-shortlist]", "[data-remove-formal-shortlist]",
    "[data-add-to-scenario]", "[data-remove-from-scenario]", "[data-create-scenario]",
    "[data-rename-active-scenario]", "[data-delete-active-scenario]", "[data-save-active-scenario]",
    "[data-delete-proposal]", "[data-ppm-remove-proposal]", "[data-decision]",
    "[data-add-decision-action]", "[data-remove-decision-action]",
    "[data-decision-action]", "[data-decision-action-date]"
  ].join(",");
  const lockControls = () => document.querySelectorAll(mutationControls).forEach((control) => {
    if (!control.disabled) control.disabled = true;
    if (control.title !== "Read-only demo. Sample project data cannot be changed.") {
      control.title = "Read-only demo. Sample project data cannot be changed.";
    }
  });
  document.addEventListener("submit", (event) => {
    if (!event.target.closest("#workspace, #review-dialog")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
  ["click", "change"].forEach((eventName) => document.addEventListener(eventName, (event) => {
    if (!(event.target instanceof Element) || !event.target.closest(mutationControls)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true));
  lockControls();
  const observer = new MutationObserver(lockControls);
  ["#workspace", "#review-dialog"].forEach((selector) => {
    const section = document.querySelector(selector);
    if (section) observer.observe(section, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled"]
    });
  });
})();
