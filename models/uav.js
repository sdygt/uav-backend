const config = require('config');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const configer = require('../helper/configer');

module.exports = {
    getNewInstance: (
        {
            name = '未命名飞行器', id, lng, lat,
            max_speed = -1, max_distance = -1,
            capacity = ['A', 'R', 'C']
        }
    ) => {
        return {
            'name': name,
            'id': id,
            'position': {
                'type': 'Point',
                'coordinates': [lng, lat]
            },
            'max_speed': max_speed,
            'max_distance': max_distance,
            'capacity': capacity
        };
    },

    addOne: async (iUAV) => {
        const client = await MongoClient.connect(configer.get('MONGO_URI'));
        const collection = client.db('uav-backend').collection('uav');
        return new Promise((resolve, reject) => {
            collection.insertOne(iUAV)
                .then(r => resolve(r.insertedId))
                .catch(err => {
                    reject(err);
                });
        });
    },

    addMany: async (arrUAV, purge) => {
        const client = await MongoClient.connect(configer.get('MONGO_URI'));
        const collection = client.db('uav-backend').collection('uav');
        if (purge) {
            collection.deleteMany({});
        }
        return new Promise((resolve, reject) => {
            collection.insertMany(arrUAV, (err, r) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({insertedCount: r.insertedCount});
                }
            });
        });
    },

    getOne: async (id) => {
        const client = await MongoClient.connect(configer.get('MONGO_URI'));
        const collection = client.db('uav-backend').collection('uav');
        return new Promise((resolve, reject) => {
            collection.findOne({'id': id}, {}, (err, data) => {
                err ? reject(err) : resolve(data);
            });
        });
    },

    getAll: async () => {
        let client = await MongoClient.connect(configer.get('MONGO_URI'));
        const collection = client.db('uav-backend').collection('uav');
        return new Promise((resolve, reject) => {
            collection.find({}, {}).toArray((err, docs) => {
                err ? reject(err) : resolve(docs);
            });
        });
    },

    update: async (id, iUAV) => {
        let client = await MongoClient.connect(configer.get('MONGO_URI'));
        const collection = client.db('uav-backend').collection('uav');
        return new Promise((resolve, reject) => {
            collection.updateOne(
                {'id': id},
                {$set: iUAV},
                (err, r) => {
                    err ? reject(err) : resolve(r);
                });
        });
    },

    remove: async (arrID) => {
        let client = await MongoClient.connect(configer.get('MONGO_URI'));
        const collection = client.db('uav-backend').collection('uav');
        return new Promise((resolve, reject) => {
            try {
                let arrCountP = arrID.map(async id => {
                    let r = await collection.deleteOne({'id': id});
                    return r.deletedCount;
                });
                Promise.all(arrCountP).then(value => {
                    let deletedCount = value.reduce((a, b) => a + b);
                    resolve(deletedCount);
                });
            } catch (e) {
                reject(e);
            }
        });
    }
};
