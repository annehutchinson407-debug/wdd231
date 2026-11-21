const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const currentYearElement = document.querySelector("#currentYear");
const lastModifiedElement = document.querySelector("#lastModified");
const weatherStatus = document.querySelector("#weather-status");
const currentTemperature = document.querySelector("#weather-temperature");
const currentDescription = document.querySelector("#weather-description");
const weatherIcon = document.querySelector("#weather-icon");
const forecastList = document.querySelector("#weather-forecast");
const spotlightContainer = document.querySelector("#spotlight-cards");
const spotlightStatus = document.querySelector("#spotlight-status");

const haikuLocation = {
    latitude: 20.921,
    longitude: -156.305
};

document.documentElement.classList.add("js");

if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
        const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
        if (isExpanded) {
            menuToggle.setAttribute("aria-expanded", "false");
        } else {
            menuToggle.setAttribute("aria-expanded", "true");
        }
        navigation.classList.toggle("is-open", !isExpanded);
    });
}

if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
}

if (lastModifiedElement) {
    lastModifiedElement.textContent = document.lastModified;
}

loadWeather();

if (spotlightContainer && spotlightStatus) {
    loadSpotlights();
}

async function loadWeather() {
    weatherStatus.textContent = "Loading weather...";

    const hasKey = window.OPENWEATHERMAP_API_KEY &&
        window.OPENWEATHERMAP_API_KEY.trim() !== "";
    const isLocalPage = location.protocol === "file:" ||
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1";

    if (!hasKey && isLocalPage) {
        try {
            await loadLocalWeatherConfig();
        } catch (error) {
            console.error("Unable to load the local weather config.", error);
        }
    }

    const apiKey = window.OPENWEATHERMAP_API_KEY || "";
    if (!apiKey.trim()) {
        weatherStatus.textContent = "Weather unavailable: OpenWeatherMap API key is not configured.";
        return;
    }

    await apiFetch(apiKey);
}

function loadLocalWeatherConfig() {
    return new Promise(function (resolve, reject) {
        const configScript = document.createElement("script");
        configScript.src = "scripts/weather-config.local.js";
        configScript.addEventListener("load", resolve, { once: true });
        configScript.addEventListener("error", function () {
            reject(new Error("Local weather config file could not be loaded."));
        }, { once: true });
        document.head.appendChild(configScript);
    });
}

async function apiFetch(apiKey) {
    try {
        const parameters = new URLSearchParams({
            lat: haikuLocation.latitude,
            lon: haikuLocation.longitude,
            units: "imperial",
            appid: apiKey
        });
        const currentUrl = "https://api.openweathermap.org/data/2.5/weather?" + parameters;
        const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?" + parameters;
        const results = await Promise.all([
            fetchWeather(currentUrl),
            fetchWeather(forecastUrl)
        ]);
        const current = results[0];
        const forecast = results[1];
        renderCurrentWeather(current);
        renderForecast(forecast, Date.now() / 1000);
        weatherStatus.textContent = "Weather data for Haiku, Hawaii, USA.";
    } catch (error) {
        console.error("Unable to load Haiku weather from OpenWeatherMap.", error);
        weatherStatus.textContent = "Weather unavailable: " + error.message;
    }
}

async function fetchWeather(url) {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
        const detail = data && typeof data.message === "string" ? ": " + data.message : "";
        throw new Error("OpenWeatherMap request failed (" + response.status + ")" + detail);
    }
    return data;
}

function renderCurrentWeather(data) {
    currentTemperature.textContent = Math.round(data.main.temp);
    currentDescription.textContent = data.weather[0].description;
    weatherIcon.src = "https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";
    weatherIcon.alt = data.weather[0].description;
}

function renderForecast(data, currentTimestamp) {
    const todayKey = getHaikuDateKey(currentTimestamp);
    const forecastDays = [];

    for (let i = 0; i < data.list.length; i++) {
        const entry = data.list[i];
        const dateKey = getHaikuDateKey(entry.dt);
        if (dateKey === todayKey) {
            continue;
        }

        let dayIndex = -1;
        for (let j = 0; j < forecastDays.length; j++) {
            if (forecastDays[j].date === dateKey) {
                dayIndex = j;
            }
        }

        if (dayIndex === -1) {
            const day = {
                date: dateKey,
                timestamp: entry.dt,
                high: entry.main.temp_max,
                low: entry.main.temp_min
            };
            forecastDays.push(day);
        } else {
            if (entry.main.temp_max > forecastDays[dayIndex].high) {
                forecastDays[dayIndex].high = entry.main.temp_max;
            }
            if (entry.main.temp_min < forecastDays[dayIndex].low) {
                forecastDays[dayIndex].low = entry.main.temp_min;
            }
        }
    }

    forecastList.innerHTML = "";
    for (let i = 0; i < 3 && i < forecastDays.length; i++) {
        const temperatures = forecastDays[i];
        const item = document.createElement("li");
        const date = document.createElement("strong");
        date.textContent = formatForecastDate(temperatures.timestamp);

        const high = document.createElement("span");
        high.textContent = "High: " + Math.round(temperatures.high) + " °F";

        const low = document.createElement("span");
        low.textContent = "Low: " + Math.round(temperatures.low) + " °F";

        item.appendChild(date);
        item.appendChild(high);
        item.appendChild(low);
        forecastList.appendChild(item);
    }
}

function getHaikuDateKey(timestamp) {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
        timeZone: "Pacific/Honolulu"
    });
}

function formatForecastDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        timeZone: "Pacific/Honolulu"
    });
}

async function loadSpotlights() {
    try {
        const response = await fetch("data/members.json");
        if (!response.ok) {
            throw new Error("Member data request failed: " + response.status);
        }

        const members = await response.json();
        if (!Array.isArray(members)) {
            throw new Error("Member data must be an array.");
        }

        const eligibleMembers = [];
        for (let i = 0; i < members.length; i++) {
            if (members[i].membership === 2 || members[i].membership === 3) {
                eligibleMembers.push(members[i]);
            }
        }

        if (eligibleMembers.length === 0) {
            throw new Error("No silver or gold members are available for spotlights.");
        }

        const spotlightCount = Math.min(Math.floor(Math.random() * 2) + 2, eligibleMembers.length);
        for (let i = 0; i < spotlightCount; i++) {
            const randomIndex = i + Math.floor(Math.random() * (eligibleMembers.length - i));
            const temporaryMember = eligibleMembers[i];
            eligibleMembers[i] = eligibleMembers[randomIndex];
            eligibleMembers[randomIndex] = temporaryMember;
        }
        const selectedMembers = eligibleMembers.slice(0, spotlightCount);

        spotlightContainer.classList.toggle("spotlight-count-3", spotlightCount === 3);
        spotlightContainer.innerHTML = "";
        for (let i = 0; i < selectedMembers.length; i++) {
            const member = selectedMembers[i];
            spotlightContainer.appendChild(createSpotlightCard(member));
        }

        spotlightStatus.textContent = "Showing " + spotlightCount + " silver and gold members.";
    } catch (error) {
        console.error("Could not load spotlights", error);
        spotlightStatus.textContent = "Could not load spotlight members.";
    }
}

function createSpotlightCard(member) {
    const card = document.createElement("article");
    card.className = "business-card spotlight-card";

    const heading = document.createElement("h3");
    heading.className = "business-card-heading";
    heading.textContent = member.name;

    const details = document.createElement("div");
    details.className = "business-card-details";

    const logo = document.createElement("img");
    logo.className = "business-card-logo";
    logo.src = "images/" + member.image;
    logo.alt = member.name + " logo";
    logo.width = 160;
    logo.height = 160;
    logo.loading = "lazy";

    const information = document.createElement("div");
    const phone = document.createElement("p");
    phone.textContent = "Phone: " + member.phone;

    const address = document.createElement("p");
    address.textContent = "Address: " + member.address;

    const website = document.createElement("p");
    const websiteLink = document.createElement("a");
    websiteLink.href = member.website;
    websiteLink.textContent = member.website;
    websiteLink.target = "_blank";
    websiteLink.rel = "noopener noreferrer";
    website.appendChild(document.createTextNode("Website: "));
    website.appendChild(websiteLink);

    const membership = document.createElement("p");
    membership.className = "spotlight-membership";
    membership.textContent = "Membership: ";
    if (member.membership === 3) {
        membership.textContent += "Gold";
    } else {
        membership.textContent += "Silver";
    }

    information.appendChild(phone);
    information.appendChild(address);
    information.appendChild(website);
    information.appendChild(membership);
    details.appendChild(logo);
    details.appendChild(information);
    card.appendChild(heading);
    card.appendChild(details);

    return card;
}
