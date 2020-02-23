// Load environment variables from .env
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');

// Application Setup
// make an express app (express is middleware that allows us to read incoming data)
const app = express();
// "require" will parse JSON
const request = require('superagent');
// enable cors
app.use(cors());

// API Routes
app.get('/', (req, res) => res.send('Hello World!'));

let lat;
let lng;

app.get('/location', async(req, res) => {
    // use express built-in query object to get location from query params
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

const getWeatherData = async(lat, lng) => {
    // store URL, passing in API key and latitude and longitude 
    const URL = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${lat},${lng}`;
    // get data using URL
    const weather = await request.get(URL);
    // map over weather data
    return weather.body.daily.data.map(forecast => {
        // for each forecast, return date and summary
        return {
            forecast: forecast.summary,
            time: new Date(forecast.time * 1000)
        };
    });
};

app.get('/weather', async(req, res, next) => {
    try {
        const localWeather = await getWeatherData(lat, lng);

        res.json(localWeather);
    } catch (err) {
        next(err);
    }
});


const getYelpData = async(lat, lng) => {
    const URL = `https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${lat}&longitude=${lng}`;
    const yelp = await request.get(URL).set('Authorization', `Bearer ${process.env.YELP_API_KEY}`);

    return yelp.body.businesses.map(business => {
        return {
            name: business.alias,
            image: business.image_url,
            rating: business.rating,
            price: business.price,
            url: business.url
        };
    });
};


app.get('/yelp', async(req, res, next) => {
    try {
        const localReviews = await getYelpData(lat, lng);

        res.json(localReviews);
    } catch (err) {
        next(err);
    }
});

const getTrails = async(lat, lng) => {
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

app.get('/trails', async(req, res, next) => {
    try {
        const localTrails = await getTrails(lat, lng);
        res.json(localTrails);
    } catch (err) {
        next(err);
    }
});

const getEvents = async(lat, lng) => {
    const URL = `http://api.eventful.com/json/events/search?app_key=${process.env.EVENTS_API_KEY}
    &where=${lat},${lng}&within=25&page_size=20&page_number=1`;
    const eventsData = await request.get(URL);
    const events = JSON.parse(eventsData.text);
    return events.events.event.map(event => {
        return {
            name: event.title,
            link: event.url,
            event_date: event.start_time.slice(0, 10),
            summary: event.description === null ? 'No description' : event.description
        };
    });
};

app.get('/events', async(req, res, next) => {
    try {
        const localEvents = await getEvents(lat, lng);
        res.json(localEvents);
    } catch (err) {
        next(err);
    }
});

app.get('*', (req, res) => res.send('404!'));

module.exports = { app };
