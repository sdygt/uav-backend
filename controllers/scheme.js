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
            [116.368904, 39.913423],
            [116.382122, 39.901176]
        ],
        [
            [116.368904, 39.913423],
            [116.398258, 39.904600]
        ]
    ];
    const ret = {
        'data': lineArrs
    };
    res.json(ret).status(200).end();
});

app.get('/:id/route', (req, res, next) => {

});

module.exports = app;




