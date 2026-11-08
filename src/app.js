import { MODULES } from "./modules/index.js";
import { todayIso } from "./core/dates.js";
import { buildForm, readAnswers, applyVisibility, renderClient, renderTrace, renderSources } from "./core/render.js";

const $ = (id) => document.getElementById(id);
const TODAY = todayIso();
let current;

function helpFor(m, answers) {
  if (!m.HELP) return [];
  if (Array.isArray(m.HELP)) return m.HELP;
  return [...(m.HELP.all || []), ...(m.HELP[answers.state] || [])];
}

function update() {
  const m = current;
  const answers = { ...m.DEFAULTS, ...readAnswers($("form"), m.QUESTIONS) };
  applyVisibility($("form"), m.QUESTIONS, answers);
  // Answers to hidden questions don't count.
  for (const q of m.QUESTIONS) if (q.showIf && !q.showIf(answers)) answers[q.id] = m.DEFAULTS[q.id];
  const res = m.evaluate(answers, TODAY);
  renderClient($("result"), res, m.clientText(res), helpFor(m, answers));
  renderTrace($("dates"), $("trace"), res, TODAY);
}

function select(id) {
  current = MODULES[id] || Object.values(MODULES)[0];
  document.querySelectorAll("[data-module]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.module === current.meta.id)));
  $("question").textContent = current.meta.question;
  buildForm($("form"), current.QUESTIONS, current.DEFAULTS);
  renderSources($("sources"), current.meta.sources);
  update();
  if (location.hash.slice(1) !== current.meta.id) history.replaceState(null, "", "#" + current.meta.id);
}

const picker = $("picker");
for (const m of Object.values(MODULES)) {
  const b = document.createElement("button");
  b.type = "button";
  b.dataset.module = m.meta.id;
  b.textContent = m.meta.title;
  b.addEventListener("click", () => select(m.meta.id));
  picker.append(b);
}
$("form").addEventListener("input", update);
$("form").addEventListener("change", update);
$("form").addEventListener("submit", (e) => e.preventDefault());
window.addEventListener("hashchange", () => select(location.hash.slice(1)));
select(location.hash.slice(1));
