(() => {
  "use strict";

  const form = document.querySelector("#role-select-form");
  const error = document.querySelector("#role-select-error");
  if (!form || !window.PPMAuth) return;

  const existing = window.PPMAuth.demoRole();
  if (existing) {
    const selectedRole = form.querySelector(`[name="role"][value="${CSS.escape(existing)}"]`);
    if (selectedRole) selectedRole.checked = true;
  }

  form.addEventListener("change", () => {
    form.querySelectorAll(".role-option").forEach((option) => {
      option.classList.toggle("is-selected", option.querySelector("input")?.checked === true);
    });
  });
  form.dispatchEvent(new Event("change"));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    error.textContent = "";
    if (!form.reportValidity()) return;

    const role = new FormData(form).get("role");
    try {
      window.PPMAuth.setDemoRole(role);
      window.location.assign(window.PPMAuth.pageURL("workplace.html"));
    } catch (cause) {
      error.textContent = cause instanceof Error ? cause.message : "This role could not be saved in this browser.";
    }
  });
})();
