const request = require('supertest');
const app = require('../../app.js');

describe('/', function () {
    it('expect 204', function (done) {
        request(app)
            .get('/')
            .expect(204)
            .end(done);
    });
});
