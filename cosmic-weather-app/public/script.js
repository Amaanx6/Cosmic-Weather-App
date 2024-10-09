document.addEventListener('DOMContentLoaded', () => {
    const cityName = document.getElementById('city-name');
    const temperature = document.getElementById('temperature');
    const weatherIcon = document.getElementById('weather-icon');
    const condition = document.getElementById('condition');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('wind-speed');
    const feelsLike = document.getElementById('feels-like');
    const pressure = document.getElementById('pressure');
    const forecast = document.querySelector('.forecast-container');
    const searchForm = document.getElementById('search-form');
    const cityInput = document.getElementById('city-input');
    const tempUnitSwitch = document.getElementById('temp-unit-switch');
    const unitLabel = document.querySelector('.unit-label');
    const loading = document.getElementById('loading');
    const weatherContent = document.getElementById('weather-content');
    const errorMessage = document.getElementById('error-message');
    const favoriteCities = document.getElementById('favorite-cities');
    const addFavoriteBtn = document.getElementById('add-favorite');

    let isCelsius = false;
    let currentCity = '';
    let currentWeatherData = null;

    const starsContainer = document.getElementById('stars-container');
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.animationDuration = `${Math.random() * 5 + 5}s`;
        starsContainer.appendChild(star);
    }

    const fetchWeather = async (city) => {
        showLoading();
        try {
            const response = await fetch(`/api/weather/${city}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }
            const data = await response.json();
            currentWeatherData = data;
            updateWeatherUI(data);
            currentCity = data.city;
            hideLoading();
        } catch (error) {
            showError(error.message);
        }
    };

    const updateWeatherUI = (data) => {
        cityName.textContent = data.city;
        updateTemperature(data.temperature);
        weatherIcon.src = `http://openweathermap.org/img/wn/${data.icon}@2x.png`;
        weatherIcon.alt = data.description;
        condition.textContent = data.description;
        humidity.textContent = `${data.humidity}%`;
        windSpeed.textContent = `${data.windSpeed} mph`;
        updateFeelsLike(data.feelsLike);
        pressure.textContent = `${data.pressure} hPa`;

        forecast.innerHTML = data.forecast.map(day => `
            <div class="forecast-item">
                <p>${day.day}</p>
                <img src="http://openweathermap.org/img/wn/${day.icon}.png" alt="Weather icon">
                <p>${convertTemperature(day.temp)}°${isCelsius ? 'C' : 'F'}</p>
            </div>
        `).join('');
    };

    const updateTemperature = (temp) => {
        temperature.textContent = convertTemperature(temp);
        temperature.nextElementSibling.textContent = isCelsius ? '°C' : '°F';
    };

    const updateFeelsLike = (temp) => {
        feelsLike.textContent = `${convertTemperature(temp)}°${isCelsius ? 'C' : 'F'}`;
    };

    const convertTemperature = (temp) => {
        return isCelsius ? Math.round((temp - 32) * 5 / 9) : Math.round(temp);
    };

    const showLoading = () => {
        loading.classList.remove('hidden');
        weatherContent.classList.add('hidden');
        errorMessage.classList.add('hidden');
    };

    const hideLoading = () => {
        loading.classList.add('hidden');
        weatherContent.classList.remove('hidden');
        errorMessage.classList.add('hidden');
    };

    const showError = (message) => {
        loading.classList.add('hidden');
        weatherContent.classList.add('hidden');
        errorMessage.classList.remove('hidden');
        errorMessage.textContent = message;
    };

    const loadFavoriteCities = () => {
        const favorites = JSON.parse(localStorage.getItem('favoriteCities')) || [];
        favoriteCities.innerHTML = favorites.map(city => `
            <div class="favorite-city">${city}</div>
        `).join('');
    };

    const addFavoriteCity = (city) => {
        const favorites = JSON.parse(localStorage.getItem('favoriteCities')) || [];
        if (!favorites.includes(city)) {
            favorites.push(city);
            localStorage.setItem('favoriteCities', JSON.stringify(favorites));
            loadFavoriteCities();
        }
    };

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
            cityInput.value = '';
        }
    });

    tempUnitSwitch.addEventListener('change', () => {
        isCelsius = tempUnitSwitch.checked;
        unitLabel.textContent = isCelsius ? '°C' : '°F';
        if (currentWeatherData) {
            updateWeatherUI(currentWeatherData);
        }
    });

    addFavoriteBtn.addEventListener('click', () => {
        if (currentCity) {
            addFavoriteCity(currentCity);
        }
    });

    favoriteCities.addEventListener('click', (e) => {
        if (e.target.classList.contains('favorite-city')) {
            fetchWeather(e.target.textContent);
        }
    });

    loadFavoriteCities();

    const savedUnit = localStorage.getItem('temperatureUnit');
    if (savedUnit) {
        isCelsius = savedUnit === 'celsius';
        tempUnitSwitch.checked = isCelsius;
        unitLabel.textContent = isCelsius ? '°C' : '°F';
    }

    tempUnitSwitch.addEventListener('change', () => {
        localStorage.setItem('temperatureUnit', isCelsius ? 'celsius' : 'fahrenheit');
    });

    fetchWeather('Hyderabad');
});
