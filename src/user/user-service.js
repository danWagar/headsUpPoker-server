/* eslint-disable strict */
const xss = require('xss');
const bcrypt = require('bcryptjs');
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[0-9])[\S]+/;

const UsersService = {
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password must be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'Password must be less than 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain letters and at least one number';
    }
    return null;
  },
  serializeUser(user) {
    return {
      id: user.id,
      user_name: xss(user.user_name),
      date_created: new Date(user.date_created)
    };
  },
  hasUserWithUserName(db, user_name) {
    return db('users')
      .where({ user_name })
      .first()
      .then(user => !!user);
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(([user]) => user)
      .then(user => user);
  }
};

module.exports = UsersService;
