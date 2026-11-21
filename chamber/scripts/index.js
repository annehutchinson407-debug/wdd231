const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const currentYearElement = document.querySelector("#currentYear");
const lastModifiedElement = document.querySelector("#lastModified");
const weatherStatus = document.querySelector("#weather-status");
const weatherRetryButton = document.querySelector("#weather-retry");
const currentWeatherContainer = document.querySelector("#weather-current");
const currentTemp = document.querySelector("#weather-temperature");
const captionDesc = document.querySelector("#weather-description");
const forecastContainer = document.querySelector("#weather-forecast-container");
const forecastList = document.querySelector("#weather-forecast");

const OPENWEATHERMAP_API_KEY = "";
const haikuLocation = {
    latitude: 20.921,
    longitude: -156.305
};
const url = `https://api.openweathermap.org/data/2.5/weather?lat=${haikuLocation.latitude}&lon=${haikuLocation.longitude}&units=imperial&appid=${encodeURIComponent(OPENWEATHERMAP_API_KEY)}`;

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
        ? "Unavailable"
        : lastModifiedDate.toLocaleString();
}

weatherRetryButton.addEventListener("click", loadWeather);
loadWeather();

async function loadWeather() {
    weatherStatus.textContent = "Loading current weather and forecast...";
    weatherRetryButton.hidden = true;
    currentWeatherContainer.hidden = true;
    forecastContainer.hidden = true;

    await apiFetch();
}

async function apiFetch() {
    if (!OPENWEATHERMAP_API_KEY.trim()) {
        showWeatherError("Add a restricted OpenWeatherMap key to OPENWEATHERMAP_API_KEY in scripts/index.js.", false);
        return;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();
        console.log(data);
        displayResults(data);

        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${haikuLocation.latitude}&lon=${haikuLocation.longitude}&units=imperial&appid=${encodeURIComponent(OPENWEATHERMAP_API_KEY)}`;
        const forecast = await fetchWeather(forecastUrl);
        renderForecast(forecast, data.dt);
        weatherStatus.textContent = "Weather data for Haiku, Hawaii, USA.";
    } catch (error) {
        console.error("Unable to load Haiku weather from OpenWeatherMap.", error);
        showWeatherError("Weather data could not be loaded. Check your API key and connection, then retry.", true);
    }
}

async function fetchWeather(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json();
}

function displayResults(data) {
    const temperature = data.main?.temp;
    const description = data.weather?.[0]?.description;
    if (!Number.isFinite(temperature) || typeof description !== "string") {
        throw new Error("Current weather response is missing temperature or description.");
    }

    currentTemp.textContent = `${Math.round(temperature)}`;
    captionDesc.textContent = description;
    currentWeatherContainer.hidden = false;
}

function renderForecast(data, currentTimestamp) {
    const timezoneOffset = data.city?.timezone;
    if (!Number.isFinite(timezoneOffset) || !Number.isFinite(currentTimestamp) || !Array.isArray(data.list)) {
        throw new Error("Forecast response is missing timezone or forecast data.");
    }

    const todayKey = getLocalDateKey(currentTimestamp, timezoneOffset);
    const forecastByDate = new Map();

    for (const entry of data.list) {
        if (!Number.isFinite(entry.dt) || !Number.isFinite(entry.main?.temp_min) ||
            !Number.isFinite(entry.main?.temp_max)) {
            continue;
        }

        const dateKey = getLocalDateKey(entry.dt, timezoneOffset);
        if (dateKey <= todayKey) {
            continue;
        }

        const day = forecastByDate.get(dateKey) || {
            high: Number.NEGATIVE_INFINITY,
            low: Number.POSITIVE_INFINITY
        };
        day.high = Math.max(day.high, entry.main.temp_max);
        day.low = Math.min(day.low, entry.main.temp_min);
        forecastByDate.set(dateKey, day);
    }

    const forecastDays = [...forecastByDate.entries()].sort(([dateA], [dateB]) => dateA.localeCompare(dateB)).slice(0, 3);
    if (forecastDays.length !== 3) {
        throw new Error("OpenWeatherMap did not provide three upcoming forecast days.");
    }

    const items = forecastDays.map(([dateKey, temperatures]) => {
        const item = document.createElement("li");
        const date = document.createElement("strong");
        date.textContent = formatForecastDate(dateKey);

        const high = document.createElement("span");
        high.textContent = `High: ${Math.round(temperatures.high)} °F`;

        const low = document.createElement("span");
        low.textContent = `Low: ${Math.round(temperatures.low)} °F`;

        item.append(date, high, low);
        return item;
    });

    forecastList.replaceChildren(...items);
    forecastContainer.hidden = false;
}

function getLocalDateKey(timestamp, timezoneOffset) {
    return new Date((timestamp + timezoneOffset) * 1000).toISOString().slice(0, 10);
}

function formatForecastDate(dateKey) {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        timeZone: "UTC"
    }).format(new Date(`${dateKey}T00:00:00Z`));
}

function showWeatherError(message, canRetry) {
    weatherStatus.textContent = message;
    weatherRetryButton.hidden = !canRetry;
}
