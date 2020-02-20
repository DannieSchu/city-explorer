require('dotenv').config();
const express = require('express');
// const weather = require('./data/darksky.js');
const app = express();
const request = require('superagent');
// const cors = require('cors');

// app.use(cors());
app.get('/', (req, res) => res.send('Hello World!'));


let lat;
let lng;

app.get('/location', async (req, res, next) => {
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

const getWeatherData = async (lat, lng, next) => {
    try {
        const URL = `https://api.darksky.net/forecast/ea00a4754ac9af00b3d8fa931923f3ec/${lat},${lng}?key=${process.env.DARKSKY_API_KEY}`;

        const weather = await request.get(URL);

        return weather.daily.data.map(forecast => {
            return {
                forecast: forecast.summary,
                time: new Date(forecast.time * 1000)
            };
        });
    } catch (err) {
        next(err);
    }
};

app.get('/weather', async (req, res) => {
    const localWeather = await getWeatherData(lat, lng);

    res.json(localWeather);
});


const getYelpData = async (lat, lng) => {
    const URL = `https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${lat}&longitude=${lng}`;
    const yelp = await request.get(URL).set('Authorization', `Bearer ${process.env.YELP_API_KEY}`);

    return yelp.body.businesses.map(business => {
        return {
            rating: business.rating,
            name: business.alias,
            price: business.price,
            url: business.url,
            image: business.image_url
        };
    });
};


app.get('/yelp', async (req, res) => {
    const localReviews = await getYelpData(lat, lng);

    res.json(localReviews);
});

app.get('*', (req, res) => res.send('404!'));

module.exports = { app };
