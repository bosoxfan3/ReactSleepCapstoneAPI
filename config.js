exports.DATABASE_URL =
process.env.DATABASE_URL ||
global.DATABASE_URL ||
'mongodb://localhost/sleep';

exports.TEST_DATABASE_URL =
process.env.TEST_DATABASE_URL ||
global.TEST_DATABASE_URL ||
'mongodb://localhost/test-sleep';

exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET || 'donottellanyone';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';