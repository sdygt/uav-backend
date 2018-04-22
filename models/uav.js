const config = require('config');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

module.exports = {


    getNewInstance: ({name = '未命名飞行器', lon, lat, max_speed = -1, max_distance = -1, assoc_tasks = []}) => {
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
                    reject(err);
                });
        });
    },

    getOne: async (id) => {


        let client = await MongoClient.connect(config.get('MONGO_URI'));

        const collection = client.db('uav-backend').collection('uav');
        return new Promise((resolve, reject) => {
            let _oid;
            try {
                _oid = new ObjectID(id);
            } catch (e) {
                resolve(null);
            }

            collection.findOne({'_id': _oid}, {}, (err, data) => {
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

    update: async (id, iUAV) => {
        let client = await MongoClient.connect(config.get('MONGO_URI'));
        const collection = client.db('uav-backend').collection('uav');
        return new Promise((resolve, reject) => {
            let _oid;
            try {
                _oid = new ObjectID(id);
            } catch (e) {
                resolve(null);
            }

            collection.updateOne(
                {'_id': _oid},
                {$set: iUAV},
                (err, r) => {
                    err ? reject(err) : resolve(r);
                });
        });
    },

    remove: async (id) => {
        let client = await MongoClient.connect(config.get('MONGO_URI'));
        const collection = client.db('uav-backend').collection('uav');
        return new Promise((resolve, reject) => {

            let _oid;
            try {
                _oid = new ObjectID(id);
            } catch (e) {
                resolve(null);
            }

            collection.deleteOne({'_id': _oid}, (err, r) => {
                err ? reject(err) : resolve(r);
            });
        });
    }
};
