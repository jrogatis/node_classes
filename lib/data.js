/* library for storing and editing data*/

//Dependencies

const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

//Container for the module
const lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname, '/../.data/');

//Write data to a file
lib.create = (dir, file, data, callback) => {
  // open the file for writing
  fs.open(
    lib.baseDir + dir + '/' + file + '.json',
    'wx',
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        // Convert data to string
        const stringData = JSON.stringify(data);
        // Write to file and close it
        fs.writeFile(fileDescriptor, stringData, err => {
          if (!err) {
            fs.close(fileDescriptor, err => {
              if (!err) {
                callback(false);
              } else {
                callback('Error closing new file');
              }
            });
          } else {
            callback('Err writing to new file');
          }
        });
      } else {
        callback('cold not create a new file, it may alredy exist');
      }
    }
  );
};

lib.read = (dir, file, callback) => {
  fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data) => {
    if (!err && data) {
      const parseData = helpers.parseJsonToObject(data);
      callback(false, parseData);
    } else {
      callback(err, data);
    }
  });
};

// Update data inside a file
lib.update = (dir, file, data, callback) => {
  // open the file for writing
  fs.open(
    lib.baseDir + dir + '/' + file + '.json',
    'r+',
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        const stringData = JSON.stringify(data);
        // truncate the file
        fs.ftruncate(fileDescriptor, err => {
          if (!err) {
            // Write and close file
            fs.writeFile(fileDescriptor, stringData, err => {
              if (!err) {
                fs.close(fileDescriptor, err => {
                  if (!err) {
                    callback(false);
                  } else {
                    callback('Error closing th file');
                  }
                });
              } else {
                callback('error writing to existing file');
              }
            });
          } else {
            callback('Err trunkating file');
          }
        });
      } else {
        callback('Could not open the file for updating, it may not exit yet');
      }
    }
  );
};

//delete a file
lib.delete = (dir, file, callback) => {
  // Unlink the file
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', err => {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting the file', err);
    }
  });
};

//Export
module.exports = lib;
