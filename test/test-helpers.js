const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      users, game, hand
      RESTART IDENTITY CASCADE`
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db
    .into('users')
    .insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    );
}

function seedGame(db, player1, player2) {
  const stackSize = 2000;
  const newGame = {
    player1_id: player1.id,
    player2_id: player2.id,
    player1_stack: stackSize,
    player2_stack: stackSize
  };
  return db.into('game').insert(newGame);
}

function seedHand(db) {
  const newHand = {
    game_id: 1,
    player1_hand1: '2d',
    player1_hand2: '2c',
    player2_hand1: 'Ks',
    player2_hand2: 'As',
    flop_1: 'Jh',
    flop_2: '8d',
    flop_3: '5s',
    turn: '3c',
    river: '5d'
  };

  return db.into('hand').insert(newHand);
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256'
  });
  return `Bearer ${token}`;
}

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 2,
      user_name: 'test-user-2',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 3,
      user_name: 'test-user-3',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 4,
      user_name: 'test-user-4',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z'
    }
  ];
}

module.exports = {
  makeUsersArray,
  cleanTables,
  makeAuthHeader,
  seedUsers,
  seedGame,
  seedHand
};
