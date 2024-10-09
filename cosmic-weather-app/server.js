const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Your OpenWeatherMap API key
const apiKey = '698d25b086a94443ca292fd87eb5d1bd';

app.use(express.static('public'));

app.get('/api/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`);

    const data = response.data;

    const weather = {
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

    res.json(weather);
  } catch (error) {
    console.error(error); // Log the error for debugging
    if (error.response) {
      // API returned a response with an error status code
      if (error.response.status === 404) {
        res.status(404).json({ message: 'City not found. Please check the spelling and try again.' });
      } else if (error.response.status === 401) {
        res.status(401).json({ message: 'API key is invalid. Please check your configuration.' });
      } else {
        res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
      }
    } else {
      // Network error or other issues
      res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
