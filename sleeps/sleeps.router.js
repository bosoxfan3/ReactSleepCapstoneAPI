const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const {Sleep} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();
const authenticate = passport.authenticate('jwt', {session: false});
//Remove when testing in postman and then add again

router.get('/', (req, res) => {
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

router.delete('/:date', (req, res) => {
  console.log(req.params.date);
  Sleep
    .findOneAndRemove({date: req.params.date})
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.put('/:date', jsonParser, (req, res) => {
  console.log(req.params.date);
  if (!(req.params.date && req.body.date && req.params.date === req.body.date)) {
    const message = (
      `Request path date (${req.params.date}) and request body date` +
      `(${req.body.date}) must match`);
    console.error(message);
    return res.status(400).json({message: message});
  }
  const toUpdate = {};
  const updateableFields = ['date', 'bedTime', 'awakeTime', 'alarm', 'exercise', 'blueLight', 'caffeine', 'moodAtWake', 'moodAtSleep'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });
  Sleep
    .findOneAndUpdate({date: req.params.date}, {$set: toUpdate})
    .then(sleep => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.post('/add/new', jsonParser, (req, res) => {
  res.send(req.body);
  const requiredFields = ['date', 'bedTime', 'awakeTime', 'alarm', 'exercise', 'blueLight', 'caffeine', 'moodAtWake', 'moodAtSleep'];
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
      date: req.body.date,
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

//Will need post and delete and such

module.exports = router;
