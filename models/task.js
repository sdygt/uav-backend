const MongoClient = require('mongodb').MongoClient;
const configer = require('../helper/configer');
const expect = require('chai').expect;

let collection;
(async () => {
    let client = await MongoClient.connect(configer.get('MONGO_URI'));
    collection = client.db('uav-backend').collection('task');
})();

module.exports = {
    toBEF: (feTask) => {
        // May throw `AssertionError`
        expect(feTask).to.have.property('type');
        expect(feTask).to.have.property('id');
        expect(feTask.type).to.be.oneOf(['attack', 'research', 'cruise']);
        if (feTask.type === 'cruise') {
            expect(feTask.points).to.be.an('array');
        } else {
            expect(feTask).to.have.property('lng');
            expect(feTask).to.have.property('lat');
        }

        switch (feTask.type) {
        case 'cruise':
            return {
                'id': feTask.id,
                'name': feTask.name || '未命名任务',
                'type': 'cruise',
                'target': {
                    'type': 'MultiPoint',
                    'coordinates': feTask.points
                },
                'nLoop': feTask.nLoop, //巡航圈数
                'startTime': feTask.startTime || 0,
                'endTime': feTask.endTime || 0
            };
        case 'research':
        case 'attack':
            return {
                id: feTask.id,
                name: feTask.name || '未命名任务',
                type: feTask.type,
                target: {
                    type: 'Point',
                    coordinates: [feTask.lng, feTask.lat]
                },
                startTime: feTask.startTime || 0,
                endTime: feTask.endTime || 0
            };
        }
    },

    toFEF: (beTask) => {
        switch (beTask.type) {
        case 'attack':
        case 'research':
            return {
                id: beTask.id,
                name: beTask.name,
                type: beTask.type,
                lng: beTask.target.coordinates[0],
                lat: beTask.target.coordinates[1],
                startTime: beTask.startTime,
                endTime: beTask.endTime
            };
        case 'cruise':
            return {
                id: beTask.id,
                name: beTask.name,
                type: beTask.type,
                points: beTask.target.coordinates,
                nLoop: beTask.nLoop,
                startTime: beTask.startTime,
                endTime: beTask.endTime
            };
        }
    },

    getAll: async (type) => {
        let filter;
        if (typeof type === 'undefined') {
            filter = {};
        } else {
            filter = {type: type};
        }

        return collection.find(filter, {}).toArray();
    },

    getOne: async (id) => {
        return collection.findOne({'id': id}, {});
    },

    addOne: async (beTask) => {
        return collection.updateOne({id: beTask.id}, {$set: beTask}, {upsert: true});
    },

    addMany: async (abeTask, purge) => {
        const bulk = collection.initializeOrderedBulkOp();

        if (purge) {
            bulk.find({}).remove({});
        }
        abeTask.forEach(beTask => {
            return bulk.find({id: beTask.id}).upsert().updateOne({$set: beTask});
        });
        return bulk.execute();
    }

};
