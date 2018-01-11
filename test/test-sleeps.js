global.DATABASE_URL = 'mongodb://localhost/jwt-auth-demo-test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const {app, runServer, closeServer} = require('../server');
const {User} = require('../users');
const {Sleep} = require('../sleeps');
const {JWT_SECRET} = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Sleep endpoints', function() {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';

  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function() {
    let user = User.hashPassword(password).then(password =>
      User.create({
        username,
        password,
        firstName,
        lastName
      })
    );
    // Sleep.create({
    //   bedTime: new Date('January 1, 2017 22:00:00'),
    //   awakeTime: new Date('January 2, 2017 06:00:00'),
    //   alarm: false,
    //   exercise: false,
    //   blueLight: false,
    //   caffeine: 1,
    //   moodAtWake: 1,
    //   moodAtSleep: 1,
    //   user: user
    // });
    return user;
  });

  afterEach(function() {
    return User.remove({});
  });

  describe('/api/sleeps', function() {
    it('Should reject requests with no credentials', function() {
      return chai
        .request(app)
        .get('/api/sleeps/')
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(401);
        });
    });

    it('Should reject requests with an invalid token', function() {
      const token = jwt.sign(
        {
          username,
          firstName,
          lastName
        },
        'wrongSecret',
        {
          algorithm: 'HS256',
          expiresIn: '7d'
        }
      );
      return chai
        .request(app)
        .get('/api/sleeps/')
        .set('Authorization', `Bearer ${token}`)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with an expired token', function() {
      const token = jwt.sign(
        {
          user: {
            username,
            firstName,
            lastName
          },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username
        }
      );
      return chai
        .request(app)
        .get('/api/sleeps/')
        .set('authorization', `Bearer ${token}`)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should send sleep data for that user on GET request', function() {
      // const data = [{ 
      //   id: '5a316680e59825216a6465ad',
      //   hours: 9,
      //   date: 'Apr 04 2018',
      //   bedTime: '23:11',
      //   awakeTime: '8:11',
      //   alarm: false,
      //   exercise: false,
      //   blueLight: false,
      //   caffeine: 0,
      //   moodAtWake: 4,
      //   moodAtSleep: 3 
      // }];
      const token = jwt.sign(
        {
          user: {
            username,
            firstName,
            lastName
          }
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username,
          expiresIn: '7d'
        }
      );
      return chai
        .request(app)
        .get('/api/sleeps')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          console.log(res.body);
          expect(res.body).to.be.an('array');
          expect(res.body).to.deep.equal(data);
        });
    });
    it('Should send sleep data with specific id on GET/:id request', function() {
      const data = [{ 
        id: '5a316680e59825216a6465ad',
        hours: 9,
        date: 'Apr 04 2018',
        bedTime: '23:11',
        awakeTime: '8:11',
        alarm: false,
        exercise: false,
        blueLight: false,
        caffeine: 0,
        moodAtWake: 4,
        moodAtSleep: 3 
      }];
      const token = jwt.sign(
        {
          user: {
            username,
            firstName,
            lastName
          }
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username,
          expiresIn: '7d'
        }
      );
      return chai
        .request(app)
        .get(`/api/sleeps/${data._id}`)
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.deep.equal(data);
        });
    });
  });
});
