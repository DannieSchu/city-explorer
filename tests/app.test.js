const { app } = require('../app.js');
const request = require('supertest');

describe('/GET /location', () => {
    test('Test location API response',
        async (done) => {
            // feed express app to the supertest request and get location route
            const response = await request(app)
                .get('/location?search=portland');
            // check that response is expected
            expect(response.body).toEqual({
                formatted_query: 'Portland, Multnomah County, Oregon, USA',
                latitude: '45.5202471',
                longitude: '-122.6741949'
            });
            expect(response.statusCode).toBe(200);
            done();
        });
    test('Test /weather response',
        async (done) => {
            const response = await request(app)
                .get('/weather');
            expect(response.body[0]).toEqual({
                forecast: expect.any(String),
                time: expect.any(String)
            });
            expect(response.statusCode).toBe(200);
            done();
        });

    test('Test /trails response',
        async (done) => {
            const response = await request(app)
                .get('/trails');
            expect(response.body[0]).toEqual({
                name: expect.any(String),
                location: expect.any(String),
                length: expect.any(Number),
                stars: expect.any(Number),
                star_votes: expect.any(Number),
                summary: expect.any(String),
                trail_url: expect.any(String),
                conditions: expect.any(String),
                condition_date: expect.any(String),
                condition_time: expect.any(String)
            });
            expect(response.statusCode).toBe(200);
            done();
        });

    test('Test /yelp response',
        async (done) => {
            const response = await request(app)
                .get('/yelp');
            expect(response.body[0]).toEqual({
                name: expect.any(String),
                image: expect.any(String),
                rating: expect.any(Number),
                price: expect.any(String),
                url: expect.any(String)
            });
            expect(response.statusCode).toBe(200);
            done();
        });

    test('Test /events response',
        async (done) => {
            const response = await request(app)
                .get('/events');
            expect(response.body[0]).toEqual({
                name: expect.any(String),
                link: expect.any(String),
                event_date: expect.any(String),
                summary: expect.any(String)
            });
            expect(response.statusCode).toBe(200);
            done();
        });

});