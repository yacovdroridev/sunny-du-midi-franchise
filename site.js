"use strict";

// Add the approved filenames here once the original artwork is available.
const artwork = {
  logo: "",
  hero: "",
  resort: "",
  fitness: "",
  prive: "",
};

document.querySelectorAll("[data-asset]").forEach((image) => {
  const filename = artwork[image.dataset.asset];
  if (filename) {
    image.addEventListener("load", () => { image.hidden = false; }, { once: true });
    image.src = "./assets/" + filename;
  }
});

// Set this to the approved franchise inbox to enable email drafts.
const franchiseEmail = "";
const form = document.querySelector("#inquiry-form");
const status = document.querySelector("#form-status");
const submitButton = form.querySelector("button");
if (franchiseEmail) {
  submitButton.textContent = "Open email draft ↗";
  document.querySelector("#form-note").textContent =
    "Opens your email app with your inquiry. You can review it before sending.";
}

document.querySelectorAll(".venue-choice").forEach((link) => {
  link.addEventListener("click", () => { form.elements.venue.value = link.dataset.venue; });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = new FormData(form);
  const subject = "Sunny Mist franchise inquiry";
  const body = [
    "Hello Sunny du Midi,",
    "",
    "I'd like to discuss Sunny Mist for my venue.",
    "",
    "Name: " + fields.get("name").trim(),
    "Work email: " + fields.get("email").trim(),
    "Company: " + fields.get("company").trim(),
    "Venue type: " + fields.get("venue"),
    "City and country: " + fields.get("location").trim(),
    "Locations under consideration: " + (fields.get("locations") || "To be discussed"),
  ].join("\r\n");

  if (franchiseEmail) {
    window.location.href = "mailto:" + franchiseEmail +
      "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    status.textContent = "Review and send your inquiry from your email app.";
  } else {
    const url = URL.createObjectURL(new Blob([subject + "\r\n\r\n" + body], { type: "text/plain;charset=utf-8" }));
    const download = document.createElement("a");
    download.href = url;
    download.download = "sunny-mist-inquiry.txt";
    download.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = "Your download was requested. No inquiry was sent.";
  }
  status.hidden = false;
});
