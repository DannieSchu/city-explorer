const express = require('express');
const data = require('./data/geo.js');
const weather = require('./data/darksky.js');
// const cors = require('cors');
const app = express();
// const request = require('superagent');

// app.use(cors());
app.get('/', (request, respond) => respond.send('Jello World!'));


let lat;
let lng;

app.get('/location', (request, respond) => {
    // const location = request.query.search;

    const cityData = data.results[0];
    
    // update global state of lat and lng
    lat = cityData.geometry.location.lat;
    lng = cityData.geometry.location.lng;

    respond.json({
        formatted_query: cityData.formatted_address,
        latitude: cityData.geometry.location.lat,
        longitude: cityData.geometry.location.lng
    });
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
