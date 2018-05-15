const express = require('express');
const app = express();

const mTask = require('../models/task');

app.get('/', (req, res, next) => {
    mTask.getAll(req.query.type)
        .then(data => {
            let ret = data.map(beTask => mTask.toFEF(beTask));
            res.status(200).json(ret).end();
        })
        .catch(err => next(err));
});

app.get('/:id', (req, res, next) => {
    mTask.getOne(req.params.id)
        .then(data => {
            if (data) {
                res.status(200).json(mTask.toFEF(data)).end();
            } else {
                res.status(404).end();
            }
        })
        .catch(err => next(err));
});

app.post('/', (req, res, next) => {
    if (Array.isArray(req.body)) {
        //Batch insert
        const abeTask = req.body.map(feTask => mTask.toBEF(feTask));
        const _purge = req.get('X-Purge-Task') === 'true';
        mTask.addMany(abeTask, _purge)
            .then(r => {
                res.status(201).json(r).end();
            })
            .catch(e => next(e));
    } else {
        //Single insert
        mTask.addOne(mTask.toBEF(req.body))
            .then(() => res.status(201).end())
            .catch(e => next(e));
    }
});


module.exports = app;
