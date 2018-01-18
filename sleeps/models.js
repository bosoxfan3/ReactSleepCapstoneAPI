const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const SleepSchema = mongoose.Schema({
  bedTime: {type: Date, required: true},
  awakeTime: {type: Date, default: Date.now, required: true},
  alarm: {type: Boolean, required: true},
  exercise: {type: Boolean, required: true},
  blueLight: {type: Boolean, required: true},
  caffeine: {type: Number, required: true},
  moodAtWake: {type: Number, required: true},
  moodAtSleep: {type: Number, required: true},
  user: {type: mongoose.Schema.Types.ObjectId,ref: 'User'}
});

SleepSchema.virtual('hours').get(function() {
  return Math.abs(this.awakeTime - this.bedTime)/36e5;
});

SleepSchema.virtual('bedTimeMilitary').get(function() {
  let date = new Date(this.bedTime);
  let hours = date.getHours();
  let minutes = '0'+date.getMinutes();
  return hours+':'+minutes.substr(-2);
});

SleepSchema.virtual('awakeTimeMilitary').get(function() {
  let date = new Date(this.awakeTime);
  let hours = date.getHours();
  let minutes = '0'+date.getMinutes();
  return hours+':'+minutes.substr(-2);
});

SleepSchema.virtual('date').get(function() {
  let date = new Date(this.bedTime);
  let dateString = String(date);
  return dateString.slice(4, 15);
});

SleepSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    hours: this.hours,
    date: this.date,
    bedTime: this.bedTimeMilitary,
    awakeTime: this.awakeTimeMilitary,
    alarm: this.alarm,
    exercise: this.exercise,
    blueLight: this.blueLight,
    caffeine: this.caffeine,
    moodAtWake: this.moodAtWake,
    moodAtSleep: this.moodAtSleep
  };
};

const Sleep = mongoose.model('Sleep', SleepSchema);

module.exports = {Sleep};