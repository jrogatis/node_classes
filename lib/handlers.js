/* request Handlers
 */

//Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');
// Define all the handlers
const handlers = {};

//users
handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the users submethods
handlers._users = {};

//Users - post
// Required data: firstName, lastName, phone, password, tosAgreement

handlers._users.post = (data, callback) => {
  // Check that all required fiels are filled out
  const firstName =
    typeof data.payload.firstName === 'string' &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName === 'string' &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;

  const phone =
    typeof data.payload.phone === 'string' &&
    data.payload.phone.trim().length === 10
      ? data.payload.phone.trim()
      : false;

  const password =
    typeof data.payload.password === 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  const tosAgreement =
    typeof data.payload.tosAgreement === 'boolean' &&
    data.payload.tosAgreement === true;

  if (firstName && lastName && phone && password && tosAgreement) {
    // make sure that the user dosent alredy exist
    _data.read('users', phone, (error, data) => {
      if (error) {
        // hash the password
        const hashedPassword = helpers.hash(password);
        if (hashedPassword) {
          // create the user object
          const userObject = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            tosAgreement: true
          };
          _data.create('users', phone, userObject, err => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: 'Could not create the new user' });
            }
          });
        } else {
          callback(500, { Error: 'Cold not hash a password ' });
        }
      } else {
        // user alredy exists
        callback(400, { Error: 'User with that phone number alredy exists' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required fields' });
  }
};

//Users - get
handlers._users.get = (data, callback) => {
  // Check phone is valid
  const phone =
    typeof data.queryStringObject.phone === 'string' &&
    data.queryStringObject.phone.trim().length === 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        // Remove password
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

//Users - put
handlers._users.put = (data, callback) => {
  const firstName =
    typeof data.payload.firstName === 'string' &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName === 'string' &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;

  const phone =
    typeof data.payload.phone === 'string' &&
    data.payload.phone.trim().length === 10
      ? data.payload.phone.trim()
      : false;

  const password =
    typeof data.payload.password === 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  if (phone) {
    if (firstName || lastName || password) {
      //lookup user
      _data.read('users', phone, (err, userData) => {
        if (!err && userData) {
          // update the fields
          if (firstName) userData.firstName = firstName;
          if (lastName) userData.lastName = lastName;
          if (password) userData.hashedPassword = helpers.hash(password);
          // store the new updates
          _data.update('users', phone, userData, err => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: 'Colud not update the user' });
            }
          });
        } else {
          callback(400, { Error: 'The user does not exist' });
        }
      });
    } else {
      callback(400, { Error: 'Missing required fields to update' });
    }
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

//Users - delete
handlers._users.delete = (data, callback) => {
  const phone =
    typeof data.queryStringObject.phone === 'string' &&
    data.queryStringObject.phone.trim().length === 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        _data.delete('users', phone, err => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: 'Colod not delete the user' });
          }
        });
      } else {
        callback(400, { Error: 'Dont find the user' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

//tokebs
handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._tokens = {};

handlers._tokens.post = (data, callback) => {
  const phone =
    typeof data.payload.phone === 'string' &&
    data.payload.phone.trim().length === 10
      ? data.payload.phone.trim()
      : false;

  const password =
    typeof data.payload.password === 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  if (phone && password) {
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        const hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.hashedPassword) {
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 100 * 60 * 60;
          const tokenObject = {
            phone,
            id: tokenId,
            expires
          };
          //Store the token
          _data.create('tokens', tokenId, tokenObject, err => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { Error: 'Could not create a token' });
            }
          });
        } else {
          callback(400, { Error: 'Password did not match' });
        }
      } else {
        callback(400, { Error: 'Colud not find the user' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

handlers._tokens.get = (data, callback) => {};

handlers._tokens.put = (data, callback) => {};

handlers._tokens.delete = (data, callback) => {};

// Ping handler
handlers.ping = (data, callback) => {
  callback(200);
};

// Not-Found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

// export module

module.exports = handlers;
