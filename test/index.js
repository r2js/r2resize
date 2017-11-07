const chai = require('chai');
const request = require('supertest');
const r2base = require('r2base');
const r2resize = require('../index');

const expect = chai.expect;
process.chdir(__dirname);

const app = r2base();
app.start().serve(r2resize, { local: {}, host: { '127.0.0.1': ['h40'] } }).into(app);

describe('r2resize', () => {
  describe('resize local', () => {
    it('should get local file', (done) => {
      request(app)
        .get('/_i/r2-200.png')
        .send({})
        .expect(200)
        .end((err, res) => {
          expect(err).to.equal(null);
          expect(res.headers['content-type']).to.equal('image/png');
          expect(res.headers['content-length']).to.equal('2128');
          done();
        });
    });

    it('should resize local file', (done) => {
      request(app)
        .get('/_i/h40/r2-200.png')
        .send({})
        .expect(200)
        .end((err, res) => {
          expect(err).to.equal(null);
          expect(res.headers['content-type']).to.equal('image/png');
          expect(res.headers['content-length']).to.equal('918');
          done();
        });
    });

    it('should get 404 via empty path', (done) => {
      request(app)
        .get('/_i')
        .send({})
        .expect(404)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
    });

    it('should get 404 via invalid image size, production env', (done) => {
      app.set('env', 'production');
      request(app)
        .get('/_i/h80/r2-200.png')
        .send({})
        .expect(404)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
    });
  });
});
