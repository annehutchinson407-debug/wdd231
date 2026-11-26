document.querySelector("#currentYear").textContent = new Date().getFullYear();
document.querySelector("#lastModified").textContent = document.lastModified;

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

document.querySelector("#timestamp").value = new Date().toISOString();

document.querySelectorAll("[data-dialog]").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const dialog = document.querySelector(`#${link.dataset.dialog}`);
        if (dialog) {
            dialog.showModal();
        }
    });
});

document.querySelectorAll(".dialog-close").forEach((button) => {
    button.addEventListener("click", () => {
        button.closest("dialog").close();
    });
});