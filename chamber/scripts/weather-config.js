const weatherStatus = document.querySelector("#weather-status");
const weatherRetryButton = document.querySelector("#weather-retry");
const forecastContainer = document.querySelector("#weather-forecast-container");
const forecastList = document.querySelector("#weather-forecast");

const OPENWEATHERMAP_API_KEY = window.OPENWEATHERMAP_API_KEY || "";
const haikuLocation = {
    latitude: 20.921,
    longitude: -156.305
};

weatherRetryButton.addEventListener("click", loadWeather);
loadWeather();

async function loadWeather() {
    weatherStatus.textContent = "Loading the 3-day forecast...";
    weatherRetryButton.hidden = true;
    forecastContainer.hidden = true;

    await apiFetch();
}

async function apiFetch() {
    if (!OPENWEATHERMAP_API_KEY.trim()) {
        return;
    }

    try {
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${haikuLocation.latitude}&lon=${haikuLocation.longitude}&units=imperial&appid=${encodeURIComponent(OPENWEATHERMAP_API_KEY)}`;
        const forecast = await fetchWeather(forecastUrl);
        renderForecast(forecast, Date.now() / 1000);
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
