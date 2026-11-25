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

document.querySelector("#timestamp").value = new Date().toISOString();

document.querySelectorAll("[data-dialog]").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const dialog = document.getElementById(link.dataset.dialog);
        if (dialog && !dialog.open) {
            dialog.showModal();
        }
    });
});

document.querySelectorAll(".dialog-close").forEach((button) => {
    button.addEventListener("click", () => {
        button.closest("dialog").close();
    });
});