// server.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=imperial`);
    const data = response.data;

    const weather = {
      city: data.city.name,
      temperature: Math.round(data.list[0].main.temp),
      condition: data.list[0].weather[0].main,
      humidity: data.list[0].main.humidity,
      windSpeed: Math.round(data.list[0].wind.speed),
      airQuality: 'Good', // You might want to use a separate API for air quality
      forecast: data.list.filter((item, index) => index % 8 === 0).slice(0, 5).map(item => ({
        day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: Math.round(item.main.temp),
        icon: item.weather[0].main
      }))
    };

    res.json(weather);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weather data' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});