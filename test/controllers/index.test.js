import configer from '../../helper/configer';
import assert from 'assert';

const MongoClient = require('mongodb').MongoClient;

describe('A placeholder', function () {
    it('should success', function (done) {
        done();
    });
});


describe('MongoDB', () => {
    it('should works', function (done) {
        const MONGO_URI = configer.get('MONGO_URI');
        const insertDocuments = function (db, callback) {
            // Get the documents collection
            const collection = db.collection('documents');
            // Insert some documents
            collection.insertMany([
                {a: 1}, {a: 2}, {a: 3}
            ], function (err, result) {
                assert.equal(err, null);
                assert.equal(3, result.result.n);
                assert.equal(3, result.ops.length);
                console.log('Inserted 3 documents into the collection');
                callback(result);
            });
        };


        MongoClient.connect(MONGO_URI, function (err, client) {
            assert.equal(null, err);
            console.log('Connected successfully to server');

            const db = client.db('mongotest');

            insertDocuments(db, function () {
                client.close();
                done();
            });
        });

    });
});
