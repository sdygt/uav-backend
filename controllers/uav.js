const express = require('express');
const app = express();

const mUAV = require('../models/uav');

app.get('/', function (req, res, next) {
    next(new Error('Not yet implemented\nGET /uav'));
});

app.get('/:id', (req, res, next) => {
    next(new Error('Not yet implemented\nGET /uav/:id'));
});

app.post('/', (req, res, next) => {
    let iUAV = mUAV.getNewInstance(req.body);

    mUAV.add(iUAV)
        .then((oid) => {
            res.status(201).location(`${req.baseUrl}/${oid.toHexString()}`).end();
        })
        .catch(err => {
            console.warn(err.stack);
            res.status(500).end(err.message);
        });
});

app.put('/:id', (req, res, next) => {
    next(new Error('Not yet implemented\nPUT /uav/:id'));
});

app.delete('/:id', (req, res, next) => {
    next(new Error('Not yet implemented\nDELETE /uav/:id'));
});


module.exports = app;
