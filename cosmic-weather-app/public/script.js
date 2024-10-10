document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '7f2326f363e12307dfaa0a6e91658513';
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

    let isCelsius = true; // Default to Celsius
    let currentCity = '';
    let currentWeatherData = null;

    const fetchWeather = async (city) => {
        showLoading();
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
            if (!response.ok) {
                throw new Error('City not found. Please check the spelling and try again.');
            }
            const data = await response.json();
            currentWeatherData = processWeatherData(data);
            updateWeatherUI(currentWeatherData);
            currentCity = currentWeatherData.city;
            updateBackground(currentWeatherData.condition);
        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
    };

    const processWeatherData = (data) => {
        return {
            city: data.city.name,
            temperature: Math.round(data.list[0].main.temp),
            condition: data.list[0].weather[0].main,
            description: data.list[0].weather[0].description,
            humidity: data.list[0].main.humidity,
            windSpeed: Math.round(data.list[0].wind.speed),
            feelsLike: Math.round(data.list[0].main.feels_like),
            pressure: data.list[0].main.pressure,
            icon: data.list[0].weather[0].icon,
            forecast: data.list.filter((item, index) => index % 8 === 0).slice(0, 5).map(item => ({
                day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
                temp: Math.round(item.main.temp),
                icon: item.weather[0].icon
            }))
        };
    };

    const updateWeatherUI = (data) => {
        cityName.textContent = data.city;
        updateTemperature(data.temperature);
        weatherIcon.className = getWeatherIconClass(data.icon);
        condition.textContent = data.description;
        humidity.textContent = `${data.humidity}%`;
        windSpeed.textContent = `${data.windSpeed} m/s`;
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
        if (!isCelsius) {
            return Math.round((temp * 9/5) + 32);
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
        isCelsius = !tempUnitSwitch.checked;
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

    userFeedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const feedbackText = document.getElementById('feedback-text').value;
        console.log('Feedback received:', feedbackText);
        // In a real application, you would send this feedback to a server
        feedbackForm.classList.add('hidden');
        alert('Thank you for your feedback!');
    });

    // Load favorite cities from local storage
    loadFavoriteCities();

    // Load temperature unit preference from local storage
    const savedUnit = localStorage.getItem('temperatureUnit');
    if (savedUnit) {
        isCelsius = savedUnit === 'celsius';
        tempUnitSwitch.checked = !isCelsius;
        unitLabel.textContent = isCelsius ? '°C' : '°F';
    } else {
        // Set default to Celsius
        isCelsius = true;
        tempUnitSwitch.checked = false;
        unitLabel.textContent = '°C';
    }

    // Save temperature unit preference when changed
    tempUnitSwitch.addEventListener('change', () => {
        localStorage.setItem('temperatureUnit', isCelsius ? 'celsius' : 'fahrenheit');
    });

    // Initialize voice search
    initVoiceSearch();

    // Initial weather fetch
    fetchWeather('Hyderabad');
});