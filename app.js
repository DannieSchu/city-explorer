const express = require('express');

const app = express();

app.get('/location', (req, res) => {
    res.json({
        some: 'json'
    });
});

// use this to check that app is up and running
app.listen(3000, () => { console.log("running...")})