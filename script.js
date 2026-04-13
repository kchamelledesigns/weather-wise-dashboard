const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const formMessage = document.getElementById("formMessage");
const weatherContent = document.getElementById("weatherContent");
const emptyState = document.getElementById("emptyState");
const errorCard = document.getElementById("errorCard");
const errorCardMessage = document.getElementById("errorCardMessage");
const forecastGrid = document.getElementById("forecastGrid");
const recentSearchList = document.getElementById("recentSearchList");
const clearRecentBtn = document.getElementById("clearRecentBtn");
const searchBtn = document.getElementById("searchBtn");
const retryBtn = document.getElementById("retryBtn");

const cityNameEl = document.getElementById("cityName");
const weatherDateEl = document.getElementById("weatherDate");
const weatherEmojiEl = document.getElementById("weatherEmoji");
const temperatureEl = document.getElementById("temperature");
const conditionEl = document.getElementById("condition");
const feelsLikeEl = document.getElementById("feelsLike");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const precipitationEl = document.getElementById("precipitation");

const RECENT_SEARCHES_KEY = "weatherwise_recent_searches";
let lastSearchedCity = "";

function setMessage(message, type = "") {
  formMessage.textContent = message;
  formMessage.className = "form-message";

  if (type) {
    formMessage.classList.add(type);
  }
}

function showEmptyState() {
  emptyState.classList.remove("hidden");
  weatherContent.classList.add("hidden");
  errorCard.classList.add("hidden");
}

function showWeatherState() {
  emptyState.classList.add("hidden");
  weatherContent.classList.remove("hidden");
  errorCard.classList.add("hidden");
}

function showErrorState(message) {
  errorCardMessage.textContent = message;
  emptyState.classList.add("hidden");
  weatherContent.classList.add("hidden");
  errorCard.classList.remove("hidden");
}

function formatCityName(city) {
  return city
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isValidCity(city) {
  return /^[a-zA-Z\s.'-]{2,60}$/.test(city.trim());
}

function getDisplayDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

function getRecentSearches() {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

function saveRecentSearch(city) {
  const formatted = formatCityName(city);
  const current = getRecentSearches().filter(
    (item) => item.toLowerCase() !== formatted.toLowerCase()
  );

  current.unshift(formatted);

  const trimmed = current.slice(0, 6);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(trimmed));
  renderRecentSearches();
}

function renderRecentSearches() {
  const searches = getRecentSearches();

  if (!searches.length) {
    recentSearchList.innerHTML =
      `<div class="empty-chip">No recent searches yet</div>`;
    return;
  }

  recentSearchList.innerHTML = searches
    .map(
      (city) => `
        <button class="recent-chip" type="button" data-city="${city}">
          ${city}
        </button>
      `
    )
    .join("");
}

function setLoadingState(isLoading) {
  searchBtn.disabled = isLoading;
  searchBtn.textContent = isLoading ? "Loading..." : "Search";

  if (retryBtn) {
    retryBtn.disabled = isLoading;
    retryBtn.textContent = isLoading ? "Loading..." : "Try Again";
  }
}

function getWeatherInfo(code, isDay = true) {
  const weatherMap = {
    0: { label: "Clear sky", emoji: isDay ? "☀️" : "🌙" },
    1: { label: "Mainly clear", emoji: isDay ? "🌤️" : "🌙" },
    2: { label: "Partly cloudy", emoji: "⛅" },
    3: { label: "Overcast", emoji: "☁️" },
    45: { label: "Fog", emoji: "🌫️" },
    48: { label: "Rime fog", emoji: "🌫️" },
    51: { label: "Light drizzle", emoji: "🌦️" },
    53: { label: "Moderate drizzle", emoji: "🌦️" },
    55: { label: "Dense drizzle", emoji: "🌧️" },
    56: { label: "Freezing drizzle", emoji: "🌧️" },
    57: { label: "Freezing drizzle", emoji: "🌧️" },
    61: { label: "Slight rain", emoji: "🌦️" },
    63: { label: "Moderate rain", emoji: "🌧️" },
    65: { label: "Heavy rain", emoji: "🌧️" },
    66: { label: "Freezing rain", emoji: "🌧️" },
    67: { label: "Heavy freezing rain", emoji: "🌧️" },
    71: { label: "Slight snow", emoji: "🌨️" },
    73: { label: "Moderate snow", emoji: "❄️" },
    75: { label: "Heavy snow", emoji: "❄️" },
    77: { label: "Snow grains", emoji: "❄️" },
    80: { label: "Rain showers", emoji: "🌦️" },
    81: { label: "Rain showers", emoji: "🌧️" },
    82: { label: "Violent rain showers", emoji: "⛈️" },
    85: { label: "Snow showers", emoji: "🌨️" },
    86: { label: "Heavy snow showers", emoji: "❄️" },
    95: { label: "Thunderstorm", emoji: "⛈️" },
    96: { label: "Thunderstorm with hail", emoji: "⛈️" },
    99: { label: "Thunderstorm with hail", emoji: "⛈️" }
  };

  return weatherMap[code] || { label: "Weather unavailable", emoji: "🌤️" };
}

async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city
  )}&count=1&language=en&format=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to search for that city.");
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("City not found. Try searching for another location.");
  }

  return data.results[0];
}

async function getWeather(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Live weather service is temporarily unavailable.");
  }

  return response.json();
}

function renderForecast(dailyData) {
  const {
    time,
    weather_code: weatherCodes,
    temperature_2m_max: maxTemps,
    temperature_2m_min: minTemps
  } = dailyData;

  const cards = time.slice(0, 5).map((date, index) => {
    const info = getWeatherInfo(weatherCodes[index], true);
    const dayLabel = new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
      weekday: "short"
    });

    return `
      <article class="forecast-card">
        <p class="forecast-card__day">${dayLabel}</p>
        <div class="forecast-card__icon">${info.emoji}</div>
        <p class="forecast-card__temp">${Math.round(maxTemps[index])}° / ${Math.round(minTemps[index])}°</p>
        <p class="forecast-card__condition">${info.label}</p>
      </article>
    `;
  });

  forecastGrid.innerHTML = cards.join("");
}

function renderWeather(location, weatherData) {
  const current = weatherData.current;
  const weatherInfo = getWeatherInfo(current.weather_code, current.is_day === 1);

  const locationText = location.country
    ? `${location.name}, ${location.country}`
    : location.name;

  cityNameEl.textContent = locationText;
  weatherDateEl.textContent = getDisplayDate();
  weatherEmojiEl.textContent = weatherInfo.emoji;
  temperatureEl.textContent = `${Math.round(current.temperature_2m)}°`;
  conditionEl.textContent = weatherInfo.label;
  feelsLikeEl.textContent = `${Math.round(current.apparent_temperature)}°`;
  humidityEl.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  windEl.textContent = `${Math.round(current.wind_speed_10m)} mph`;
  precipitationEl.textContent = `${Number(current.precipitation).toFixed(2)} in`;

  renderForecast(weatherData.daily);
  showWeatherState();
}

async function handleSearch(city) {
  const trimmedCity = city.trim();
  lastSearchedCity = trimmedCity;

  if (!trimmedCity) {
    setMessage("Please enter a city name.", "error");
    showEmptyState();
    return;
  }

  if (!isValidCity(trimmedCity)) {
    setMessage("Use letters only for city names.", "error");
    showErrorState(
      "Please enter a valid city name using letters and basic punctuation only."
    );
    return;
  }

  try {
    setLoadingState(true);
    setMessage("Loading live weather data...", "loading");

    const location = await getCoordinates(trimmedCity);
    const weatherData = await getWeather(location.latitude, location.longitude);

    renderWeather(location, weatherData);
    saveRecentSearch(trimmedCity);
    setMessage(`Showing live weather for ${location.name}.`, "success");
  } catch (error) {
    const message = error.message || "We could not load weather data right now.";
    setMessage(message, "error");
    showErrorState(message);
  } finally {
    setLoadingState(false);
  }
}

weatherForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleSearch(cityInput.value);
  cityInput.value = "";
});

recentSearchList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-city]");
  if (!button) return;

  handleSearch(button.dataset.city);
});

clearRecentBtn.addEventListener("click", () => {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
  renderRecentSearches();
  setMessage("Recent searches cleared.", "success");
});

if (retryBtn) {
  retryBtn.addEventListener("click", () => {
    if (lastSearchedCity) {
      handleSearch(lastSearchedCity);
    } else {
      showEmptyState();
      setMessage("Search for a city to try again.", "error");
    }
  });
}

renderRecentSearches();
handleSearch("Los Angeles");