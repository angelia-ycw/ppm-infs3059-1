(() => {
  if (!location.search.includes("mvpTest")) return;
  const checklist = document.querySelector("#test-checklist");
  if (!checklist || document.querySelector("#validation-support")) return;
  const key = "ppm-test-notes";
  const section = document.createElement("section");
  section.id = "validation-support";
  section.innerHTML = `<p class="section-kicker">Second test round</p><h4>Leave a quick test note.</h4><p>After using the flow above, save a short anonymous note if anything was unclear. It stays in this browser tab only.</p><form><label>Result <select><option>Worked as expected</option><option>Was unclear</option><option>Did not work</option></select></label><label>Short note <textarea required maxlength="420" placeholder="What happened or was confusing?"></textarea></label><button class="solid-button">Save test note</button></form><p role="status"></p>`;
  checklist.after(section);
  const form = section.querySelector("form");
  const status = section.querySelector("[role=status]");
  form.onsubmit = (event) => {
    event.preventDefault();
    const note = form.querySelector("textarea").value.trim();
    if (!note) return;
    const notes = JSON.parse(sessionStorage.getItem(key) || "[]");
    notes.unshift([form.querySelector("select").value, note]);
    sessionStorage.setItem(key, JSON.stringify(notes.slice(0, 8)));
    form.reset();
    status.textContent = "Test note saved in this tab.";
  };
})();
