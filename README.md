# WeatherWise 🌤️

WeatherWise is a modern, responsive weather dashboard built with HTML, CSS, and JavaScript. It allows users to search for any city and view real-time weather conditions along with a 5-day forecast using live API data.

## 🔗 Live Demo
[View Live Site](https://kchamelledesigns.github.io/weather-wise-dashboard/)

## 🚀 Features

- 🌍 Search weather by city
- 🌡️ Real-time temperature and conditions
- 📅 5-day forecast display
- 🔁 Retry button for failed API requests
- ⚠️ Custom error handling UI
- 🕘 Recent search history (saved in localStorage)
- 📱 Fully responsive design
- 🎨 Clean, modern UI/UX

## 🛠️ Built With

- HTML5
- CSS3 (Flexbox & Grid)
- JavaScript (ES6)
- Open-Meteo API (no API key required)

## 📦 Project Structure
```markdown
weatherwise/
├── index.html
├── style.css
└── script.js
```

## ⚙️ How It Works

1. User enters a city name
2. Geocoding API converts city → coordinates
3. Weather API fetches live data
4. UI updates dynamically with results

## 🧠 What I Learned

- Working with real-world APIs using `fetch()`
- Handling async JavaScript and error states
- Managing UI states (loading, success, error)
- Persisting data with localStorage
- Building production-style frontend architecture

## 🔮 Future Improvements

- 📍 Detect user location automatically
- ⭐ Save favorite cities
- 🌙 Dark / Light mode toggle
- 🎞️ Weather animations
- 📊 Extended forecast & charts

## 👤 Author

**K Chamelle Designs**  
Front-End Web Developer

- GitHub: https://github.com/kchamelledesigns