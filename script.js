const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const loadingBox = document.getElementById("loading");
const errorBox = document.getElementById("error");
const weatherCard = document.getElementById("weatherCard");
const cityNameEl = document.getElementById("cityName");
const tempEl = document.getElementById("temp");
const weatherDescEl = document.getElementById("weatherDesc");
const windSpeedEl = document.getElementById("windSpeed");
const humidityEl = document.getElementById("humidity");
const feelsLikeEl = document.getElementById("feelsLike");

function showLoading() {
    loadingBox.classList.remove("hidden");
    errorBox.classList.add("hidden");
    weatherCard.classList.add("hidden");
}

function hideLoading() {
    loadingBox.classList.add("hidden");
}

function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
    weatherCard.classList.add("hidden");
}

function showWeatherCard() {
    weatherCard.classList.remove("hidden");
    errorBox.classList.add("hidden");
}

async function fetchWeatherByCity(city) {
    const trimmed = city.trim();
    if (!trimmed) {
        showError("Please enter a city name.");
        return;
    }

    try {
        showLoading();
        const geoUrl = "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(trimmed) +
            "&count=1&language=en&format=json";

        const geoResponse = await fetch(geoUrl);
        if (!geoResponse.ok) {
            throw new Error("Failed to fetch location data.");
        }

        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
            showError("City not found. Please try another name.");
            hideLoading();
            return;
        }

        const location = geoData.results[0];
        const latitude = location.latitude;
        const longitude = location.longitude;
        const locationName = location.name;
        const country = location.country || "";

        const weatherUrl =
            "https://api.open-meteo.com/v1/forecast?latitude=" +
            latitude +
            "&longitude=" +
            longitude +
            "&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m" +
            "&temperature_unit=celsius&windspeed_unit=kmh&timezone=auto";

        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) {
            throw new Error("Failed to fetch weather data.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        cityNameEl.textContent = country
            ? locationName + ", " + country
            : locationName;

        if (typeof current.temperature_2m === "number") {
            tempEl.textContent = Math.round(current.temperature_2m);
        } else {
            tempEl.textContent = "-";
        }

        weatherDescEl.textContent = "Live weather data from Open-Meteo API.";

        if (typeof current.wind_speed_10m === "number") {
            windSpeedEl.textContent = current.wind_speed_10m + " km/h";
        } else {
            windSpeedEl.textContent = "-";
        }

        if (typeof current.relative_humidity_2m === "number") {
            humidityEl.textContent = current.relative_humidity_2m + " %";
        } else {
            humidityEl.textContent = "-";
        }

        if (typeof current.apparent_temperature === "number") {
            feelsLikeEl.textContent = Math.round(current.apparent_temperature) + " °C";
        } else {
            feelsLikeEl.textContent = "-";
        }

        hideLoading();
        showWeatherCard();
    } catch (err) {
        hideLoading();
        showError("Something went wrong. Please try again.");
        console.error(err);
    }
}

function handleSearch() {
    const city = cityInput.value;
    fetchWeatherByCity(city);
}

searchBtn.addEventListener("click", handleSearch);

cityInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        handleSearch();
    }
});
