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

app.get('/location', async (req, res) => {
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
});

const getWeatherData = async (lat, lng) => {
    const URL = `https://api.darksky.net/forecast/ea00a4754ac9af00b3d8fa931923f3ec/${lat},${lng}?key=${process.env.DARKSKY_API_KEY}`;

    const weather = await request.get(URL);

    return weather.daily.data.map(forecast => {
        return {
            forecast: forecast.summary,
            time: new Date(forecast.time * 1000)
        };
    });
};

app.get('/weather', async (req, res, next) => {
    try {
        const localWeather = await getWeatherData(lat, lng);

        res.json(localWeather);
    } catch (err) {
        next(err);
    }
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


app.get('/yelp', async (req, res, next) => {
    try {
        const localReviews = await getYelpData(lat, lng);

        res.json(localReviews);
    } catch (err) {
        next(err);
    }
});

const getTrails = async (lat, lng) => {
    const URL = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lng}&maxDistance=10&key=${process.env.TRAILS_API_KEY}`;
    const trailsData = await request.get(URL);
    return trailsData.body.trails.map(trail => {
        return {
            name: trail.name,
            location: trail.location,
            length: trail.length,
            stars: trail.stars,
            star_votes: trail.starVotes,
            summary: trail.summary,
            trail_url: trail.url,
            conditions: trail.conditionDetails === null ? 'Conditions unknown' : trail.conditionDetails,
            condition_date: trail.conditionDate.slice(0, 10),
            condition_time: trail.conditionDate.slice(12)
        };
    });
};

app.get('/trails', async (req, res, next) => {
    try {
        const localTrails = await getTrails(lat, lng);
        res.json(localTrails);
    } catch (err) {
        next(err);
    }
});

const getEvents = async (lat, lng) => {
    const URL = `http://api.eventful.com/json/events/search?app_key=${process.env.EVENTS_API_KEY}
    &where=${lat},${lng}&within=25&page_size=20&page_number=1`;
    const eventsData = await request.get(URL);
    const events = JSON.parse(eventsData.text);
    return events.events.event.map(event => {
        return {
            link: event.url,
            name: event.title,
            event_date: event.start_time,
            summary: event.description === null ? 'No description' : event.description
        };
    });
};

app.get('/events', async (req, res, next) => {
    try {
        const localEvents = await getEvents(lat, lng);
        res.json(localEvents);
    } catch (err) {
        next(err);
    }
});

app.get('*', (req, res) => res.send('404!'));

module.exports = { app };
