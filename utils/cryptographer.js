var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

function hash(str) {
  return bcrypt.hashSync(str, salt);
}

function compare(str1, str2) {
  return bcrypt.compareSync(str1, str2);
}

module.exports = { hash, compare };
