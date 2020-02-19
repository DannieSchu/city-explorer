require('dotenv').config();
const express = require('express');
const weather = require('./data/darksky.js');
const app = express();
const request = require('superagent');
// const cors = require('cors');

// app.use(cors());
app.get('/', (req, res) => res.send('Hello World!'));


let lat;
let lng;

app.get('/location', async(req, res, next) => {
    try {
        // get location from query params
        const location = req.query.search;
        // define URL, passing in API key (from .env) and location as variables
        const URL = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${location}&format=json`;
        // get data using URL
        const cityData = await request.get(URL);
        // store data for first result
        const firstResult = cityData.body[0];
        
        // update global state of lat and lng
        lat = firstResult.lat;
        lng = firstResult.lon;
    
        res.json({
            formatted_query: firstResult.display_name,
            latitude: lat,
            longitude: lng,
        });
    // if this breaks, catch error and pass to next 
    } catch (err) {
        next(err);
    }
});

const getWeatherData = (lat, lng) => {
    return weather.daily.data.map(forecast => {
        return {
            forecast: forecast.summary,
            time: new Date(forecast.time * 1000)
        };
    });
};

app.get('/weather', (req, res) => {
    const portlandWeather = getWeatherData(lat, lng);

    res.json(portlandWeather);
});

app.get('*', (req, res) => res.send('404!'));

module.exports = { app };
