const {router} = require('./auth.router');
const {basicStrategy, jwtStrategy} = require('./strategies');

module.exports = {router, basicStrategy, jwtStrategy};