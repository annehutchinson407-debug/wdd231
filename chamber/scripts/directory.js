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

const membersContainer = document.querySelector("#members");
const directoryStatus = document.querySelector("#directory-status");
const gridViewButton = document.querySelector("#grid-view");
const listViewButton = document.querySelector("#list-view");

gridViewButton.addEventListener("click", () => setDirectoryView("grid"));
listViewButton.addEventListener("click", () => setDirectoryView("list"));

function setDirectoryView(view) {
    const isGrid = view === "grid";
    membersContainer.classList.toggle("business-list", !isGrid);
    gridViewButton.setAttribute("aria-pressed", isGrid);
    listViewButton.setAttribute("aria-pressed", !isGrid);
}

function createMemberCard(member) {
    const card = document.createElement("article");
    card.className = "business-card";

    const heading = document.createElement("h2");
    heading.className = "business-card-heading";
    heading.textContent = member.name;

    const tagline = document.createElement("p");
    tagline.className = "business-card-tagline";
    tagline.textContent = member.tagline;

    const details = document.createElement("div");
    details.className = "business-card-details";

    const image = document.createElement("img");
    image.className = "business-card-logo";
    image.src = `images/${member.image}`;
    image.alt = `${member.name} logo`;
    image.width = 160;
    image.height = 160;
    image.loading = "lazy";

    const information = document.createElement("div");
    const address = document.createElement("p");
    address.textContent = member.address;
    const phone = document.createElement("p");
    phone.textContent = member.phone;
    const website = document.createElement("p");
    const websiteLink = document.createElement("a");
    websiteLink.href = member.website;
    websiteLink.textContent = "Visit website";
    websiteLink.target = "_blank";
    websiteLink.rel = "noopener noreferrer";
    website.append(websiteLink);

    const membership = document.createElement("p");
    membership.textContent = `Membership: ${["", "Member", "Silver", "Gold"][member.membership]}`;

    const description = document.createElement("p");
    description.textContent = member.description;
    information.append(address, phone, website, membership, description);
    details.append(image, information);
    card.append(heading, tagline, details);

    return card;
}

async function loadMembers() {
    try {
        const response = await fetch("data/members.json");
        if (!response.ok) {
            throw new Error(`Member directory request failed: ${response.status}`);
        }

        const members = await response.json();
        if (!Array.isArray(members)) {
            throw new Error("Member directory data must be an array.");
        }

        const cards = members.map(createMemberCard);
        membersContainer.replaceChildren(...cards);
        directoryStatus.textContent = `${members.length} chamber members`;
    } catch (error) {
        console.error("Unable to load chamber members.", error);
        directoryStatus.textContent = "Member information could not be loaded. Please try again later.";
    }
}

loadMembers();