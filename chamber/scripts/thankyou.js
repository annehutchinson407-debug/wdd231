document.querySelector("#currentYear").textContent = new Date().getFullYear();
document.querySelector("#lastModified").textContent = document.lastModified;

const fonts = document.querySelector("#google-fonts");

if (fonts) {
    const enableFonts = () => {
        fonts.media = "all";
    };

    fonts.addEventListener("load", enableFonts, { once: true });
    if (fonts.sheet) {
        enableFonts();
    }
}

const params = new URLSearchParams(window.location.search);
const first = params.get("firstName");
const last = params.get("lastName");
const email = params.get("email");
const phone = params.get("phone");
const business = params.get("organization");
const time = params.get("timestamp");
const status = document.querySelector("#submission-status");
const summary = document.querySelector("#submission-summary");
const ready = first && first.trim() && last && last.trim()
    && email && email.trim() && phone && phone.trim()
    && business && business.trim() && time && time.trim();

if (ready) {
    document.querySelector("#submitted-first-name").textContent = first;
    document.querySelector("#submitted-last-name").textContent = last;
    document.querySelector("#submitted-email").textContent = email;
    document.querySelector("#submitted-phone").textContent = phone;
    document.querySelector("#submitted-organization").textContent = business;
    document.querySelector("#submitted-timestamp").textContent = time;
    status.textContent = "Thanks for applying! Here is the information you sent.";
    summary.hidden = false;
} else {
    status.textContent = "Please fill out the join form first.";
}
