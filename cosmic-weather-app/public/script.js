// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    const cityName = document.getElementById('city-name');
    const temperature = document.getElementById('temperature');
    const condition = document.getElementById('condition');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('wind-speed');
    const airQuality = document.getElementById('air-quality');
    const forecast = document.getElementById('forecast');
    const searchForm = document.getElementById('search-form');
    const cityInput = document.getElementById('city-input');
    const tempUnitSwitch = document.getElementById('temp-unit-switch');

    let isCelsius = false;

    // Create stars
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
        try {
            const response = await fetch(`/api/weather/${city}`);
            const data = await response.json();
            updateWeatherUI(data);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    };

    const updateWeatherUI = (data) => {
        cityName.textContent = data.city;
        temperature.textContent = `${convertTemperature(data.temperature)}°${isCelsius ? 'C' : 'F'}`;
        condition.innerHTML = `<i class="bi ${getWeatherIcon(data.condition)}"></i> ${data.condition}`;
        humidity.textContent = `${data.humidity}%`;
        windSpeed.textContent = `${data.windSpeed} mph`;
        airQuality.textContent = data.airQuality;

        forecast.innerHTML = data.forecast.map(day => `
            <div class="text-center">
                <div>${day.day}</div>
                <i class="bi ${getWeatherIcon(day.icon)} text-2xl my-2"></i>
                <div>${convertTemperature(day.temp)}°</div>
            </div>
        `).join('');
    };

    const getWeatherIcon = (condition) => {
        switch (condition.toLowerCase()) {
            case 'clear':
                return 'bi-sun';
            case 'clouds':
                return 'bi-cloud';
            case 'rain':
                return 'bi-cloud-rain';
            case 'snow':
                return 'bi-snow';
            default:
                return 'bi-cloud';
        }
    };

    const convertTemperature = (temp) => {
        if (isCelsius) {
            return Math.round((temp - 32) * 5 / 9);
        }
        return Math.round(temp);
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
        const currentTemp = parseInt(temperature.textContent);
        temperature.textContent = `${convertTemperature(currentTemp)}°${isCelsius ? 'C' : 'F'}`;
        forecast.querySelectorAll('div > div:last-child').forEach(el => {
            const temp = parseInt(el.textContent);
            el.textContent = `${convertTemperature(temp)}°`;
        });
    });

    // Initial weather fetch
    fetchWeather('New York');
});