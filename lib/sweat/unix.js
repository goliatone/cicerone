var child_process, rindle, _;

child_process = require('child_process');

rindle = require('rindle');

exports.executeWithPrivileges = function(command, callback) {
  var spawn;
  if (command == null) {
    throw new Error('Missing command argument');
  }
  if (!Array.isArray(command)) {
    throw new Error('Invalid command argument: not an array');
  }
  if (!command) {
    throw new Error('Invalid command argument: empty array');
  }
  if (callback == null) {
    throw new Error('Missing callback argument');
  }
  if (typeof callback !== 'function') {
    throw new Error('Invalid callback argument: not a function');
  }
  if(process.env.NODE_ENV === 'test'){
      spawn = child_process.spawn(command.shift(), command, {
        stdio: 'inherit'
      });
  } else {
      spawn = child_process.spawn('sudo', command, {
          stdio: 'inherit'
      });
  }

  return rindle.wait(spawn).nodeify(callback);
};
