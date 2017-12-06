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
    .then(sleeps => res.json(sleeps.map(sleep => sleep)))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

//Will need post and delete and such
//Reference BlogMongooseAPI

module.exports = router;
