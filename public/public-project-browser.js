(() => {
  const sourceUrl = "https://data.gov.au/data/dataset/major-digital-projects-report-2026";
  const endpoint = "https://data.gov.au/data/api/3/action/datastore_search?resource_id=e33c772c-e59f-43a0-a014-01d066d65e42&limit=200";
  const storageKey = "ppm-custom-proposals";
  if (document.querySelector("#reference-import")) return;
  const form = document.querySelector("#proposal-form");
  if (!form) return;

  const style = document.createElement("style");
  style.textContent = ".live-reference-import{margin-top:1.5rem;border-top:1px solid var(--line,#d9d9d1);padding-top:1.5rem}.live-reference-intro h4{margin:.25rem 0;font-size:clamp(1.25rem,2vw,1.8rem);letter-spacing:-.04em}.live-reference-intro>p:last-child{max-width:42rem;color:var(--muted,#5c5c56)}.live-reference-toolbar{display:grid;grid-template-columns:minmax(0,1fr) 12rem;gap:.8rem;margin-top:1.15rem}.live-reference-toolbar label{display:grid;gap:.4rem;font-size:.76rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase}.live-reference-toolbar input,.live-reference-toolbar select{width:100%;box-sizing:border-box;border:1px solid var(--line,#c8c8c1);background:#fff;color:#111;padding:.78rem .85rem;font:inherit;text-transform:none;letter-spacing:0}.live-reference-search{position:relative}.live-reference-picker{position:absolute;z-index:20;top:calc(100% + .35rem);left:0;right:0;max-height:22rem;overflow:auto;border:1px solid #151515;background:#fff;box-shadow:0 16px 36px rgba(0,0,0,.12)}.live-reference-picker p{margin:0;padding:.75rem .85rem;color:#61615b;font-size:.85rem}.live-reference-picker button{display:grid;width:100%;gap:.16rem;border:0;border-top:1px solid #ecece7;background:#fff;padding:.72rem .85rem;text-align:left;cursor:pointer}.live-reference-picker button:hover{background:#f4ff4b}.live-reference-picker strong{font-size:.92rem}.live-reference-picker span{color:#64645d;font-size:.78rem;font-weight:500;letter-spacing:0;text-transform:none}.live-reference-meta{margin:.8rem 0;color:var(--muted,#5c5c56);font-size:.88rem}.live-reference-preview{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1.25rem;border:1px solid #171717;background:#f7f7f2;padding:1rem}.live-reference-preview h5{margin:.2rem 0 .45rem;font-size:1.08rem}.live-reference-preview p{margin:.2rem 0;color:#55554f;line-height:1.45}.live-reference-preview dl{display:grid;grid-template-columns:repeat(3,minmax(7rem,1fr));gap:.7rem;margin:0}.live-reference-preview dt{color:#66665e;font-size:.72rem;text-transform:uppercase}.live-reference-preview dd{margin:.2rem 0 0;font-weight:700}.live-reference-preview button{align-self:end;white-space:nowrap}.live-reference-source{display:inline-block;margin-top:.8rem;color:#222;font-size:.83rem}@media (max-width:700px){.live-reference-toolbar{grid-template-columns:1fr}.live-reference-preview{grid-template-columns:1fr}.live-reference-preview dl{grid-template-columns:1fr 1fr}.live-reference-preview button{justify-self:start}}";
  document.head.append(style);

  const section = document.createElement("section");
  section.className = "live-reference-import";
  section.innerHTML = '<div class="live-reference-intro"><p class="section-kicker">Public project catalogue</p><h4>Browse real Australian digital projects.</h4><p>Pick a public project as a starting point. Your team still records the PPM review details.</p></div><div class="live-reference-toolbar"><label class="live-reference-search">Search public projects<input type="search" autocomplete="off" placeholder="Click to browse all projects" aria-expanded="false" /><div class="live-reference-picker" hidden></div></label><label>Source status<select class="live-reference-status"><option value="all">All statuses</option></select></label></div><p class="live-reference-meta">Loading the public catalogue…</p><article class="live-reference-preview" hidden></article><a class="live-reference-source" href="' + sourceUrl + '" target="_blank" rel="noreferrer">Australian Government Major Digital Projects Report 2026 ↗</a>';
  form.insertAdjacentElement("afterend", section);

  const input = section.querySelector("input"), picker = section.querySelector(".live-reference-picker"), statusSelect = section.querySelector("select"), meta = section.querySelector(".live-reference-meta"), preview = section.querySelector(".live-reference-preview");
  let records = [], selected = null;
  const esc = (value) => String(value ?? "").replace(/[&<>'\"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"})[c]);
  const title = (r) => r["Project name"] || "Untitled project";
  const agency = (r) => r.Agency || "Australian Government";
  const status = (r) => r["Delivery status"] || "Not reported";
  const budget = (r) => Number(r["Digital budget (millions)"] || r["Total budget (millions)"] || 0);
  const money = (n) => n > 0 ? '$' + n.toLocaleString("en-AU", {maximumFractionDigits:1}) + 'm' : "Not reported";
  const matches = () => { const q = input.value.trim().toLowerCase(), s = statusSelect.value; return records.filter((r) => (!q || (title(r)+" "+agency(r)+" "+(r.Portfolio||"")+" "+(r["Project description"]||"")).toLowerCase().includes(q)) && (s === "all" || status(r) === s)); };

  function showPicker() {
    const found = matches();
    input.setAttribute("aria-expanded", "true"); picker.hidden = false;
    picker.innerHTML = found.length ? '<p>' + (found.length === records.length ? records.length + ' projects' : found.length + ' matching projects') + '</p>' + found.map((r) => '<button type="button" data-record="' + r._id + '"><strong>' + esc(title(r)) + '</strong><span>' + esc(agency(r)) + ' · ' + esc(status(r)) + '</span></button>').join("") : "<p>No matching projects.</p>";
    picker.querySelectorAll("[data-record]").forEach((button) => button.addEventListener("click", () => { selected = records.find((r) => String(r._id) === button.dataset.record) || null; input.value = selected ? title(selected) : ""; picker.hidden = true; input.setAttribute("aria-expanded", "false"); showPreview(); }));
  }

  function showPreview() {
    if (!selected) { preview.hidden = true; return; }
    const dates = [selected["Project start date"], selected["Project end date"]].filter(Boolean).join(" – ") || "Dates not reported";
    preview.hidden = false;
    preview.innerHTML = '<div><p class="section-kicker">' + esc(agency(selected)) + '</p><h5>' + esc(title(selected)) + '</h5><p>' + esc(selected["Project description"] || "No description reported.") + '</p></div><dl><div><dt>Digital budget</dt><dd>' + money(budget(selected)) + '</dd></div><div><dt>Dates</dt><dd>' + esc(dates) + '</dd></div><div><dt>Source confidence</dt><dd>' + esc(selected["DCA 2026"] || "Not reported") + '</dd></div></dl><button type="button" class="outline-button">Add to this browser</button>';
    preview.querySelector("button").addEventListener("click", () => {
      const id = 'public-reference-' + selected._id, saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (!saved.some((p) => p.id === id)) { const m = budget(selected); saved.unshift({id, title:title(selected), owner:agency(selected), category:"Public ICT reference", objective:"Improve Customer Experience", duration:[selected["Project start date"],selected["Project end date"]].filter(Boolean).join(" – ") || "Not reported", cost:m > 0 ? Math.round(m * 1000000) : 0, staff:0, status:"Submitted", summary:selected["Project description"] || "Public project reference.", benefits:"Define the expected benefits for this organisation before review.", risks:"Source confidence: " + (selected["DCA 2026"] || "not reported") + ". Add project-specific risks before review.", scores:{}, rationales:{}, missing:["Staff requirement","Project-specific risks","Expected benefits for this organisation"], isCustom:true}); localStorage.setItem(storageKey, JSON.stringify(saved)); }
      location.hash = "workspace"; location.reload();
    });
  }

  const callback = 'ppmCatalogue' + Date.now(), script = document.createElement("script");
  input.disabled = true; statusSelect.disabled = true;
  input.addEventListener("focus", showPicker); input.addEventListener("input", showPicker); statusSelect.addEventListener("change", showPicker);
  document.addEventListener("click", (event) => { if (!section.contains(event.target)) { picker.hidden = true; input.setAttribute("aria-expanded", "false"); } });
  window[callback] = (payload) => { delete window[callback]; script.remove(); records = (payload?.result?.records || []).filter((r) => title(r)); records.sort((a,b) => title(a).localeCompare(title(b))); const statuses = [...new Set(records.map(status))].sort(); statusSelect.innerHTML = '<option value="all">All statuses</option>' + statuses.map((s) => '<option value="' + esc(s) + '">' + esc(s) + '</option>').join(""); meta.textContent = records.length + ' official project records available.'; input.disabled = false; statusSelect.disabled = false; };
  script.onerror = () => { delete window[callback]; script.remove(); meta.textContent = "The public catalogue could not be loaded right now. Please try again later."; };
  script.src = endpoint + '&callback=' + callback; document.head.append(script);
})();
