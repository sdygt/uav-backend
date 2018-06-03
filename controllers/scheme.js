const express = require('express');
const app = express();

const mScheme = require('../models/scheme');

app.get('/', (req, res, next) => {
    mScheme.getAll(req.query.type)
        .then(data => {
            res.status(200).json(data).end();
        })
        .catch(err => next(err));
});

app.get('/:id', (req, res, next) => {
    mScheme.getOne(req.params.id)
        .then(data => {
            if (data) {
                res.status(200).json(data).end();
            } else {
                res.status(404).end();
            }
        })
        .catch(err => next(err));
});

app.post('/', (req, res, next) => {
    if (Array.isArray(req.body)) {
        //Batch insert
        const _purge = req.get('X-Purge-Task') === 'true';
        mScheme.addMany(req.body, _purge)
            .then(r => {
                res.status(201).json(r).end();
            })
            .catch(e => next(e));
    } else {
        //Single insert
        mScheme.addOne(req.body)
            .then(() => res.status(201).end())
            .catch(e => next(e));
    }
});

app.delete('/:id', (req, res, next) => {
    const arrID = req.params.id.split(',').filter(str => str !== '');
    mScheme.remove(arrID)
        .then(deletedCount => {
            res.status(200).json({'deletedCount': deletedCount}).end();
        })
        .catch(e => next(e));
});

app.get('/:id/assignment', (req, res, next) => {
    const lineArrs = [
        [
            [100.841307, 38.307113],
            [109.015135, 39.94337],
            [105.938963, 31.690708]
        ],
        [
            [99.786619, 31.765464],
            [93.634275, 30.93985]
        ],
        [
            [94.776854, 36.633093],
            [94.601072, 39.537873],
            [103.917479, 40.613887]
        ]
    ];
    const ret = {
        'data': lineArrs
    };
    res.json(ret).status(200).end();
});

app.get('/:id/route', (req, res, next) => {
    const ret = {
        'data': [
            [
                [99.786619, 31.765464],
                [93.634275, 30.93985]
            ],
            [
                [94.776854, 36.633093],
                [94.601072, 39.537873],
                [103.917479, 40.613887]
            ],
            [
                [100.841307, 38.3071130],
                [109.015135, 39.943370],

                [109.075559, 36.352124],
                [109.103025, 36.015164],
                [108.971189, 35.480180],
                [108.767942, 35.072092],
                [108.438352, 34.652916],

                [105.938963, 31.690708]
            ]
        ]
    };
    res.json(ret).status(200).end();
});

module.exports = app;




