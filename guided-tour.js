(() => {
  "use strict";

  const layer = document.querySelector("#tour-layer");
  const $ = (selector) => document.querySelector(selector);
  let stepIndex = 0;
  let activeTarget = null;
  let resizeHandler = null;
  let steps = [];
  let renderVersion = 0;

  const signInStep = {
    title: "Sign in and choose your role",
    description: "Start here: sign in or create an account, then choose Project Proposer, Reviewer, or Portfolio Manager. The workplace navigation will show the screens for that role. If you are already signed in, check your role from the profile menu.",
    view: null,
    target: ".workplace-topbar .auth-slot"
  };
  const demoRoleStep = {
    title: "Explore your selected role",
    description: "You are viewing sample projects without signing in. Your selected role controls the screens in the left menu. You can inspect the examples and switch roles from this menu to explore the rest of the workflow; changes to project records cannot be saved in the demo.",
    view: null,
    target: ".workplace-topbar .auth-slot"
  };
  const navigationStep = {
    title: "Your role-specific workplace",
    description: "The left menu shows only the activities for your selected role, with numbering that restarts at 01 for that role.",
    view: null,
    target: ".workspace-nav"
  };
  const roleSteps = {
    "Project Proposer": [
      { title: "Enter a project proposal", description: "Add the project owner, objective, benefits, estimated cost, staff, timeline, and risks. A submitted proposal waits for reviewer assessment.", demoDescription: "Explore the information a proposer supplies: owner, objective, benefits, estimated cost, staff, timeline, and risks. In the demo, these fields show the proposal structure; submitting a project requires an account.", view: "proposer", target: "#proposal-form" }
    ],
    Reviewer: [
      { title: "Evaluate a proposal", description: "Reviewers record five separate 1–5 ratings and a short rationale for each one. The evidence is recorded without calculating a single total score.", demoDescription: "Inspect sample evaluations to see five separate 1–5 ratings and the rationale behind each one. The demo lets you read the examples; it does not save new ratings or comments.", view: "reviewer", target: "#review-queue" }
    ],
    "Portfolio Manager": [
      { title: "Set the investment context · 01", description: "Set the planning cycle, strategic objectives, budget, and available capacity used for portfolio checks.", demoDescription: "See the sample planning cycle, strategic objectives, budget, and available capacity. These values provide the context for the portfolio's constraint checks and cannot be changed in the demo.", view: "organisation", target: "#organisation-form" },
      { title: "Review the project overview · 02", description: "Search and filter evaluated proposals. Select an individual project to inspect its ratings and reviewer rationale.", view: "manager", target: ".portfolio-layout" },
      { title: "View one project’s radar profile · 03", description: "A single evaluated proposal is enough to show its five-criterion radar profile. This does not create a total score or recommendation.", view: "comparison", target: "#comparison-workspace", prepare: () => prepareSelection(1) },
      { title: "Compare project profiles · 03", description: "Select two to four evaluated proposals to see their criterion profiles overlaid and compare the recorded ratings side by side.", view: "comparison", target: "#comparison-workspace", prepare: () => prepareSelection(2) },
      { title: "Retain projects for consideration · 04", description: "Add suitable projects to the formal Shortlist after reviewing their evidence. Shortlisting is not a final decision.", demoDescription: "View the sample shortlist to see how projects are retained for further consideration. A shortlist is not a final decision; changes to it require an account.", view: "shortlist", target: "#shortlist-workspace" },
      { title: "Build a candidate portfolio · 05", description: "Choose shortlisted projects for a scenario. The workspace totals cost and staff requirements and flags limits that are exceeded.", demoDescription: "Inspect the sample candidate portfolio and its total cost and staff requirements. The workspace flags limits that are exceeded; saving your own scenario requires an account.", view: "scenarios", target: "#scenario-workspace" },
      { title: "Review portfolio constraints · 06", description: "Inspect the selected scenario’s project mix, budget, staff capacity, and objective coverage before proceeding.", view: "reports", target: "#report-workspace" },
      { title: "Record the human decision · 07", description: "After reviewing evidence and constraints, record the decision and its rationale. The system does not decide automatically.", demoDescription: "See where a manager records the final decision and its rationale after reviewing evidence and constraints. The system does not decide automatically, and demo decisions cannot be saved.", view: "decisions", target: "#decision-workspace" }
    ]
  };
  const screenGuideFrames = {
    "Project Proposer": [
      { src: "public/live-demo/proposer-form.webp", alt: "Project Proposal form in the PPM workplace", title: "Enter a project proposal", description: "Add the project description, expected benefits, objective, cost, staff, timeline, and key risks so a reviewer has evidence to assess." }
    ],
    Reviewer: [
      { src: "public/live-demo/reviewer-queue.webp", alt: "Reviewer queue showing projects awaiting evaluation and recorded evaluations", title: "Check the review queue", description: "The queue shows which proposals are not reviewed yet and which already have an evaluation." },
      { src: "public/live-demo/reviewer-evaluation.webp", alt: "Reviewer evaluation form with five criterion ratings and rationale fields", title: "Rate each criterion with a reason", description: "Review each criterion separately and write a short evidence-based rationale. PPM does not turn the ratings into one automatic score." }
    ],
    "Portfolio Manager": [
      { src: "public/live-demo/pm-context.webp", alt: "Investment Context screen with planning cycle, objectives, budget, and staff capacity", title: "Set the investment context", description: "Set the objectives and available budget and capacity before considering project combinations." },
      { src: "public/live-demo/pm-overview.webp", alt: "Project Overview showing proposals, criterion ratings, filters, and evaluation readiness", title: "Review the project overview", description: "Search and filter proposals, check the five ratings and status, then open a project to inspect its supporting evidence." },
      { src: "public/live-demo/pm-radar.webp", alt: "One evaluated project's five-criterion radar profile", title: "Inspect a single-project profile", description: "A single evaluated project is enough to display its five-criterion radar profile; it is not an overall score." },
      { src: "public/live-demo/pm-compare.webp", alt: "Two evaluated projects shown together in a comparison view", title: "Compare project profiles", description: "Overlay selected projects to discuss their differences. The chart supports review and does not pick a winner." }
    ]
  };

  function selectedRole() {
    return window.PPMAuth?.demoRole?.() || $(".workspace-nav")?.dataset.activeRole || "";
  }

  function showScreenSequence(index = 0) {
    if (!layer) return;
    const frames = screenGuideFrames[selectedRole()] || [];
    if (!frames.length) return;
    const current = Math.max(0, Math.min(index, frames.length - 1));
    const frame = frames[current];
    layer.innerHTML = `<div class="tour-sequence-backdrop"><section class="tour-screen-guide" role="dialog" aria-modal="true" aria-labelledby="tour-sequence-title" tabindex="-1"><header><div class="tour-screen-guide-header-copy"><p class="section-kicker">Live demo · Screen guide</p><small>Static screen views · no video download or automatic playback</small></div><button class="tour-sequence-close" type="button" data-sequence-close aria-label="Return to live demo" title="Return to live demo">×</button></header><figure class="tour-screen-frame"><div class="tour-screen-image-wrap"><img src="${frame.src}" alt="${frame.alt}" fetchpriority="high" decoding="async" /></div><figcaption class="tour-screen-caption"><p class="tour-progress">${String(current + 1).padStart(2, "0")} / ${String(frames.length).padStart(2, "0")} · ${selectedRole()}</p><h2 id="tour-sequence-title">${frame.title}</h2><p>${frame.description}</p></figcaption></figure><footer><button type="button" data-sequence-back ${current === 0 ? "disabled" : ""}>Previous</button><span class="tour-sequence-position" aria-live="polite">Screen ${current + 1} of ${frames.length}</span><button type="button" data-sequence-next>${current === frames.length - 1 ? "Return to live demo" : "Next screen"}</button></footer></section></div>`;
    const dialog = layer.querySelector(".tour-screen-guide");
    layer.querySelector("[data-sequence-close]").addEventListener("click", () => showStep());
    layer.querySelector("[data-sequence-back]").addEventListener("click", () => showScreenSequence(current - 1));
    layer.querySelector("[data-sequence-next]").addEventListener("click", () => current === frames.length - 1 ? showStep() : showScreenSequence(current + 1));
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { event.preventDefault(); showStep(); }
      if (event.key === "ArrowLeft" && current > 0) showScreenSequence(current - 1);
      if (event.key === "ArrowRight" && current < frames.length - 1) showScreenSequence(current + 1);
    });
    dialog.focus();
  }
  function prepareSelection(count) {
    document.querySelector('[data-workspace-view-button="manager"]')?.click();
    const checkboxes = Array.from(document.querySelectorAll('[data-comparison-id]:not(:disabled)'));
    if (checkboxes.length < count) return;
    checkboxes.filter((checkbox) => checkbox.checked).forEach((checkbox) => {
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    });
    checkboxes.slice(0, count).forEach((checkbox) => {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  function stepsForCurrentRole() {
    const isDemo = window.PPMGuestDemo === true || window.PPMAuth?.isDemoMode?.() === true;
    const role = (isDemo ? window.PPMAuth?.demoRole?.() : "") || $(".workspace-nav")?.dataset.activeRole || "";
    const roleNavigationDescription = {
      "Project Proposer": "The left menu shows 01 Project Proposal. Other roles’ screens are hidden.",
      Reviewer: "The left menu shows 01 Project Evaluation. Other roles’ screens are hidden.",
      "Portfolio Manager": "The left menu shows the manager workflow: 01 Investment Context, 02 Project Overview, 03 Comparison, 04 Shortlist, 05 Build Candidate Portfolio, 06 Portfolio Review, and 07 Decisions."
    }[role] || navigationStep.description;
    const selectedSteps = (roleSteps[role] || []).map((step) => ({
      ...step,
      description: isDemo && step.demoDescription ? step.demoDescription : step.description
    }));
    return [isDemo ? demoRoleStep : signInStep, { ...navigationStep, description: roleNavigationDescription }, ...selectedSteps];
  }

  function removeFocus() {
    activeTarget?.classList.remove("tour-focus");
    activeTarget = null;
  }

  function shade(top, left, width, height) {
    const element = document.createElement("div");
    element.className = "tour-shade";
    Object.assign(element.style, { top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px` });
    layer.append(element);
  }

  function placeStep() {
    if (!layer || layer.hidden) return;
    const step = steps[stepIndex];
    if (!step) return;
    const target = $(step.target);
    if (!target || target.closest("[hidden]")) {
      stepIndex += 1;
      showStep();
      return;
    }
    removeFocus();
    target.scrollIntoView({ behavior: "instant", block: "center", inline: "nearest" });
    const version = renderVersion;
    requestAnimationFrame(() => {
      if (layer.hidden || version !== renderVersion) return;
      activeTarget = target;
      target.classList.add("tour-focus");
      const bounds = target.getBoundingClientRect();
      const gap = 9;
      const left = Math.max(8, bounds.left - gap);
      const top = Math.max(8, bounds.top - gap);
      const right = Math.min(innerWidth - 8, bounds.right + gap);
      const bottom = Math.min(innerHeight - 8, bounds.bottom + gap);
      layer.querySelectorAll(".tour-shade, .tour-focus-ring").forEach((item) => item.remove());
      shade(0, 0, innerWidth, top);
      shade(bottom, 0, innerWidth, innerHeight - bottom);
      shade(top, 0, left, bottom - top);
      shade(top, right, innerWidth - right, bottom - top);
      const ring = document.createElement("div");
      ring.className = "tour-focus-ring";
      Object.assign(ring.style, { top: `${top}px`, left: `${left}px`, width: `${right - left}px`, height: `${bottom - top}px` });
      layer.append(ring);
      const popover = layer.querySelector(".tour-popover");
      if (!popover) return;
      const popoverHeight = popover.offsetHeight;
      let popoverTop = bottom + 16;
      if (popoverTop + popoverHeight > innerHeight - 12) popoverTop = Math.max(12, top - popoverHeight - 16);
      const popoverLeft = Math.min(Math.max(12, bounds.left), innerWidth - Math.min(390, innerWidth - 30) - 12);
      popover.style.top = `${popoverTop}px`;
      popover.style.left = `${popoverLeft}px`;
    });
  }

  function showStep(direction = 1) {
    if (!layer) return;
    removeFocus();
    let step;
    while (stepIndex >= 0 && stepIndex < steps.length) {
      step = steps[stepIndex];
      const viewButton = step.view ? document.querySelector(`[data-workspace-view-button="${step.view}"]`) : null;
      if (step.view && (!viewButton || viewButton.closest("[hidden]") || viewButton.disabled)) {
        stepIndex += direction;
        continue;
      }
      step.prepare?.();
      viewButton?.click();
      const target = $(step.target);
      if (target && !target.closest("[hidden]")) break;
      stepIndex += direction;
    }
    if (stepIndex < 0 || stepIndex >= steps.length) { finish(true); return; }
    renderVersion += 1;
    layer.hidden = false;
    const hasScreenGuide = stepIndex === 0 && (screenGuideFrames[selectedRole()] || []).length > 0;
    layer.innerHTML = `<div class="tour-popover" role="dialog" aria-modal="true" aria-labelledby="tour-title"><p class="tour-progress">Live demo · ${String(stepIndex + 1).padStart(2, "0")} / ${steps.length}</p><h2 id="tour-title">${step.title}</h2><p>${step.description}</p>${hasScreenGuide ? `<button class="tour-screen-guide-link" type="button" data-tour-screen-guide>View screen-by-screen guide</button>` : ""}<footer><button class="tour-skip" type="button" data-tour-skip>Skip</button><div><button type="button" data-tour-back ${stepIndex === 0 ? "disabled" : ""}>Back</button><button type="button" data-tour-next>${stepIndex === steps.length - 1 ? "Finish" : "Next"}</button></div></footer></div>`;
    layer.querySelector("[data-tour-screen-guide]")?.addEventListener("click", () => showScreenSequence());
    layer.querySelector("[data-tour-next]").addEventListener("click", () => {
      if (stepIndex === steps.length - 1) { finish(true, true); return; }
      stepIndex += 1;
      showStep();
    });
    layer.querySelector("[data-tour-back]").addEventListener("click", () => { if (stepIndex > 0) { stepIndex -= 1; showStep(-1); } });
    layer.querySelector("[data-tour-skip]").addEventListener("click", () => finish());
    const version = renderVersion;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (version === renderVersion) placeStep();
    }));
  }

  function finish(returnToDefault = false, completed = false) {
    if (!layer) return;
    renderVersion += 1;
    removeFocus();
    layer.hidden = true;
    layer.replaceChildren();
    if (resizeHandler) window.removeEventListener("resize", resizeHandler);
    resizeHandler = null;
    if (returnToDefault) window.PPMWorkspace?.returnToDefault();
    if (completed) window.dispatchEvent(new CustomEvent("ppm:tour-finished", { detail: { role: $(".workspace-nav")?.dataset.activeRole || "" } }));
  }

  function start() {
    if (!layer) return;
    stepIndex = 0;
    steps = stepsForCurrentRole();
    if (resizeHandler) window.removeEventListener("resize", resizeHandler);
    resizeHandler = () => placeStep();
    window.addEventListener("resize", resizeHandler);
    showStep();
  }

  function init() {
    document.querySelectorAll("[data-start-live-demo]").forEach((button) => button.addEventListener("click", start));
  }

  window.PPMTour = { init, start };
})();
