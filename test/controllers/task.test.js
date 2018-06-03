const configer = require('../../helper/configer');
const chai = require('chai');

const request = require('supertest');
const app = require('../../app.js');
let should = chai.should();
let expect = chai.expect;

const mTask = require('../../models/task');
const MongoClient = require('mongodb').MongoClient;

describe('/task', () => {

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
                target: {
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

    describe('Get...', () => {
        const docs = [
            {
                'id': 'tid_1111',
                'name': 'Task name',
                'type': 'attack',
                'target': {
                    'type': 'Point',
                    'coordinates': [121.5, 31.3]
                },
                'startTime': 42,
                'endTime': 404
            }, {
                'id': 'tid_222',
                'name': 'research',
                'type': 'research',
                'target': {
                    'type': 'Point',
                    'coordinates': [121, 31]
                },
                'startTime': 66,
                'endTime': 233
            }, {
                'id': 'tid_333',
                'name': 'CRS',
                'type': 'cruise',
                'target': {
                    'type': 'MultiPoint',
                    'coordinates': [
                        [-73.9580, 40.8003],
                        [-73.9498, 40.7968],
                        [-73.9737, 40.7648],
                        [-73.9814, 40.7681]
                    ]
                },
                'nLoop': 3, //巡航圈数
                'startTime': 1,
                'endTime': 20
            }];
        it('all tasks', (done) => {
            collection.insertMany(docs)
                .then(() => {
                    request(app)
                        .get('/task')
                        .expect(200)
                        .end((err, res) => {
                            should.not.exist(err);
                            expect(res.body).to.have.lengthOf(3);
                            done();
                        });
                });
        });

        it('tasks of ATK type', done => {
            collection.insertMany(docs)
                .then(() => {
                    request(app)
                        .get('/task')
                        .query({type: 'attack'})
                        .expect(200)
                        .end((err, res) => {
                            should.not.exist(err);
                            const task_atk = {
                                'id': 'tid_1111',
                                'name': 'Task name',
                                'type': 'attack',
                                'lng': 121.5,
                                'lat': 31.3,
                                'startTime': 42,
                                'endTime': 404
                            };
                            expect(res.body).to.deep.include(task_atk);
                            expect(res.body).to.have.lengthOf(1);
                            done();
                        });
                });
        });

        it('tasks of CRS type', done => {
            collection.insertMany(docs)
                .then(() => {
                    request(app)
                        .get('/task')
                        .query({type: 'cruise'})
                        .expect(200)
                        .end((err, res) => {
                            should.not.exist(err);
                            const task_crs = {
                                'id': 'tid_333',
                                'name': 'CRS',
                                'type': 'cruise',
                                'points': [
                                    [-73.9580, 40.8003],
                                    [-73.9498, 40.7968],
                                    [-73.9737, 40.7648],
                                    [-73.9814, 40.7681]
                                ]
                                ,
                                'nLoop': 3,
                                'startTime': 1,
                                'endTime': 20
                            };
                            expect(res.body).to.deep.include(task_crs);
                            expect(res.body).to.have.lengthOf(1);
                            done();
                        });
                });
        });

        it('one task', done => {
            collection.insertMany(docs)
                .then(() => {
                    request(app)
                        .get('/task/tid_333')
                        .expect(200)
                        .end((err, res) => {
                            const task_crs = {
                                'id': 'tid_333',
                                'name': 'CRS',
                                'type': 'cruise',
                                'points': [
                                    [-73.9580, 40.8003],
                                    [-73.9498, 40.7968],
                                    [-73.9737, 40.7648],
                                    [-73.9814, 40.7681]
                                ]
                                ,
                                'nLoop': 3,
                                'startTime': 1,
                                'endTime': 20
                            };
                            should.not.exist(err);
                            expect(res.body).to.deep.eql(task_crs);
                            done();
                        });
                });

        });
    });

    describe('Add...', () => {
        it('an attack task', done => {
            const fe_atk = {
                id: 'feid_1122',
                name: 'test_atk_task',
                type: 'attack',
                lng: 121,
                lat: 31,
                startTime: 12,
                endTime: 42
            };
            const be_atk_exp = {
                id: 'feid_1122',
                name: 'test_atk_task',
                type: 'attack',
                target: {
                    type: 'Point',
                    coordinates: [121, 31]
                },
                startTime: 12,
                endTime: 42
            };
            request(app)
                .post('/task')
                .type('json')
                .send(fe_atk)
                .expect(201)
                .end((err, res) => {
                    should.not.exist(err);
                    collection.findOne({'id': 'feid_1122'}, {}, (error, data) => {
                        should.not.exist(error);
                        expect(data).to.deep.include(be_atk_exp);
                        done();
                    });
                });

        });
        it('a cruise task', done => {
            const fe_crs = {
                id: 'feid_1122',
                name: 'test_crs_task',
                type: 'cruise',
                points: [[110, 30], [121, 31], [115, 30.5]],
                nLoop: 3,
                startTime: 12,
                endTime: 42
            };
            const be_crs_exp = {
                id: 'feid_1122',
                name: 'test_crs_task',
                type: 'cruise',
                target: {
                    'type': 'MultiPoint',
                    'coordinates': [[110, 30], [121, 31], [115, 30.5]]
                },
                nLoop: 3,
                startTime: 12,
                endTime: 42
            };
            request(app)
                .post('/task')
                .type('json')
                .send(fe_crs)
                .expect(201)
                .end((err, res) => {
                    should.not.exist(err);
                    collection.findOne({'id': 'feid_1122'}, {}, (error, data) => {
                        should.not.exist(error);
                        expect(data).to.deep.include(be_crs_exp);
                        done();
                    });
                });

        });

        describe('various types of tasks...', () => {
            it('without purge', done => {
                const fe_docs = [{
                    'id': 'tid_1111',
                    'name': 'Task name',
                    'type': 'attack',
                    'lng': 121.5,
                    'lat': 31.3,
                    'startTime': 42,
                    'endTime': 404
                }, {
                    'id': 'tid_222',
                    'name': 'research',
                    'type': 'research',
                    'lng': 121,
                    'lat': 31,
                    'startTime': 66,
                    'endTime': 233
                }, {
                    'id': 'tid_333',
                    'name': 'CRS',
                    'type': 'cruise',
                    'points': [
                        [-73.9580, 40.8003],
                        [-73.9498, 40.7968],
                        [-73.9737, 40.7648],
                        [-73.9814, 40.7681]
                    ],
                    'nLoop': 3,
                    'startTime': 1,
                    'endTime': 20
                }];
                request(app)
                    .post('/task')
                    .type('json')
                    .send(fe_docs)
                    .expect(201)
                    .end((err, res) => {
                        should.not.exist(err);
                        collection.count({}, (e, count) => {
                            expect(count).to.eql(3);
                            done();
                        });
                    });

            });
            it('with purge', async () => {
                const be_docs = [
                    {
                        'id': 'tid_1111', 'name': 'Task name', 'type': 'attack',
                        'target': {
                            'type': 'Point',
                            'coordinates': [121.5, 31.3]
                        },
                        'startTime': 42, 'endTime': 404
                    }, {
                        'id': 'tid_222', 'name': 'research', 'type': 'research',
                        'target': {
                            'type': 'Point',
                            'coordinates': [121, 31]
                        },
                        'startTime': 66, 'endTime': 233
                    }, {
                        'id': 'tid_333', 'name': 'CRS', 'type': 'cruise',
                        'target': {
                            'type': 'MultiPoint',
                            'coordinates': [
                                [-73.9580, 40.8003], [-73.9498, 40.7968],
                                [-73.9737, 40.7648], [-73.9814, 40.7681]
                            ]
                        },
                        'nLoop': 3, 'startTime': 1, 'endTime': 20
                    }];
                const fe_docs = [
                    {
                        'id': 'tid_1111',
                        'name': 'Task name', 'type': 'attack',
                        'lng': 121.5, 'lat': 31.3,
                        'startTime': 42, 'endTime': 404
                    }, {
                        'id': 'tid_222',
                        'name': 'research', 'type': 'research',
                        'lng': 121, 'lat': 31,
                        'startTime': 66, 'endTime': 233
                    }, {
                        'id': 'tid_333',
                        'name': 'CRS', 'type': 'cruise',
                        'points': [
                            [-73.9580, 40.8003],
                            [-73.9498, 40.7968],
                            [-73.9737, 40.7648],
                            [-73.9814, 40.7681]
                        ],
                        'nLoop': 3,
                        'startTime': 1, 'endTime': 20
                    }];
                await collection.insertMany(be_docs)
                    .then(() => {
                        request(app)
                            .post('/task')
                            .type('json')
                            .set('X-Purge-Task', false)
                            .send(fe_docs)
                            .expect(201)
                            .end((err, res) => {
                                should.not.exist(err);
                            });
                    })
                    .then(() => {
                        request(app)
                            .post('/task')
                            .type('json')
                            .set('X-Purge-Task', true)
                            .send(fe_docs)
                            .expect(201)
                            .end((err, res) => {
                                should.not.exist(err);
                            });
                    })
                    .then(async () => {
                        let c = await collection.count({});
                        expect(c).to.eql(3);
                    });


            });
        });

    });

    describe.skip('Delete...', () => {
        it('tasks', (done) => {
            const be_docs = [
                {
                    'id': 'tid_1234', 'name': 'Task name', 'type': 'attack',
                    'target': {
                        'type': 'Point',
                        'coordinates': [121.5, 31.3]
                    },
                    'startTime': 42, 'endTime': 404
                }, {
                    'id': 'tid_2223', 'name': 'research', 'type': 'research',
                    'target': {
                        'type': 'Point',
                        'coordinates': [121, 31]
                    },
                    'startTime': 66, 'endTime': 233
                }, {
                    'id': 'tid_3333', 'name': 'CRS', 'type': 'cruise',
                    'target': {
                        'type': 'MultiPoint',
                        'coordinates': [
                            [-73.9580, 40.8003], [-73.9498, 40.7968],
                            [-73.9737, 40.7648], [-73.9814, 40.7681]
                        ]
                    },
                    'nLoop': 3, 'startTime': 1, 'endTime': 20
                }];
            collection.insertMany(be_docs, (err, r) => {
                console.warn(err);
                should.not.exist(err);
                request(app)
                    .delete('/task/,tid_1234,tid_3333,')
                    .expect(200)
                    .end((e, res) => {
                        should.not.exist(e);
                        expect(res.body).to.deep.eql({deletedCount: 2});
                        collection.count({}, {}, (e, c) => {
                            expect(c).to.eql(1);
                        });
                        done();
                    });
            });

        });
    });
});

