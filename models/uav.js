const config = require('config');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const configer = require('../helper/configer');


let client, collection;
(async () => {
    client = await MongoClient.connect(configer.get('MONGO_URI'));
    collection = client.db('uav-backend').collection('uav');
})();

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
        return collection.updateOne({id: iUAV.id}, {$set: iUAV}, {upsert: true});
    },

    addMany: async (arrUAV, purge) => {
        const bulk = collection.initializeOrderedBulkOp();

        if (purge) {
            bulk.find({}).remove({});
        }
        arrUAV.forEach(uav => {
            return bulk.find({id: uav.id}).upsert().updateOne({$set: uav});
        });
        return bulk.execute();
    },

    getOne: async (id) => {
        return collection.findOne({'id': id}, {});
    },

    getAll: async () => {
        return collection.find({}, {}).toArray();
    },

    update: async (id, update) => {
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

        return collection.updateOne({'id': id}, {$set: mongo_set});
    },

    remove: async (arrID) => {
        let arrCountP = arrID.map(async id => {
            let r = await collection.deleteOne({'id': id});
            return r.deletedCount;
        });

        let deletedCount = await Promise.all(arrCountP).then(value => {
            return value.reduce((a, b) => a + b); //deletedCount
        });

        return deletedCount;

    }
};
