const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const currentYearElement = document.querySelector("#currentYear");
const lastModifiedElement = document.querySelector("#lastModified");

document.documentElement.classList.add("js");

if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
        const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!isExpanded));
        navigation.classList.toggle("is-open", !isExpanded);
    });
}

if (currentYearElement) {
    currentYearElement.textContent = String(new Date().getFullYear());
}

if (lastModifiedElement) {
    const lastModifiedDate = new Date(document.lastModified);
    lastModifiedElement.textContent = Number.isNaN(lastModifiedDate.getTime())
        lastModifiedDate.toLocaleString();
}
