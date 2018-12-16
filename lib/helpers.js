// just helpers for varius tasks
const config = require('./config');
const crypto = require('crypto');
// container for helpers
const helpers = {};

helpers.hash = str => {
  if (typeof str === 'string' && str.length > 0) {
    const hash = crypto
      .createHash('sha256', config.hashingSecret)
      .update(str)
      .digest('hex');
    return hash;
  } else {
    return false;
  }
};

helpers.parseJsonToObject = string => {
  try {
    const str = JSON.parse(string);
    return str;
  } catch (e) {
    console.log('Err at parseJsonToObject', e);
    return {};
  }
};

helpers.createRandomString = strLength => {
  strLength =
    typeof strLength === 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    const possibeCharacters = 'abcefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (i = 1; i <= strLength; i++) {
      const randomCharacter = possibeCharacters.charAt(
        Math.floor(Math.random() * possibeCharacters.length)
      );

      str += randomCharacter;
    }
    return str;
  } else {
    return false;
  }
};

module.exports = helpers;
