const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const SleepSchema = mongoose.Schema({
  //hours: ,
  bedTime: {type: Date, required: true},
  awakeTime: {type: Date, default: Date.now, required: true},
  alarm: {type: Boolean, required: true},
  exercise: {type: Boolean, required: true},
  blueLight: {type: Boolean, required: true},
  caffeine: {type: Number, required: true},
  moodAtWake: {type: Number, required: true},
  moodAtSleep: {type: Number, required: true},
});

// SleepSchema.methods.apiRepr = function() {
//   return {
//     username: this.username || '',
//     firstName: this.firstName || '',
//     lastName: this.lastName || ''
//   };
// };

const Sleep = mongoose.model('Sleep', SleepSchema);

module.exports = {Sleep};
