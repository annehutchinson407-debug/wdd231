const currentTemp = document.querySelector("#weather-temperature");
const weatherIcon = document.querySelector("#weather-icon");
const captionDesc = document.querySelector("#weather-description");
const weatherStatus = document.querySelector("#weather-status");
const forecastList = document.querySelector("#weather-forecast");

const haikuLocation = {
    latitude: 20.92,
    longitude: -156.31
};

const url = "https://api.openweathermap.org/data/2.5/weather";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

loadWeather();

async function loadWeather() {
    weatherStatus.textContent = "Loading weather...";

    const apiKey = window.OPENWEATHERMAP_API_KEY || "";
    if (!apiKey.trim()) {
        weatherStatus.textContent = "Weather unavailable: OpenWeatherMap API key is not configured.";
        return;
    }

    await apiFetch();
}

async function apiFetch() {
    try {
        const parameters = new URLSearchParams({
            lat: String(haikuLocation.latitude),
            lon: String(haikuLocation.longitude),
            units: "imperial",
            appid: window.OPENWEATHERMAP_API_KEY
        });
        const query = parameters.toString();
        const results = await Promise.all([
            fetchWeather(url + "?" + query),
            fetchWeather(forecastUrl + "?" + query)
        ]);
        const current = results[0];
        const forecast = results[1];

        displayResults(current);
        renderForecast(forecast, current.dt);
        weatherStatus.textContent = "Weather data for Haiku, Hawaii, USA.";
    } catch (error) {
        console.error("Unable to load Haiku weather from OpenWeatherMap.", error);
        weatherStatus.textContent = "Weather unavailable: " + error.message;
    }
}

async function fetchWeather(requestUrl) {
    const response = await fetch(requestUrl);
    if (!response.ok) {
        const detail = await response.text();
        throw new Error("OpenWeatherMap request failed (" + response.status + ")" +
            (detail ? ": " + detail : ""));
    }
    return response.json();
}

function displayResults(data) {
    if (!data || !data.main || !Array.isArray(data.weather) || !data.weather[0]) {
        throw new Error("Current weather response is incomplete.");
    }

    const description = data.weather[0].description;
    currentTemp.textContent = Math.round(data.main.temp);
    weatherIcon.src = "https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";
    weatherIcon.alt = description;
    captionDesc.textContent = description;
}

function renderForecast(data, currentTimestamp) {
    if (!data || !Array.isArray(data.list)) {
        throw new Error("Forecast response is incomplete.");
    }

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
            forecastDays.push({
                date: dateKey,
                timestamp: entry.dt,
                high: entry.main.temp_max,
                low: entry.main.temp_min
            });
        } else {
            if (entry.main.temp_max > forecastDays[dayIndex].high) {
                forecastDays[dayIndex].high = entry.main.temp_max;
            }
            if (entry.main.temp_min < forecastDays[dayIndex].low) {
                forecastDays[dayIndex].low = entry.main.temp_min;
            }
        }
    }

    if (forecastDays.length < 3) {
        throw new Error("OpenWeatherMap returned fewer than three forecast days.");
    }

    forecastList.replaceChildren();
    for (let i = 0; i < 3; i++) {
        const temperatures = forecastDays[i];
        const item = document.createElement("li");
        const date = document.createElement("strong");
        date.textContent = formatForecastDate(temperatures.timestamp);

        const high = document.createElement("span");
        high.textContent = "High: " + Math.round(temperatures.high) + " °F";

        const low = document.createElement("span");
        low.textContent = "Low: " + Math.round(temperatures.low) + " °F";

        item.append(date, high, low);
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
