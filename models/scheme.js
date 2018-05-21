const MongoClient = require('mongodb').MongoClient;
const configer = require('../helper/configer');

let collection;
(async () => {
    let client = await MongoClient.connect(configer.get('MONGO_URI'));
    collection = client.db('uav-backend').collection('scheme');
    await collection.createIndex('id', {'unique': true, 'background': true});
})();

module.exports = {
    getAll: async () => {
        return collection.find({}, {projection:{'_id':0}}).toArray();
    },

    getOne: async (id) => {
        return collection.findOne({'id': id}, {projection:{'_id':0}});
    },

    addMany: async (aScheme, purge) => {
        const bulk = collection.initializeOrderedBulkOp();

        if (purge) {
            bulk.find({}).remove({});
        }
        aScheme.forEach(scheme => {
            return bulk.find({id: scheme.id}).upsert().updateOne({$set: scheme});
        });
        return bulk.execute();
    },

    remove: async (arrID) => {
        let arrCountP = arrID.map(async id => {
            let r = await collection.deleteOne({'id': id});
            return r.deletedCount;
        });

        return await Promise.all(arrCountP).then(value => {
            return value.reduce((a, b) => a + b); //deletedCount
        });

    }
};
