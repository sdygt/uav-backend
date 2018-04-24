const request = require('supertest');
const app = require('../../app.js');

describe('Root', function () {
    it('is not implemented', function (done) {
        request(app)
            .get('/')
            .expect(500)
            .end(done);
    });
});
