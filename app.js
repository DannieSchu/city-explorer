const express = require('express');
const data = require('./data/geo.js');
const weather = require('./data/darksky.js');
const app = express();

// const request = require('superagent');

app.get('/location', (request, respond) => {
    const cityData = data.results[0];

    respond.json({
        formatted_query: cityData.formatted_address,
        latitude: cityData.geometry.location.lat,
        longitude: cityData.geometry.location.lng
    });
});

module.exports = { app };
