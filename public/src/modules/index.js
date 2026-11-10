import * as vicPi from "./vic-pi-time-limit.js";
import * as employment from "./employment-routes.js";

export const MODULES = {
  [vicPi.meta.id]: vicPi,
  [employment.meta.id]: employment,
};

// Every citation a result relies on: from the trace and from each route.
export function citesOf(res) {
  const out = [];
  for (const t of res.trace || []) out.push(...(t.cites || []));
  for (const r of res.routes || []) out.push(...(r.cites || []));
  return out;
}
