const configer = require('../../helper/configer');
const chai = require('chai');

const request = require('supertest');
const app = require('../../app.js');
let should = chai.should();
let expect = chai.expect;

const mTask = require('../../models/task');
const MongoClient = require('mongodb').MongoClient;

describe('/test', () => {

    let collection;

    before('Setup MongoDB', async () => {
        if (configer.get('NODE_ENV') === 'production') {
            throw new Error('Refuse to execute tests under production environment.');
        }
        let db = await MongoClient.connect(configer.get('MONGO_URI'));
        collection = await db.db(configer.get('DB_NAME')).collection('task');
        await collection.createIndex('id', {'unique': true, 'background': true});
    });

    beforeEach(async () => {
        await collection.deleteMany({});
    });

    after(async () => {
        await collection.deleteMany({});
    });


    describe('Frontend format to Backend format convert', () => {
        it('ATK', done => {
            const fe = {
                id: 'feid_1122',
                name: 'test_task',
                type: 'attack',
                lng: 121,
                lat: 31,
                startTime: 12,
                endTime: 42
            };
            const be_expect = {
                id: 'feid_1122',
                name: 'test_task',
                type: 'attack',
                target: {
                    type: 'Point',
                    coordinates: [121, 31]
                },
                startTime: 12,
                endTime: 42
            };
            const be_actual = mTask.toBEF(fe);

            expect(be_actual).to.deep.eql(be_expect);
            done();

        });
        it('CRS', done => {
            const fe = {
                id: 'feid_1122',
                name: 'test_task',
                type: 'cruise',
                points: [[110, 30], [121, 31], [115, 30.5]],
                nLoop: 3,
                startTime: 12,
                endTime: 42
            };
            const be_expect = {
                id: 'feid_1122',
                name: 'test_task',
                type: 'cruise',
                'target': {
                    'type': 'MultiPoint',
                    'coordinates': [[110, 30], [121, 31], [115, 30.5]]
                },
                nLoop: 3,
                startTime: 12,
                endTime: 42
            };
            const be_actual = mTask.toBEF(fe);

            expect(be_actual).to.deep.eql(be_expect);
            done();

        });
    });

    describe('Backend format to Frontend format convert', () => {
        it('ATK', done => {
            const be = {
                id: 'feid_1122',
                name: 'test_task',
                type: 'attack',
                target: {
                    type: 'Point',
                    coordinates: [121, 31]
                },
                startTime: 12,
                endTime: 42
            };
            const fe_expect = {
                id: 'feid_1122',
                name: 'test_task',
                type: 'attack',
                lng: 121,
                lat: 31,
                startTime: 12,
                endTime: 42
            };
            const fe_actual = mTask.toFEF(be);
            expect(fe_actual).to.deep.eql(fe_expect);
            done();
        });
        it('CRS', done => {
            const be = {
                id: 'feid_1122',
                name: 'test_task',
                type: 'cruise',
                'target': {
                    'type': 'MultiPoint',
                    'coordinates': [[110, 30], [121, 31], [115, 30.5]]
                },
                nLoop: 3,
                startTime: 12,
                endTime: 42
            };
            const fe_expect = {
                id: 'feid_1122',
                name: 'test_task',
                type: 'cruise',
                points: [[110, 30], [121, 31], [115, 30.5]],
                nLoop: 3,
                startTime: 12,
                endTime: 42
            };
            const fe_actual = mTask.toFEF(be);
            expect(fe_actual).to.deep.eql(fe_expect);
            done();
        });
    });
});
