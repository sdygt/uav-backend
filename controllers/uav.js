const express = require('express');
const app = express();

const mUAV = require('../models/uav');

app.get('/', function (req, res, next) {
    mUAV.getAll()
        .then(data => {
            res.status(200).json(data).end();
        })
        .catch(err => {
            next(err);
        });
});

app.get('/:id', (req, res, next) => {
    mUAV.getOne(req.params.id)
        .then(data => {
            if (data) {
                res.status(200).json(data).end();
            } else {
                res.status(404).end();
            }
        })
        .catch(err => {
            next(err);
        });
});

app.post('/', (req, res, next) => {
    let iUAV = mUAV.getNewInstance(req.body);

    mUAV.add(iUAV)
        .then((oid) => {
            res.status(201).location(`${req.baseUrl}/${oid.toHexString()}`).end();
        })
        .catch(err => {
            next(err);
        });
});

app.put('/:id', (req, res, next) => {
    let iUAV = mUAV.getNewInstance(req.body);

    mUAV.update(req.params.id, iUAV)
        .then(r => {
            console.warn(r);
            if (r === null) {
                res.status(404).end(); //对应不是有效ObjectID的情况
            } else if (r.matchedCount === 0) {
                res.status(404).end(); //对应DB里找不到的情况
            } else {
                res.status(200).end();
            }
        })
        .catch(err => {
            next(err);
        });
});

app.delete('/:id', (req, res, next) => {

    mUAV.remove(req.params.id)
        .then(r => {
            res.status(204).end(); //DELETE 是幂等操作，输入非法或不存在oid同样返回204
        })
        .catch(e => {
            next(e); //但是有问题还是报错
        });
});


module.exports = app;
