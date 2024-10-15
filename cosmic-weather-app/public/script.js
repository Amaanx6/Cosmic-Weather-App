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
    const airQuality = document.getElementById('air-quality');
    const sunrise = document.getElementById('sunrise');
    const sunset = document.getElementById('sunset');
    const visibility = document.getElementById('visibility');
    const precipitation = document.getElementById('precipitation');
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

    let isCelsius = true;
    let currentCity = '';
    let currentWeatherData = null;

    const fetchWeatherByCoords = async (lat, lon) => {
        showLoading();
        try {
            const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
            if (!weatherResponse.ok) {
                throw new Error('Unable to fetch weather data. Please try again.');
            }
            const weatherData = await weatherResponse.json();

            const airQualityResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
            const airQualityData = await airQualityResponse.json();

            currentWeatherData = processWeatherData(weatherData, airQualityData);
            
            updateWeatherUI(currentWeatherData);
            currentCity = currentWeatherData.city;
            updateBackground(currentWeatherData.condition);
        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
    };

    const fetchWeatherByCity = async (city) => {
        showLoading();
        try {
            const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
            if (!weatherResponse.ok) {
                throw new Error('City not found. Please check the spelling and try again.');
            }
            const weatherData = await weatherResponse.json();

            const airQualityResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.city.coord.lat}&lon=${weatherData.city.coord.lon}&appid=${apiKey}`);
            const airQualityData = await airQualityResponse.json();

            currentWeatherData = processWeatherData(weatherData, airQualityData);
            updateWeatherUI(currentWeatherData);
            currentCity = currentWeatherData.city;
            updateBackground(currentWeatherData.condition);
        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
    };

    const processWeatherData = (weatherData, airQualityData) => {
        const currentWeather = weatherData.list[0];
        return {
            city: weatherData.city.name,
            temperature: Math.round(currentWeather.main.temp),
            condition: currentWeather.weather[0].main,
            description: currentWeather.weather[0].description,
            humidity: currentWeather.main.humidity,
            windSpeed: Math.round(currentWeather.wind.speed),
            feelsLike: Math.round(currentWeather.main.feels_like),
            pressure: currentWeather.main.pressure,
            icon: currentWeather.weather[0].icon,
            airQuality: getAirQualityDescription(airQualityData.list[0].main.aqi),
            sunrise: new Date(weatherData.city.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sunset: new Date(weatherData.city.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            visibility: (currentWeather.visibility / 1000).toFixed(1),
            precipitation: (currentWeather.rain && currentWeather.rain['3h']) || 0,
            forecast: weatherData.list.filter((item, index) => index % 8 === 0).slice(0, 5).map(item => ({
                day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
                date: new Date(item.dt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                temp: Math.round(item.main.temp),
                icon: item.weather[0].icon,
                description: item.weather[0].description,
                humidity: item.main.humidity,
                windSpeed: Math.round(item.wind.speed),
                pressure: item.main.pressure
            }))
        };
    };

    const getAirQualityDescription = (aqi) => {
        const descriptions = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
        return descriptions[aqi - 1] || 'Unknown';
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
        airQuality.textContent = data.airQuality;
        sunrise.textContent = data.sunrise;
        sunset.textContent = data.sunset;
        visibility.textContent = `${data.visibility} km`;
        precipitation.textContent = `${data.precipitation} mm`;

        forecast.innerHTML = data.forecast.map((day, index) => `
            <div class="forecast-item" data-index="${index}">
                <div class="forecast-item-header">
                    <span>${day.day}, ${day.date}</span>
                    <span>${convertTemperature(day.temp)}°${isCelsius ? 'C' : 'F'}</span>
                    <i class="${getWeatherIconClass(day.icon)}"></i>
                    <i class="fas fa-chevron-down toggle-icon"></i>
                </div>
                <div class="forecast-item-details">
                    <ul>
                        <li><span>Description:</span> <span>${day.description}</span></li>
                        <li><span>Humidity:</span> <span>${day.humidity}%</span></li>
                        <li><span>Wind Speed:</span> <span>${day.windSpeed} m/s</span></li>
                        <li><span>Pressure:</span> <span>${day.pressure} hPa</span></li>
                    </ul>
                </div>
            </div>
        `).join('');

        // Add click event listeners to forecast items
        document.querySelectorAll('.forecast-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Prevent the click event from bubbling up
                e.stopPropagation();
                
                // Toggle the active class on the clicked item
                item.classList.toggle('active');
                
                // Close other open items
                document.querySelectorAll('.forecast-item').forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
            });
        });
    };

    const updateTemperature = (temp) => {
        temperature.textContent = convertTemperature(temp);
        temperature.nextElementSibling.textContent = isCelsius ? '°C' : '°F';
    };

    const updateFeelsLike = (temp) => {
        feelsLike.textContent = `${convertTemperature(temp)}°${isCelsius ? 'C' : '°F'}`;
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
            <div class="favorite-city">
                <span>${city}</span>
                <button class="remove-favorite" data-city="${city}">×</button>
            </div>
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

    const removeFavoriteCity = (city) => {
        let favorites = JSON.parse(localStorage.getItem('favoriteCities')) || [];
        favorites = favorites.filter(fav => fav !== city);
        localStorage.setItem('favoriteCities', JSON.stringify(favorites));
        loadFavoriteCities();
    };

    const updateBackground = (condition) => {
        document.body.className = condition.toLowerCase();
    };

    const initVoiceSearch = () => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                voiceSearchBtn.classList.add('listening');
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                cityInput.value = transcript;
                searchForm.dispatchEvent(new Event('submit'));
            };

            recognition.onend = () => {
                voiceSearchBtn.classList.remove('listening');
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                voiceSearchBtn.classList.remove('listening');
            };

            voiceSearchBtn.addEventListener('click', () => {
                recognition.start();
            });
        } else {
            console.log('Web Speech API is not supported in this browser.');
            voiceSearchBtn.style.display = 'none';
        }
    };

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error("Error getting user location:", error);
                    fetchWeatherByCity('Hyderabad');
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
            fetchWeatherByCity('Hyderabad');
        }
    };

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherByCity(city);
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
        if (e.target.classList.contains('remove-favorite')) {
            const city = e.target.getAttribute('data-city');
            removeFavoriteCity(city);
        } else if (e.target.closest('.favorite-city')) {
            const cityName = e.target.closest('.favorite-city').querySelector('span').textContent;
            fetchWeatherByCity(cityName);
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

    // Get user location or use default city
    getUserLocation();
});
