"use strict";

const form = document.querySelector("#inquiry-form");
const result = document.querySelector("#form-result");
const draftLink = document.querySelector("#email-draft");
const locale = document.documentElement.lang;
const messages = {
  en: { subject: "Sunny Mist — Franchise inquiry", hello: "Hello Maison Sunny du Midi,", intro: "I'd like to explore Sunny Mist franchise opportunities for my location.", labels: ["Name", "Work email", "Company / property", "Venue type", "City and country", "Locations under consideration"], pending: "To be discussed", required: "Please complete this field.", email: "Please enter a valid email address.", number: "Please enter a whole number from 1 to 9999.", to: "To", subjectLabel: "Subject" },
  fr: { subject: "Sunny Mist — Demande de franchise", hello: "Bonjour Maison Sunny du Midi,", intro: "Je souhaite étudier les possibilités de franchise Sunny Mist pour mon établissement.", labels: ["Nom", "E-mail professionnel", "Entreprise / établissement", "Type de lieu", "Ville et pays", "Nombre de sites envisagés"], pending: "À discuter", required: "Veuillez remplir ce champ.", email: "Veuillez saisir une adresse e-mail valide.", number: "Veuillez saisir un nombre entier de 1 à 9999.", to: "À", subjectLabel: "Objet" },
  ru: { subject: "Sunny Mist — Запрос о франшизе", hello: "Здравствуйте, Maison Sunny du Midi!", intro: "Я хочу рассмотреть возможности франшизы Sunny Mist для моего объекта.", labels: ["Имя", "Рабочая электронная почта", "Компания / объект", "Тип объекта", "Город и страна", "Количество рассматриваемых объектов"], pending: "Для обсуждения", required: "Пожалуйста, заполните это поле.", email: "Введите корректный адрес электронной почты.", number: "Введите целое число от 1 до 9999.", to: "Кому", subjectLabel: "Тема" }
}[locale];
const subject = messages.subject;
// Native validation UI uses the visitor's browser language; localize its text.
function validate(field) {
  field.setCustomValidity("");
  if (field.required && !field.value.trim()) field.setCustomValidity(messages.required);
  else if (field.validity.typeMismatch) field.setCustomValidity(messages.email);
  else if (!field.validity.valid) field.setCustomValidity(messages.number);
}
form.querySelectorAll("input, select").forEach((field) => {
  field.addEventListener("input", () => validate(field));
  field.addEventListener("change", () => validate(field));
  field.addEventListener("invalid", () => validate(field));
});
let draft = "";

// Public contact published on sunnydumidi.com; no lead data leaves this page.
const franchiseEmail = "Info@sunnydumidi.com";

form.addEventListener("input", () => { result.hidden = true; });
form.addEventListener("change", () => { result.hidden = true; });
document.querySelectorAll(".venue-choice").forEach((link) => {
  link.addEventListener("click", () => {
    form.elements.venue.value = link.dataset.venue;
    validate(form.elements.venue);
    result.hidden = true;
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = new FormData(form);
  draft = [
    messages.hello, "", messages.intro, "",
    ...["name", "email", "company", "venue", "location", "locations"].map((key, i) =>
      messages.labels[i] + ": " + (fields.get(key).trim() || messages.pending)),
  ].join("\r\n");
  draftLink.href = "mailto:" + franchiseEmail + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(draft);
  result.hidden = false;
  draftLink.focus({ preventScroll: true });
});

document.querySelector("#download-draft").addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([messages.to + ": " + franchiseEmail + "\r\n" + messages.subjectLabel + ": " + subject + "\r\n\r\n" + draft], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "sunny-mist-inquiry.txt";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});
