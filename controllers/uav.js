const express = require('express');
const app = express();

const mUAV = require('../models/uav');

app.get('/', function (req, res) {
    mUAV.getAll()
        .then(data => {
            res.status(200).json(data).end();
        })
        .catch(err => {
            res.status(500).end(err.message);
        });
});

app.get('/:id', (req, res) => {
    mUAV.getOne(req.params.id)
        .then(data => {
            if (data) {
                res.status(200).json(data).end();
            } else {
                res.status(404).end();
            }
        })
        .catch(err => {
            console.warn(err.stack);
            res.status(500).end(err.message);
        });
});

app.post('/', (req, res) => {
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

app.put('/:id', (req, res) => {
    if (!req.body.text) {
        res.status(400).end('Field `text` not set');
        return;
    }
    mUAV.update(req.params.id, req.body.text)
        .then(r => {
            if (r.modifiedCount === 1) {
                res.status(200).end();
            } else {
                res.status(404).end();
            }
        })
        .catch(err => {
            console.warn(err.stack);
            res.status(500).end(err.message);
        });
});

app.delete('/:id', (req, res) => {
    mUAV.remove(req.params.id)
        .then(r => {
            res.status(204).end();
        })
        .catch(err => {
            console.warn(err.stack);
            res.status(500).end(err.message);
        });
});


module.exports = app;
