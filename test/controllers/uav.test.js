const configer = require('../../helper/configer');
const chai = require('chai');

const request = require('supertest');
const app = require('../../app.js');
let should = chai.should();
let expect = chai.expect;

const MongoClient = require('mongodb').MongoClient;

describe('/uav', () => {

    let collection;

    before('Setup MongoDB', async () => {
        if (configer.get('NODE_ENV') === 'production') {
            throw new Error('Refuse to execute tests under production environment.');
        }
        let db = await MongoClient.connect(configer.get('MONGO_URI'));
        collection = await db.db(configer.get('DB_NAME')).collection('uav');
        await collection.createIndex('id', {'unique': true, 'background': true});

    });

    beforeEach(async () => {
        await collection.deleteMany({});
        // We don't use drop() in order to preserve index.
    });

    after(async () => {
        await collection.deleteMany({});
    });

    describe('Add...', () => {
        it('an UAV', done => {
            const doc = {
                'id': 'feid_11223344',
                'name': 'name of UÅV',
                'lng': 121,
                'lat': 31,
                'max_speed': 300,
                'max_distance': 400,
                'capacity': ['A', 'C']
            };

            request(app)
                .post('/uav')
                .type('json')
                .send(doc)
                .expect(201)
                .end((err, res) => {
                    should.not.exist(err);
                    collection.findOne({'id': 'feid_11223344'}, {}, (error, data) => {
                        should.not.exist(error);
                        expect(data).to.include({'id': 'feid_11223344', 'max_speed': 300});
                        expect(data).to.have.deep.nested.property('position.coordinates', [121, 31]);
                        expect(data).to.have.deep.nested.property('capacity', ['A', 'C']);
                        // 这里用Mongo driver读取DB的，所以结构上还是GeoJSON的格式
                        done();
                    });
                });
        });

        describe('multiple UAVs...', () => {
            it('without purge', done => {
                const docs = [{
                    'id': 'feid_22334455', 'name': 'name of UÅV',
                    'lng': 121, 'lat': 31,
                    'max_speed': 300, 'max_distance': 400,
                    'capacity': ['A', 'C']
                }, {
                    'id': 'feid_33445566', 'name': 'name of UÅV',
                    'lng': 110, 'lat': 25,
                    'max_speed': 300, 'max_distance': 400,
                    'capacity': ['C', 'R']
                }, {
                    'id': 'feid_44556677', 'name': 'name of UÅV',
                    'lng': 100, 'lat': 20,
                    'max_speed': 300, 'max_distance': 400,
                    'capacity': ['R', 'A']
                }];
                request(app)
                    .post('/uav')
                    .type('json')
                    .set('X-Purge-UAV', false)
                    .send(docs)
                    .expect(201)
                    .end((err, res) => {
                        should.not.exist(err);
                        collection.count({}, (e, count) => {
                            expect(count).to.eql(3);
                            done();
                        });
                    });

            });

            it('with purge', done => {
                const docs1 = [{
                    'id': 'feid_22334455', 'name': 'name of UÅV',
                    'lng': 121, 'lat': 31,
                    'max_speed': 300, 'max_distance': 400,
                    'capacity': ['A', 'C']
                }, {
                    'id': 'feid_33445566', 'name': 'name of UÅV',
                    'lng': 110, 'lat': 25,
                    'max_speed': 300, 'max_distance': 400,
                    'capacity': ['C', 'R']
                }, {
                    'id': 'feid_44556677', 'name': 'name of UÅV',
                    'lng': 100, 'lat': 20,
                    'max_speed': 300, 'max_distance': 400,
                    'capacity': ['R', 'A']
                }];

                const docs2 = [{
                    'id': 'feid_22334455', 'name': 'name of UÅV',
                    'lng': 121, 'lat': 31,
                    'max_speed': 300, 'max_distance': 400,
                    'capacity': ['A', 'C']
                }, {
                    'id': 'feid_33445566', 'name': 'name of UÅV',
                    'lng': 110, 'lat': 25,
                    'max_speed': 300, 'max_distance': 400,
                    'capacity': ['C', 'R']
                }];

                request(app)
                    .post('/uav')
                    .expect(201)
                    .type('json')
                    .set('X-Purge-UAV', 'false')
                    .send(docs1)
                    .end(() => {
                        request(app)
                            .post('/uav')
                            .expect(201)
                            .type('json')
                            .set('X-Purge-UAV', 'true')
                            .send(docs2)
                            .end((err, res) => {
                                should.not.exist(err);
                                collection.count({}, (e, count) => {
                                    expect(count).to.eql(2);
                                    done();
                                });
                            });
                    });


            });
        });


        it('should not fail with duplicate id', done => {
            const docs = [{
                'id': 'feid_11223344', 'name': 'name of UÅV',
                'lng': 100, 'lat': 25,
                'max_speed': 300, 'max_distance': 400,
                'capacity': ['A', 'C']
            }, {
                'id': 'feid_22334455', 'name': 'name of UÅV',
                'lng': 121, 'lat': 31,
                'max_speed': 300, 'max_distance': 400,
                'capacity': ['A', 'C']
            }, {
                'id': 'feid_22334455', 'name': 'name of UÅV',
                'lng': 110, 'lat': 25,
                'max_speed': 300, 'max_distance': 400,
                'capacity': ['C', 'R']
            }, {
                'id': 'feid_33445566', 'name': 'name of UÅV',
                'lng': 133, 'lat': 40,
                'max_speed': 300, 'max_distance': 400,
                'capacity': ['A', 'C']
            }];

            request(app)
                .post('/uav')
                .type('json')
                .send(docs)
                .expect(201)
                .end((err)=>{
                    should.not.exist(err);
                    collection.count({}, (e, count) => {
                        expect(count).to.eql(3);
                        done();
                    });
                });
        });
    });

    describe('Get...', () => {
        it('all UAVs', (done) => {
            const docs = [
                {
                    'id': 'feid_22334455',
                    'name': '无人机的标签/名称',
                    'position': {
                        'type': 'Point',
                        'coordinates': [121, 31]
                    },
                    'max_speed': 300,
                    'max_distance': 400,
                    'capacity': ['A', 'R', 'C']
                }, {
                    'id': 'feid_33445566', 'name': 'name of UÅV',
                    'position': {
                        'type': 'Point',
                        'coordinates': [110, 30]
                    },
                    'max_speed': 300, 'max_distance': 400,
                    'capacity': ['C', 'R']
                }, {
                    'id': 'feid_44556677', 'name': 'name of UÅV',
                    'position': {
                        'type': 'Point',
                        'coordinates': [105, 25]
                    },
                    'max_speed': 300, 'max_distance': 400,
                    'capacity': ['R', 'A']
                }]; //下面使用Mongo插入，所以上面使用GeoJSON格式

            collection.insertMany(docs)
                .then(() => {
                    request(app)
                        .get('/uav')
                        .expect(200)
                        .end((err, res) => {
                            should.not.exist(err);
                            const r = JSON.parse(res.text);
                            expect(r).to.have.lengthOf(3);
                            done();
                        });
                });


        });

        it('one UAV', done => {
            const docs = [
                {
                    'id': 'feid_22334455',
                    'name': '无人机的标签/名称',
                    'position': {
                        'type': 'Point',
                        'coordinates': [121, 31]
                    },
                    'max_speed': 300,
                    'max_distance': 400,
                    'capacity': ['A', 'R', 'C']
                }, {
                    'id': 'feid_33445566', 'name': 'name of UÅV',
                    'position': {
                        'type': 'Point',
                        'coordinates': [110, 30]
                    },
                    'max_speed': 300, 'max_distance': 400,
                    'capacity': ['C', 'R']
                }, {
                    'id': 'feid_44556677', 'name': 'name of UÅV',
                    'position': {
                        'type': 'Point',
                        'coordinates': [100, 25]
                    },
                    'max_speed': 300, 'max_distance': 400,
                    'capacity': ['R', 'A']
                }];

            collection.insertMany(docs)
                .then(() => {
                    request(app)
                        .get('/uav/feid_33445566')
                        .expect(200)
                        .end((err, res) => {
                            should.not.exist(err);
                            let r = JSON.parse(res.text);
                            expect(r).to.be.a('Object');
                            expect(r).to.include({'lng': 110});
                            done();
                        });
                });
        });

        it('an non-exist UAV', done => {
            request(app)
                .get('/uav/feid_00000000')
                .expect(404)
                .end((err, _) => {
                    should.not.exist(err);
                });
            done();

        });
    });

    describe('Update...', () => {
        it('an UAV', done => {
            const orig_doc = {
                'id': 'feid_11223344',
                'name': 'name of UÅV',
                'position': {
                    'type': 'Point',
                    'coordinates': [121, 31]
                },
                'max_speed': 300,
                'max_distance': 400,
                'capacity': ['A', 'C']
            };

            collection.insert(orig_doc)
                .then(_ => {
                    request(app)
                        .put('/uav/feid_11223344')
                        .type('json')
                        .send({'lng': 100, 'max_speed': 100})
                        .expect(200)
                        .end((err, _) => {
                            should.not.exist(err);
                            collection.findOne({'id': 'feid_11223344'}, {}, (error, data) => {
                                should.not.exist(error);
                                expect(data).to.include({'max_speed': 100, 'max_distance': 400});
                                expect(data).to.deep.nested.property('position.coordinates', [100, 31]);
                                done();
                            });
                        });
                });
        });

        it('an non-exist UAV', done => {
            request(app)
                .put('/uav/feid_00000000')
                .type('json')
                .send({'lng': 100, 'lat': 30, 'max_speed': 100})
                .expect(404)
                .end((err, _) => {
                    should.not.exist(err);
                    done();
                });
        });
    });

    describe('Delete...', () => {
        const docs = [{
            'id': 'feid_22334455', 'name': 'name of UÅV',
            'lng': 121, 'lat': 31,
            'max_speed': 300, 'max_distance': 400,
            'capacity': ['A', 'C']
        }, {
            'id': 'feid_33445566', 'name': 'name of UÅV',
            'lng': 110, 'lat': 25,
            'max_speed': 300, 'max_distance': 400,
            'capacity': ['C', 'R']
        }, {
            'id': 'feid_44556677', 'name': 'name of UÅV',
            'lng': 100, 'lat': 20,
            'max_speed': 300, 'max_distance': 400,
            'capacity': ['R', 'A']
        }];

        it('an UAV', done => {
            collection.insertMany(docs)
                .then(() => {
                    request(app)
                        .delete('/uav/feid_22334455')
                        .expect(200)
                        .end((err, res) => {
                            should.not.exist(err);
                            expect(res.body).to.include({'deletedCount': 1});
                            collection.findOne({'id': 'feid_22334455'}, (e, r) => {
                                expect(r).to.eql(null);
                                done();
                            });
                        });
                });


        });

        it('multiple UAVs', done => {
            collection.insertMany(docs)
                .then(() => {
                    request(app)
                        .delete('/uav/feid_22334455,feid_00000000,feid_44556677')
                        .expect(200)
                        .end((err, res) => {
                            should.not.exist(err);
                            expect(res.body).to.include({'deletedCount': 2});
                            done();
                        });
                });
        });
    });
});
