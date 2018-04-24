const express = require('express');
const app = express();

const mUAV = require('../models/uav');
const BulkWriteError = require('mongodb/lib/bulk/common').BulkWriteError;

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
    if (Array.isArray(req.body)) {
        // 传入了数组，一次插入一堆
        let arrUAV = [];
        req.body.map(uav => {
            if (typeof uav.id === 'undefined') {
                let err = new Error('Field `id` not set');
                err.status = 400;
                next(err);
            }
            arrUAV.push(mUAV.getNewInstance(uav));
        });

        const _purge = req.get('X-Purge-UAV') === 'true';

        mUAV.addMany(arrUAV, _purge)
            .then(r => {
                res.status(201).json(r).end();
            })
            .catch(e => {
                let err = new Error(e.message);
                if (e instanceof BulkWriteError) {
                    // `id` 键冲突的情况
                    err.status = 400;
                }
                next(err);
            });

    } else {
        let iUAV = mUAV.getNewInstance(req.body);

        mUAV.addOne(iUAV)
            .then(() => {
                res.status(201).end();
            })
            .catch(err => next(err));
    }

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
