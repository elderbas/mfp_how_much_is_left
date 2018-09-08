const mfp = require('mfp');
const moment = require('moment');
const c = require('chalk');
const fs = require('fs');


const config = require('./config')

const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
const DAILY_CALORIE_LIMIT = 1800;
const cheatDays = config.cheatDays || [];

getCalsFromPreviousDays()

function getCalsFromPreviousDays() {
  
  
  mfp.fetchDateRange(
    config.userName,
    config.startDate,
    yesterday,
    ['calories'],
    function(data) {
      const calsRolledOver = getCaloriesRolledOver(data.data);
      logOutput(calsRolledOver);
  });
}

function getCaloriesRolledOver(data) {
  const caloriesLeft = data.reduce((sum, obj) => {
    if (cheatDays.includes(obj.date)) {
      return sum;
    }
    const net = obj.calories - config.dailyCalorieLimit - obj.caloriesFromExercise;
    return sum + net;
  }, 0);
  return caloriesLeft;
}

function logOutput(calsRolledOver) {
  if (calsRolledOver < 0) {
    console.log(`You have ${c.green(Math.abs(calsRolledOver))} calories available to use from previous days`); // eslint-disable-line
  }
  else {
    console.log(`You owe ${c.red.bgWhite(calsRolledOver)} calories from previous days`); // eslint-disable-line
  }
}






























