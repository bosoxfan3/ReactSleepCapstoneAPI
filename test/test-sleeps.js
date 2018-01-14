const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const faker = require('faker');
const mongoose = require('mongoose');

const {app, runServer, closeServer} = require('../server');
const {User} = require('../users');
const {Sleep} = require('../sleeps');
const {JWT_SECRET, TEST_DATABASE_URL} = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

const username = 'exampleUser';
const password = 'examplePass';
const firstName = 'Example';
const lastName = 'User';
let id;

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

describe('Sleep endpoints', function() {
  before(function() {
    console.log('BEFORE');
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    console.log('BEFORE EACH');
    let user = User.hashPassword(password)
      .then(password => User.create({
        username,
        password,
        firstName,
        lastName
      })
      )
      .then(_user => id = _user.id)
      .then(() => seedSleepData())
      .catch(err => console.log(err));
  });

  function seedSleepData() {
    console.info('seeding sleep data');
    const seedData = [];
    for (let i = 1; i <= 10; i++) {
      seedData.push({
        bedTime: faker.date.between('2017-01-01', '2017-01-31'),
        awakeTime: faker.date.between('2017-02-01', '2017-02-28'),
        alarm: faker.random.boolean(),
        exercise: faker.random.boolean(),
        blueLight: faker.random.boolean(),
        caffeine: Math.floor(Math.random() * 5) + 1,
        moodAtWake: Math.floor(Math.random() * 10) + 1,
        moodAtSleep: Math.floor(Math.random() * 10) + 1,
        user: id
      });
    }
    return Sleep.insertMany(seedData);
  }

  afterEach(function () {
    console.log('AFTER EACH');
    let user = User.hashPassword(password)
      .then(password => User.create({
        username,
        password,
        firstName,
        lastName
      })
      )
      .then(_user => id = _user.id)
      .then(tearDownDb());
  });

  after(function() {
    return closeServer();
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
    // it('should update submitted fields', function() {
    //   const token = jwt.sign(
    //     {
    //       user: {
    //         username,
    //         firstName,
    //         lastName,
    //         id
    //       }
    //     },
    //     JWT_SECRET,
    //     {
    //       algorithm: 'HS256',
    //       subject: username,
    //       expiresIn: '7d'
    //     }
    //   );
    //   const updateData = {
    //     alarm: true,
    //     exercise: true,
    //     blueLight: true,
    //     caffeine: 1,
    //     moodAtWake: 1,
    //     moodAtSleep: 1,
    //   };
    //   return Sleep
    //     .findOne()
    //     .then(sleep => {
    //       console.log(sleep);
    //       updateData.id = sleep.id;
    //       return chai
    //         .request(app)
    //         .put(`/api/sleeps/${sleep.id}`)
    //         .set('authorization', `Bearer ${token}`)
    //         .send(updateData);
    //     })
    //     .then(res => {
    //       expect(res).to.have.status(204);
    //       return Sleep.findById(updateData.id);
    //     })
    //     .then(sleep => {
    //       expect(sleep.alarm).to.equal(updateData.alarm);
    //       expect(sleep.exercise).to.equal(updateData.exercise);
    //       expect(sleep.blueLight).to.equal(updateData.blueLight);
    //       expect(sleep.caffeine).to.equal(updateData.caffeine);
    //       expect(sleep.moodAtWake).to.equal(updateData.moodAtWake);
    //       expect(sleep.moodAtSleep).to.equal(updateData.moodAtSleep);
    //     });
    // });
    // it('Should reject requests with an expired token', function() {
    //   const token = jwt.sign(
    //     {
    //       user: {
    //         username,
    //         firstName,
    //         lastName
    //       },
    //       exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
    //     },
    //     JWT_SECRET,
    //     {
    //       algorithm: 'HS256',
    //       subject: username
    //     }
    //   );
    //   return chai
    //     .request(app)
    //     .get('/api/sleeps/')
    //     .set('authorization', `Bearer ${token}`)
    //     .then(() =>
    //       expect.fail(null, null, 'Request should not succeed')
    //     )
    //     .catch(err => {
    //       if (err instanceof chai.AssertionError) {
    //         throw err;
    //       }

    //       const res = err.response;
    //       expect(res).to.have.status(401);
    //     });
    // });

    // it('Should send sleep data for that user on GET request', function() {
    //   const token = jwt.sign(
    //     {
    //       user: {
    //         username,
    //         firstName,
    //         lastName,
    //         id
    //       }
    //     },
    //     JWT_SECRET,
    //     {
    //       algorithm: 'HS256',
    //       subject: username,
    //       expiresIn: '7d'
    //     }
    //   );
    //   return chai
    //     .request(app)
    //     .get('/api/sleeps')
    //     .set('authorization', `Bearer ${token}`)
    //     .then(res => {
    //       expect(res).to.have.status(200);
    //       expect(res.body).to.be.an('array');
    //       expect(res.body.length).to.equal(10);
    //     });
    // });
    // it('Should return sleeps with all the right fields', function() {
    //   const token = jwt.sign(
    //     {
    //       user: {
    //         username,
    //         firstName,
    //         lastName,
    //         id
    //       }
    //     },
    //     JWT_SECRET,
    //     {
    //       algorithm: 'HS256',
    //       subject: username,
    //       expiresIn: '7d'
    //     }
    //   );
    //   return chai
    //     .request(app)
    //     .get('/api/sleeps')
    //     .set('authorization', `Bearer ${token}`)
    //     .then(res => {
    //       res.body.forEach(function(sleep) {
    //         expect(sleep).to.be.an('object');
    //         expect(sleep).to.have.all.keys('bedTime', 'awakeTime', 'alarm', 'exercise', 'blueLight', 'caffeine', 'moodAtWake', 'moodAtSleep', 'user');
    //       });
    //     });
    // });

    it('Should send sleep data with specific id on GET/:id request', function() {
      console.log('STARTING TEST');
      let searchId;
      const token = jwt.sign(
        {
          user: {
            username,
            firstName,
            lastName,
            id
          }
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username,
          expiresIn: '7d'
        }
      );
      return Sleep
        .findOne()
        .then(sleep => {
          console.log(sleep);
          searchId = sleep.id;
          return chai
            .request(app)
            .get(`/api/sleeps/${searchId}`)
            .set('authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
        });
    });
    // it('should add a new sleep', function() {
    //   const newSleep = {
    //     bedTime: faker.date.between('2017-01-01', '2017-01-31'),
    //     awakeTime: faker.date.between('2017-02-01', '2017-02-28'),
    //     alarm: faker.random.boolean(),
    //     exercise: faker.random.boolean(),
    //     blueLight: faker.random.boolean(),
    //     caffeine: Math.floor(Math.random() * 5) + 1,
    //     moodAtWake: Math.floor(Math.random() * 10) + 1,
    //     moodAtSleep: Math.floor(Math.random() * 10) + 1,
    //     user: id
    //   };
    //   const token = jwt.sign(
    //     {
    //       user: {
    //         username,
    //         firstName,
    //         lastName,
    //         id
    //       }
    //     },
    //     JWT_SECRET,
    //     {
    //       algorithm: 'HS256',
    //       subject: username,
    //       expiresIn: '7d'
    //     }
    //   );
    //   return chai
    //     .request(app)
    //     .post('/api/sleeps/')
    //     .set('authorization', `Bearer ${token}`)
    //     .send(newSleep)
    //     .then(res => {
    //       expect(res).to.have.status(201);
    //       expect(res).to.be.json;
    //       expect(res.body).to.be.an('object');
    //       expect(res.body).to.have.all.keys('bedTime', 'awakeTime', 'alarm', 'exercise', 'blueLight', 'caffeine', 'moodAtWake', 'moodAtSleep', 'date', 'hours', 'id');  
    //       expect(res.body.alarm).to.equal(newSleep.alarm);
    //       expect(res.body.exercise).to.equal(newSleep.exercise);
    //       expect(res.body.blueLight).to.equal(newSleep.blueLight);
    //       expect(res.body.caffeine).to.equal(newSleep.caffeine);
    //       expect(res.body.moodAtWake).to.equal(newSleep.moodAtWake);
    //       expect(res.body.moodAtSleep).to.equal(newSleep.moodAtSleep);
    //       expect(res.body.id).to.not.equal(null);          
    //     });
    // });
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
    it('should delete a post by id', function() {
      let sleep;
      const token = jwt.sign(
        {
          user: {
            username,
            firstName,
            lastName,
            id
          }
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username,
          expiresIn: '7d'
        }
      );
      return Sleep
        .findOne()
        .then(_sleep => {
          sleep = _sleep;
          return chai
            .request(app)
            .delete(`/api/sleeps/${sleep.id}`)
            .set('authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          return Sleep.findById(sleep.id);
        })
        .then(_sleep => {
          expect(_sleep).to.not.exist;
        });
    });
  });
});
