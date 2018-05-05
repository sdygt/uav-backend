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

        try {
            let r = collection.insertOne(iUAV);
            return r.insertedId;
        } catch (e) {
            throw e;
        }
    },

    addMany: async (arrUAV, purge) => {
        const client = await MongoClient.connect(configer.get('MONGO_URI'));
        const collection = client.db('uav-backend').collection('uav');

        try {
            if (purge) {
                await collection.deleteMany({});
            }
            let r = await collection.insertMany(arrUAV);
            return {insertedCount: r.insertedCount};
        } catch (e) {
            throw e;
        }
    },

    getOne: async (id) => {
        const client = await MongoClient.connect(configer.get('MONGO_URI'));
        const collection = client.db('uav-backend').collection('uav');
        try {
            return collection.findOne({'id': id}, {});
        } catch (e) {
            throw e;

        }
    },

    getAll: async () => {
        let client = await MongoClient.connect(configer.get('MONGO_URI'));
        const collection = client.db('uav-backend').collection('uav');
        try {
            return await collection.find({}, {}).toArray();
        } catch (e) {
            throw e;
        }
    },

    update: async (id, update) => {
        let client = await MongoClient.connect(configer.get('MONGO_URI'));
        const collection = client.db('uav-backend').collection('uav');

        let mongo_set = {};
        Object.assign(mongo_set, update);
        if (typeof update.lng !== 'undefined') {
            mongo_set['position.coordinates.0'] = update.lng;
        }
        if (typeof update.lat !== 'undefined') {
            mongo_set['position.coordinates.1'] = update.lat;
        }
        delete mongo_set.lng;
        delete mongo_set.lat;

        try {
            return collection.updateOne({'id': id}, {$set: mongo_set});
        } catch (e) {
            throw e;
        }
    },

    remove: async (arrID) => {
        let client = await MongoClient.connect(configer.get('MONGO_URI'));
        const collection = client.db('uav-backend').collection('uav');
        try {
            let arrCountP = arrID.map(async id => {
                let r = await collection.deleteOne({'id': id});
                return r.deletedCount;
            });
            let deletedCount = await Promise.all(arrCountP).then(value => {
                return value.reduce((a, b) => a + b); //deletedCount
            });
            return deletedCount;
        } catch (e) {
            throw e;
        }
    }
};
