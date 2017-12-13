const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const {Sleep} = require('./models');

const router = express.Router();

// const jsonParser = bodyParser.json();
// const authenticate = passport.authenticate('jwt', {session: false});
//Remove when testing in postman and then add again

router.get('/', (req, res) => {
  console.log(req.user);
  return Sleep.find()
    .then(sleeps => {
      res.json(
        sleeps.map(
          (sleep) => sleep.apiRepr())
      );
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

router.delete('/:id', (req, res) => {
  console.log(req.params.id);
  Sleep
    .findOneAndRemove({_id: req.params.id})
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.put('/:id', (req, res) => {
  console.log(req.params.id);
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id` +
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).json({message: message});
  }
  const toUpdate = {};
  const updateableFields = ['bedTime', 'awakeTime', 'alarm', 'exercise', 'blueLight', 'caffeine', 'moodAtWake', 'moodAtSleep'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });
  Sleep
    .findOneAndUpdate({_id: req.params.id}, {$set: toUpdate})
    .then(sleep => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.post('/', (req, res) => {
  console.log('POST', req.body);
  const requiredFields = ['bedTime', 'awakeTime', 'alarm', 'exercise', 'blueLight', 'caffeine', 'moodAtWake', 'moodAtSleep'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  Sleep
    .create({
      bedTime: req.body.bedTime,
      awakeTime: req.body.awakeTime,
      alarm: req.body.alarm,
      exercise: req.body.exercise,
      blueLight: req.body.blueLight,
      caffeine: req.body.caffeine,
      moodAtWake: req.body.moodAtWake,
      moodAtSleep: req.body.moodAtSleep})
    .then(
      sleep => res.status(201).json(sleep.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

module.exports = router;
