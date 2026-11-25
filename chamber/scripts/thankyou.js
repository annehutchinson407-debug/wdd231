document.documentElement.classList.add("js");

document.querySelector("#currentYear").textContent = new Date().getFullYear();
document.querySelector("#lastModified").textContent = document.lastModified;

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const googleFontsStylesheet = document.querySelector("#google-fonts");

if (googleFontsStylesheet) {
    const enableGoogleFonts = () => {
        googleFontsStylesheet.media = "all";
    };

    googleFontsStylesheet.addEventListener("load", enableGoogleFonts, { once: true });
    if (googleFontsStylesheet.sheet) {
        enableGoogleFonts();
    }
}

menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", !isExpanded);
    navigation.classList.toggle("is-open", !isExpanded);
});

const submittedValues = new URLSearchParams(window.location.search);
const requiredFields = [
    ["firstName", "submitted-first-name"],
    ["lastName", "submitted-last-name"],
    ["email", "submitted-email"],
    ["phone", "submitted-phone"],
    ["organization", "submitted-organization"],
    ["timestamp", "submitted-timestamp"],
];
const hasAllRequiredValues = requiredFields.every(([name]) => {
    const value = submittedValues.get(name);
    return value !== null && value.trim() !== "";
});
const submissionStatus = document.querySelector("#submission-status");
const submissionSummary = document.querySelector("#submission-summary");

if (hasAllRequiredValues) {
    requiredFields.forEach(([name, elementId]) => {
        document.getElementById(elementId).textContent = submittedValues.get(name);
    });
    submissionStatus.textContent = "Thank you for submitting your membership application. We have received your information.";
    submissionSummary.hidden = false;
} else {
    submissionStatus.textContent = "No complete application was found. Please fill out the membership form to submit your application.";
}
