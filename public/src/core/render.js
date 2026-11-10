// Renders a module's questions, the client's answer, and the lawyer's trace.
// Plain DOM; text is always set with textContent.

import { fmt } from "./dates.js";
import { SOURCES, citeText } from "../law/sources.js";

const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else n.setAttribute(k, v);
  }
  for (const k of kids) if (k != null) n.append(k);
  return n;
};

export function readAnswers(form, questions) {
  const a = {};
  for (const q of questions) {
    if (q.type === "yesno") {
      const c = form.querySelector(`input[name="${q.id}"]:checked`);
      a[q.id] = c ? c.value === "yes" : (q.default ?? false);
    } else if (q.type === "tri") {
      const c = form.querySelector(`input[name="${q.id}"]:checked`);
      a[q.id] = !c || c.value === "unsure" ? null : c.value === "yes";
    } else if (q.type === "number") {
      const v = form.querySelector(`#q-${q.id}`).value;
      a[q.id] = v === "" ? null : Number(v);
    } else {
      const v = form.querySelector(`#q-${q.id}`).value;
      a[q.id] = v === "" ? undefined : v;
    }
  }
  return a;
}

export function buildForm(form, questions, defaults) {
  form.textContent = "";
  for (const q of questions) {
    const wrap = el(q.type === "yesno" || q.type === "tri" ? "fieldset" : "div", { class: "field", "data-q": q.id });
    if (q.type === "yesno" || q.type === "tri") {
      wrap.append(el("legend", { text: q.label }));
      const choices = el("div", { class: "choices" });
      const opts = q.type === "yesno"
        ? [["no", q.no || "No"], ["yes", q.yes || "Yes"]]
        : [["unsure", "Not sure"], ["yes", "Yes"], ["no", "No"]];
      const def = q.type === "yesno" ? ((defaults[q.id] ?? q.default ?? false) ? "yes" : "no") : "unsure";
      for (const [v, label] of opts) {
        const input = el("input", { type: "radio", name: q.id, value: v });
        if (v === def) input.checked = true;
        choices.append(el("label", {}, input, " " + label));
      }
      wrap.append(choices);
    } else {
      wrap.append(el("label", { for: `q-${q.id}`, text: q.label }));
      let input;
      if (q.type === "select") {
        input = el("select", { id: `q-${q.id}` });
        for (const [v, label] of q.options) {
          const o = el("option", { value: v, text: label });
          if (defaults[q.id] === v) o.selected = true;
          input.append(o);
        }
      } else {
        input = el("input", { id: `q-${q.id}`, type: q.type === "number" ? "number" : "date" });
        if (q.type === "number") input.min = "0";
      }
      wrap.append(input);
    }
    if (q.hint) wrap.append(el("span", { class: "hint", text: q.hint }));
    form.append(wrap);
  }
}

export function applyVisibility(form, questions, answers) {
  for (const q of questions) {
    const show = !q.showIf || q.showIf(answers);
    form.querySelector(`[data-q="${q.id}"]`).classList.toggle("hidden", !show);
  }
}

export function renderClient(box, res, text, help) {
  box.className = "result s-" + res.status;
  box.textContent = "";
  box.append(el("h3", { text: text.heading }));
  if (text.body) box.append(el("p", { text: text.body }));
  if (res.routes && res.routes.length) box.append(renderRoutes(res.routes));
  if (text.next) box.append(el("p", { class: "cta", text: text.next }));
  if (help && help.length && res.status !== "error") {
    const ul = el("ul", { class: "help" });
    for (const h of help) ul.append(el("li", {}, el("strong", { text: h.name }), `: ${h.note}`));
    box.append(el("p", { class: "help-label", text: "Free and low-cost help" }), ul);
  }
}

function renderRoutes(routes) {
  const list = el("div", { class: "routes" });
  for (const r of routes) {
    const card = el("div", { class: `route open-${r.open}${r.kind === "help" ? " help-route" : ""}` });
    const badge = r.kind === "help" ? "Free help" : r.open === "yes" ? "May be open" : r.open === "maybe" ? "Depends" : "Probably not open";
    card.append(el("div", { class: "route-head" }, el("strong", { text: r.name }), el("span", { class: "pill", text: badge })));
    card.append(el("div", { class: "route-body", text: r.body }));
    card.append(el("p", { text: r.what }));
    if (r.why) card.append(el("p", { class: "why", text: r.why }));
    const dl = el("dl", { class: "facts" });
    const add = (k, v) => { if (v) dl.append(el("dt", { text: k }), el("dd", { text: v })); };
    add("Time limit", r.deadlineText + (r.extension ? " " + r.extension : ""));
    add("Costs risk", r.costs);
    add("Effect on other routes", r.closes);
    card.append(dl);
    list.append(card);
  }
  return list;
}

export function renderTrace(datesEl, traceEl, res, today) {
  datesEl.textContent = "";
  const rows = [["Status", res.status + (res.handover ? " · hand over" : "")], ["Today", fmt(today)]];
  if (res.discoverable) rows.push(["Discoverable (as answered)", fmt(res.discoverable)]);
  if (res.longstop) rows.push(["Long-stop ends", fmt(res.longstop)]);
  if (res.deadline) rows.push(["Deadline (as answered)", fmt(res.deadline)]);
  if (res.earliestDeadline && res.earliestDeadline !== res.deadline) rows.push(["Earliest plausible deadline", fmt(res.earliestDeadline)]);
  if (res.system) rows.push(["Industrial system", res.system]);
  for (const [k, v] of rows) datesEl.append(el("dt", { text: k }), el("dd", { text: v }));

  traceEl.textContent = "";
  const items = [...res.trace];
  for (const r of res.routes || []) items.push({ rule: r.id, text: `${r.name} (${r.open}): ${r.deadlineText}`, cites: r.cites });
  for (const t of items) {
    const li = el("li");
    li.append(el("span", { text: `${t.rule}: ${t.text}` }));
    const secs = el("span", { class: "sec" });
    (t.cites || []).forEach((c, n) => {
      if (n) secs.append("; ");
      secs.append(el("span", { class: c.check === "verified" ? "cite-ok" : "cite-tbc", text: citeText(c) + (c.check === "verified" ? "" : " (to verify)") }));
    });
    li.append(secs);
    traceEl.append(li);
  }
  if (!items.length) traceEl.append(el("li", { text: res.message || "Waiting for answers." }));
}

export function renderSources(container, keys) {
  container.textContent = "";
  for (const k of keys) {
    const s = SOURCES[k];
    const li = el("li");
    li.append(el("a", { href: s.url, text: s.title }), `, ${s.version}. ${s.licence}`);
    container.append(li);
  }
}
