const configer = require('../../helper/configer');
const chai = require('chai');

const request = require('supertest');
const app = require('../../app.js');
let should = chai.should();
let expect = chai.expect;

const MongoClient = require('mongodb').MongoClient;

describe('CURD of UAVs', () => {

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


    it('Add an UAV', done => {
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
                    expect(data.position).to.eql({'type': 'Point', 'coordinates': [121, 31]});
                    expect(data.capacity).to.eql(['A', 'C']);
                    done();
                });
            });
    });

    describe('Add many UAVs', () => {
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

        it('should fail with duplicate id', done => {
            const docs = [{
                'id': 'feid_22334455', 'name': 'name of UÅV',
                'lng': 121, 'lat': 31,
                'max_speed': 300, 'max_distance': 400,
                'capacity': ['A', 'C']
            }, {
                'id': 'feid_22334455', 'name': 'name of UÅV',
                'lng': 110, 'lat': 25,
                'max_speed': 300, 'max_distance': 400,
                'capacity': ['C', 'R']
            }];

            request(app)
                .post('/uav')
                .type('json')
                .send(docs)
                .expect(400)
                .end(done);
        });
    });

    it('Get All UAVs', (done) => {
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

        collection.insertMany(docs)
            .then(() => {
                request(app)
                    .get('/uav')
                    .expect(200)
                    .end((err, res) => {
                        should.not.exist(err);
                        expect(JSON.parse(res.text)).to.have.lengthOf(3);
                        done();
                    });
            });


    });

    it('Get one UAV', done => {
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

        collection.insertMany(docs)
            .then(() => {
                request(app)
                    .get('/uav/feid_33445566')
                    .expect(200)
                    .end((err, res) => {
                        should.not.exist(err);
                        let doc = JSON.parse((res.text));
                        expect(doc).to.be.a('Object');
                        expect(doc).to.include({'lng': 110});
                        done();
                    });
            });
    });

});
