document.documentElement.classList.add("js");

document.querySelector("#currentYear").textContent = new Date().getFullYear();
document.querySelector("#lastModified").textContent = document.lastModified;

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");

menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", !isExpanded);
    navigation.classList.toggle("is-open", !isExpanded);
});