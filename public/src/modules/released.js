// The modules shown on the public site. A module is released only when every
// rule it relies on has been verified against the authorised text.
import * as vicPi from "./vic-pi-time-limit.js";

export const RELEASED = {
  [vicPi.meta.id]: vicPi,
};

// Shown on the site as "coming soon"; not loaded.
export const COMING_SOON = [
  { title: "Problems at work: which route?", note: "Coming soon" },
];
