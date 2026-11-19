"use strict";

const form = document.querySelector("#inquiry-form");
const result = document.querySelector("#form-result");
const draftLink = document.querySelector("#email-draft");
const subject = "Sunny Mist — Franchise inquiry";
let draft = "";

// Public contact published on sunnydumidi.com; no lead data leaves this page.
const franchiseEmail = "Info@sunnydumidi.com";

form.addEventListener("input", () => { result.hidden = true; });
form.addEventListener("change", () => { result.hidden = true; });
document.querySelectorAll(".venue-choice").forEach((link) => {
  link.addEventListener("click", () => {
    form.elements.venue.value = link.dataset.venue;
    result.hidden = true;
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = new FormData(form);
  draft = [
    "Hello Maison Sunny du Midi,", "",
    "I'd like to explore Sunny Mist franchise opportunities for my location.", "",
    "Name: " + fields.get("name").trim(),
    "Work email: " + fields.get("email").trim(),
    "Company / property: " + fields.get("company").trim(),
    "Venue type: " + fields.get("venue"),
    "City and country: " + fields.get("location").trim(),
    "Locations under consideration: " + (fields.get("locations") || "To be discussed"),
  ].join("\r\n");
  draftLink.href = "mailto:" + franchiseEmail + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(draft);
  result.hidden = false;
  draftLink.focus({ preventScroll: true });
});

document.querySelector("#download-draft").addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob(["To: " + franchiseEmail + "\r\nSubject: " + subject + "\r\n\r\n" + draft], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "sunny-mist-inquiry.txt";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});
