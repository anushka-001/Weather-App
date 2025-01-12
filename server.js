// server.js

const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Use JSON middleware to parse JSON request bodies
app.use(express.json());

// OpenWeatherMap API key (EXPOSED IN CODE - not recommended for production)
const OPENWEATHER_API_KEY = 'd461da4aca3dec06c68abbe8bf491adc';

// An in-memory array to store saved cities (optional feature)
let savedCities = [];

/**
 * GET /api
 * Basic route to confirm the server is running
 */
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the City Weather API!' });
});

/**
 * GET /api/weather/:city
 * Returns current weather data for the specified city
 */
app.get('/api/weather/:city', async (req, res) => {
  const city = req.params.city;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;

  try {
    const response = await axios.get(url);
    const { main, weather, name } = response.data;

    const weatherInfo = {
      city: name,
      temperature: main.temp,
      description: weather[0].description
    };

    res.json({ success: true, data: weatherInfo });
  } catch (error) {
    console.error(error);
    res.status(404).json({ success: false, message: 'City not found or API error.' });
  }
});

/**
 * POST /api/cities
 * Save a city's weather info in our in-memory array
 */
app.post('/api/cities', async (req, res) => {
  const { city } = req.body;
  if (!city) {
    return res.status(400).json({ success: false, message: 'City name is required.' });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  try {
    const response = await axios.get(url);
    const { main, weather, name } = response.data;

    const weatherInfo = {
      city: name,
      temperature: main.temp,
      description: weather[0].description,
      savedAt: new Date().toISOString()
    };

    // Push it to our in-memory storage
    savedCities.push(weatherInfo);

    res.json({ success: true, data: weatherInfo });
  } catch (error) {
    console.error(error);
    res.status(404).json({ success: false, message: 'City not found or API error.' });
  }
});

/**
 * GET /api/cities
 * Retrieve all saved city weather info
 */
app.get('/api/cities', (req, res) => {
  res.json({ success: true, data: savedCities });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
