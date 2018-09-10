#! /usr/local/bin/node

const mfp = require('mfp');
const moment = require('moment');
const c = require('chalk');
const fs = require('fs');


const config = require('./config')

const cheatDays = config.cheatDays || [];


let endDate;
switch(config.endPeriodDefault) {
  case 'yesterday': {
    endDate = moment().subtract(1, 'day');
    break;
  }
  case 'today': {
    endDate = moment();
    break;
  }
  case 'week': {
    endDate = moment().endOf('week');
    break;
  }
}

getCalsFromPreviousDays()

function getCalsFromPreviousDays() {
  mfp.fetchDateRange(
    config.userName,
    config.startDate,
    endDate.format('YYYY-MM-DD'),
    ['calories'],
    function(data) {
      const calsRolledOver = getCaloriesRolledOver(data.data);
      const result = calsRolledOver + addCalsForFutureDays();
      logOutput(result);
  });
}

function addCalsForFutureDays() {
  const today = moment();
  if (config.endPeriodDefault === 'week' && (endDate > today)) {
    const numDaysToAddFor = endDate.diff(today, 'days');
    return -(numDaysToAddFor * config.dailyCalorieLimit);
  }
  return 0;
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
  const isNegative = calsRolledOver < 0;
  const isNegativeNumberFormated = c.green(Math.abs(calsRolledOver));
  const isPositiveNumberFormated = c.red.bgWhite(calsRolledOver);
  switch(config.endPeriodDefault {
    case 'yesterday': {
      if (isNegative) {
        console.log(`You have ${isNegativeNumberFormated} calories available to use from previous days`); // eslint-disable-line
      }
      else {
        console.log(`You owe ${isPositiveNumberFormated} calories from previous days`); // eslint-disable-line
      }
      break;
    }
    case 'today': {
      if (isNegative) {
        console.log(`You have ${isNegativeNumberFormated} calories available to use until end of today`); // eslint-disable-line
      }
      else {
        console.log(`You owe ${isPositiveNumberFormated} calories up until tonight.`); // eslint-disable-line
      }
      break;
    }
    case 'week': {
      if (isNegative) {
        console.log(`You have ${isNegativeNumberFormated} calories available to use until end of week`); // eslint-disable-line
      }
      else {
        console.log(`You owe ${isPositiveNumberFormated} calories up until end of week`); // eslint-disable-line
      }
      break;
    }
    default: {
      console.log('Error with end period type'); // eslint-disable-line
    }
  }
}






























