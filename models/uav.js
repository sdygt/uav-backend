const config = require('config');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

module.exports = {
    getNewInstance: ({name = 'Untitled', lon, lat, max_speed = -1, max_distance = -1, assoc_tasks = []}) => {
        return {
            'name': name,
            'position': {
                'type': 'Point',
                'coordinates': [lon, lat]
            },
            'max_speed': max_speed,
            'max_distance': max_distance,
            'assoc_tasks': assoc_tasks
        };
    },

    add: async (iUAV) => {
        const client = await MongoClient.connect(config.get('MONGO_URI'));
        const collection = client.db('uav-backend').collection('uav');
        return new Promise((resolve, reject) => {
            collection.insertOne(iUAV)
                .then(r => resolve(r.insertedId))
                .catch(err => {
                    console.warn(err.stack);
                    reject(err);
                });
        });
    },

    getOne: async (id) => {
        let client = await MongoClient.connect(config.get('MONGO_URI'));

        const collection = client.db('uav-backend').collection('uav');
        return new Promise((resolve, reject) => {
            collection.findOne({'_id': new ObjectID(id)}, {}, (err, data) => {
                err ? reject(err) : resolve(data);
            });
        });
    },

    getAll: async () => {
        let client = await MongoClient.connect(config.get('MONGO_URI'));
        const collection = client.db('uav-backend').collection('uav');
        return new Promise((resolve, reject) => {
            collection.find({}, {}).toArray((err, docs) => {
                err ? reject(err) : resolve(docs);
            });
        });
    },

    update: async (id, text) => {
        let client = await MongoClient.connect(config.get('MONGO_URI'));
        const collection = client.db('uav-backend').collection('uav');
        return new Promise((resolve, reject) => {
            collection.updateOne(
                {'_id': new ObjectID(id)},
                {$set: {'text': text}},
                (err, r) => {
                    err ? reject(err) : resolve(r);
                });
        });
    },

    remove: async (id) => {
        let client = await MongoClient.connect(config.get('MONGO_URI'));
        const collection = client.db('uav-backend').collection('uav');
        return new Promise((resolve, reject) => {
            collection.deleteOne({'_id': new ObjectID(id)}, (err, r) => {
                err ? reject(err) : resolve(r);
            });
        });
    }
};
