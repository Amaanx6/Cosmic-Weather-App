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
    const voiceSearchBtn = document.getElementById('voice-search');
    const feedbackButton = document.getElementById('feedback-button');
    const feedbackForm = document.getElementById('feedback-form');
    const userFeedbackForm = document.getElementById('user-feedback-form');

    let isCelsius = false;
    let currentCity = '';
    let currentWeatherData = null;

    const fetchWeather = async (city) => {
        showLoading();
        try {
            const response = await fetch(`/api/weather/${encodeURIComponent(city)}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }
            const data = await response.json();
            currentWeatherData = data;
            updateWeatherUI(data);
            currentCity = data.city;
            updateBackground(data.condition);
            hideLoading();
        } catch (error) {
            showError(error.message);
        }
    };

    const updateWeatherUI = (data) => {
        cityName.textContent = data.city;
        updateTemperature(data.temperature);
        weatherIcon.className = getWeatherIconClass(data.icon);
        condition.textContent = data.description;
        humidity.textContent = `${data.humidity}%`;
        windSpeed.textContent = `${data.windSpeed} mph`;
        updateFeelsLike(data.feelsLike);
        pressure.textContent = `${data.pressure} hPa`;

        forecast.innerHTML = data.forecast.map(day => `
            <div class="forecast-item">
                <p>${day.day}</p>
                <i class="${getWeatherIconClass(day.icon)}"></i>
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
        if (isCelsius) {
            return Math.round((temp - 32) * 5 / 9);
        }
        return Math.round(temp);
    };

    const getWeatherIconClass = (iconCode) => {
        const iconMap = {
            '01d': 'fas fa-sun',
            '01n': 'fas fa-moon',
            '02d': 'fas fa-cloud-sun',
            '02n': 'fas fa-cloud-moon',
            '03d': 'fas fa-cloud',
            '03n': 'fas fa-cloud',
            '04d': 'fas fa-cloud',
            '04n': 'fas fa-cloud',
            '09d': 'fas fa-cloud-showers-heavy',
            '09n': 'fas fa-cloud-showers-heavy',
            '10d': 'fas fa-cloud-sun-rain',
            '10n': 'fas fa-cloud-moon-rain',
            '11d': 'fas fa-bolt',
            '11n': 'fas fa-bolt',
            '13d': 'fas fa-snowflake',
            '13n': 'fas fa-snowflake',
            '50d': 'fas fa-smog',
            '50n': 'fas fa-smog'
        };
        return iconMap[iconCode] || 'fas fa-question';
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

    const updateBackground = (condition) => {
        document.body.className = condition.toLowerCase();
    };

    const initVoiceSearch = () => {
        if (annyang) {
            const commands = {
                'search for *city': function(city) {
                    cityInput.value = city;
                    searchForm.dispatchEvent(new Event('submit'));
                }
            };

            annyang.addCommands(commands);

            voiceSearchBtn.addEventListener('click', () => {
                annyang.start();
            });
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



    feedbackButton.addEventListener('click', () => {
        feedbackForm.classList.toggle('hidden');
    });

    userFeedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const feedbackText = document.getElementById('feedback-text').value;
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ feedback: feedbackText }),
            });
            if (!response.ok) {
                throw new Error('Failed to submit feedback');
            }
            feedbackForm.classList.add('hidden');
            alert('Thank you for your feedback!');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again later.');
        }
    });

    // Load favorite cities from local storage
    loadFavoriteCities();

    // Load temperature unit preference from local storage
    const savedUnit = localStorage.getItem('temperatureUnit');
    if (savedUnit) {
        isCelsius = savedUnit === 'celsius';
        tempUnitSwitch.checked = isCelsius;
        unitLabel.textContent = isCelsius ? '°C' : '°F';
    }

    // Save temperature unit preference when changed
    tempUnitSwitch.addEventListener('change', () => {
        localStorage.setItem('temperatureUnit', isCelsius ? 'celsius' : 'fahrenheit');
    });

    // Check if it's the user's first visit
    if (!localStorage.getItem('onboardingComplete')) {
        onboarding.classList.remove('hidden');
    }

    // Initialize voice search
    initVoiceSearch();

    // Initial weather fetch
    fetchWeather('Hyderabad');
});