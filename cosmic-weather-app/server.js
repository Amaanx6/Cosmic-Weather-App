const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config(); // Import dotenv to access environment variables

const app = express();
const port = process.env.PORT || 3000;

const apiKey = process.env.OPENWEATHER_API_KEY; // Use the environment variable

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/api/weather/:city', async (req, res) => {
    try {
        const { city } = req.params;
        console.log(`Fetching weather data for city: ${city}`);

        const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`);

        if (!response.data || !response.data.list || response.data.list.length === 0) {
            return res.status(404).json({ message: 'No weather data available for this city.' });
        }

        const weather = {
            city: response.data.city.name,
            temperature: Math.round(response.data.list[0].main.temp),
            condition: response.data.list[0].weather[0].main,
            description: response.data.list[0].weather[0].description,
            humidity: response.data.list[0].main.humidity,
            windSpeed: Math.round(response.data.list[0].wind.speed),
            feelsLike: Math.round(response.data.list[0].main.feels_like),
            pressure: response.data.list[0].main.pressure,
            icon: response.data.list[0].weather[0].icon,
            forecast: response.data.list.filter((item, index) => index % 8 === 0).slice(0, 5).map(item => ({
                day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
                temp: Math.round(item.main.temp),
                icon: item.weather[0].icon
            }))
        };

        res.json(weather);
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        
        if (error.response) {
            console.error('Response data:', error.response.data);
            
            if (error.response.status === 404) {
                res.status(404).json({ message: 'City not found. Please check the spelling and try again.' });
            } else if (error.response.status === 401) {
                res.status(401).json({ message: 'API key is invalid. Please check your configuration.' });
            } else {
                res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
            }
        } else {
            res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);

    
catch (error) {
    console.error('Error fetching weather data:', error.response ? error.response.data : error.message);
    if (error.response) {
        res.status(error.response.status).json({ message: error.response.data.message || 'An error occurred.' });
    } else {
        res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    }
}

    
});
